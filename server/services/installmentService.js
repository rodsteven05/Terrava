const db = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../controllers/notificationController');
const { sendEmail } = require('../utils/email');

const toNum = (val) => Number(val || 0);

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d.toISOString().slice(0, 10);
};

const getToday = () => new Date().toISOString().slice(0, 10);

const daysBetween = (start, end) => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
};

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const createInstallmentAccount = async (listing, buyerId, reservationPaymentDate) => {
  const existing = await db.InstallmentAccount.findOne({
    where: { listing_id: listing.id, status: { [Op.ne]: 'defaulted' } }
  });
  if (existing) return existing;

  const tcp = toNum(listing.total_contract_price || listing.price);
  const reservationFee = toNum(listing.reservation_fee);
  const minDownPct = toNum(listing.minimum_down_payment_pct);
  const downPaymentRequired = Math.round((tcp * (minDownPct / 100)) * 100) / 100;
  const termYears = listing.in_house_max_term_years || 5;
  const totalMonths = termYears * 12;
  const penaltyRate = toNum(listing.penalty_rate_pct) || 5;

  const balanceForMonthly = Math.max(tcp - reservationFee - downPaymentRequired, 0);
  const explicitMonthly = toNum(listing.monthly_payment_amount);
  const monthlyAmount = explicitMonthly > 0
    ? explicitMonthly
    : (totalMonths > 0 ? Math.round((balanceForMonthly / totalMonths) * 100) / 100 : 0);

  const startDate = addMonths(reservationPaymentDate, 1);
  const dueDay = Math.min(new Date(startDate + 'T00:00:00').getDate(), 28);
  const balanceAfterSchedule = monthlyAmount * totalMonths;

  const account = await db.InstallmentAccount.create({
    listing_id: listing.id,
    buyer_id: buyerId,
    seller_id: listing.seller_id,
    total_contract_price: tcp,
    reservation_fee: reservationFee,
    minimum_down_payment_pct: minDownPct,
    down_payment_required: downPaymentRequired,
    down_payment_paid: 0,
    balance_for_monthly: balanceAfterSchedule,
    monthly_payment_amount: monthlyAmount,
    term_years: termYears,
    total_months: totalMonths,
    start_date: startDate,
    due_day_of_month: dueDay,
    status: 'active',
    penalty_rate_pct: penaltyRate,
    total_paid: 0,
    total_principal_paid: 0,
    total_penalties_paid: 0,
    total_penalties_applied: 0,
    remaining_balance: tcp,
    next_due_date: startDate,
    assigned_at: new Date()
  });

  const amortizations = [];
  for (let i = 1; i <= totalMonths; i++) {
    const dueDate = addMonths(startDate, i - 1);
    amortizations.push({
      installment_account_id: account.id,
      month_number: i,
      due_date: dueDate,
      principal_amount: monthlyAmount,
      penalty_amount: 0,
      penalty_rate_pct: penaltyRate,
      amount_paid: 0,
      principal_paid: 0,
      penalty_paid: 0,
      status: i === 1 ? 'upcoming' : 'upcoming',
      days_overdue: 0
    });
  }
  await db.MonthlyAmortization.bulkCreate(amortizations);

  const buyer = await db.User.findByPk(buyerId, { attributes: ['id', 'full_name', 'email'] });
  await createNotification({
    user_id: buyerId,
    title: 'Installment schedule created',
    message: `Your installment account for "${listing.title}" has been created. Monthly payment: ${formatCurrency(monthlyAmount)} for ${totalMonths} months starting ${startDate}.`,
    type: 'transaction',
    data: { installment_account_id: account.id, listing_id: listing.id }
  });

  if (buyer?.email) {
    await sendEmail({
      to: buyer.email,
      subject: `Terrava Installment Schedule - ${listing.title}`,
      text: `Hi ${buyer.full_name || 'Buyer'},\n\nYour installment schedule for "${listing.title}" has been created.\nMonthly payment: ${formatCurrency(monthlyAmount)}\nTerm: ${termYears} year(s) (${totalMonths} months)\nFirst due date: ${startDate}\n\nPlease pay on time to avoid penalties.\n\nTerrava`,
      html: `<p>Hi ${buyer.full_name || 'Buyer'},</p><p>Your installment schedule for <strong>${listing.title}</strong> has been created.</p><ul><li>Monthly payment: <strong>${formatCurrency(monthlyAmount)}</strong></li><li>Term: <strong>${termYears} year(s)</strong> (${totalMonths} months)</li><li>First due date: <strong>${startDate}</strong></li></ul><p>Please pay on time to avoid penalties.</p><p>Terrava</p>`
    });
  }

  return account;
};

const allocatePayment = async (accountId, amount, paymentDate = getToday()) => {
  const account = await db.InstallmentAccount.findByPk(accountId, {
    include: [
      { model: db.LandListing, as: 'listing', attributes: ['id', 'title'] },
      { model: db.User, as: 'buyer', attributes: ['id', 'email', 'full_name'] }
    ]
  });
  if (!account) throw new Error('Installment account not found');
  if (account.status === 'defaulted') throw new Error('Account is defaulted');
  if (account.status === 'paid_off') throw new Error('Account is already paid off');

  let remaining = amount;
  const updatedAmortizations = [];

  const unpaid = await db.MonthlyAmortization.findAll({
    where: { installment_account_id: accountId, status: { [Op.ne]: 'paid' } },
    order: [['month_number', 'ASC']]
  });

  for (const month of unpaid) {
    if (remaining <= 0) break;

    const principalRemaining = toNum(month.principal_amount) - toNum(month.principal_paid);
    const penaltyRemaining = toNum(month.penalty_amount) - toNum(month.penalty_paid);

    const appliedPenalty = Math.min(remaining, penaltyRemaining);
    if (appliedPenalty > 0) {
      month.penalty_paid = toNum(month.penalty_paid) + appliedPenalty;
      remaining -= appliedPenalty;
    }

    const appliedPrincipal = Math.min(remaining, principalRemaining);
    if (appliedPrincipal > 0) {
      month.principal_paid = toNum(month.principal_paid) + appliedPrincipal;
      remaining -= appliedPrincipal;
    }

    month.amount_paid = toNum(month.amount_paid) + appliedPenalty + appliedPrincipal;
    if (toNum(month.principal_paid) >= toNum(month.principal_amount) &&
        toNum(month.penalty_paid) >= toNum(month.penalty_amount)) {
      month.status = 'paid';
      month.paid_at = paymentDate;
    }

    await month.save();
    updatedAmortizations.push(month);
  }

  const totalPenaltyApplied = toNum(await db.MonthlyAmortization.sum('penalty_amount', { where: { installment_account_id: accountId } }));
  const totalPrincipalPaid = toNum(await db.MonthlyAmortization.sum('principal_paid', { where: { installment_account_id: accountId } }));
  const totalPenaltyPaid = toNum(await db.MonthlyAmortization.sum('penalty_paid', { where: { installment_account_id: accountId } }));
  const totalPaid = totalPrincipalPaid + totalPenaltyPaid + toNum(account.down_payment_paid);

  const allMonths = await db.MonthlyAmortization.findAll({
    where: { installment_account_id: accountId },
    order: [['month_number', 'ASC']]
  });
  const nextUnpaid = allMonths.find((m) => m.status !== 'paid');
  const nextDueDate = nextUnpaid ? nextUnpaid.due_date : null;
  const remainingBalance = toNum(account.total_contract_price) - totalPrincipalPaid;
  const paidOff = remainingBalance <= 0.01;

  await account.update({
    total_paid: totalPaid,
    total_principal_paid: totalPrincipalPaid,
    total_penalties_paid: totalPenaltyPaid,
    total_penalties_applied: totalPenaltyApplied,
    remaining_balance: Math.max(remainingBalance, 0),
    next_due_date: nextDueDate,
    last_payment_date: paymentDate,
    status: paidOff ? 'paid_off' : account.status
  });

  if (paidOff) {
    const listing = account.listing;
    await db.LandListing.update({ status: 'sold' }, { where: { id: listing.id } });
    await createNotification({
      user_id: account.buyer_id,
      title: 'Installment fully paid',
      message: `Congratulations! Your installment for "${listing.title}" is now fully paid.`,
      type: 'transaction',
      data: { installment_account_id: account.id, listing_id: listing.id }
    });
    if (account.buyer?.email) {
      await sendEmail({
        to: account.buyer.email,
        subject: `Terrava - Installment Fully Paid`,
        text: `Hi ${account.buyer.full_name || 'Buyer'},\n\nCongratulations! Your installment for "${listing.title}" is now fully paid.`,
        html: `<p>Hi ${account.buyer.full_name || 'Buyer'},</p><p>Congratulations! Your installment for <strong>${listing.title}</strong> is now fully paid.</p><p>Terrava</p>`
      });
    }
  }

  return { account: await db.InstallmentAccount.findByPk(accountId), updatedAmortizations, overpayment: remaining };
};

const processOverdueAccounts = async () => {
  const today = getToday();
  const accounts = await db.InstallmentAccount.findAll({
    where: { status: { [Op.notIn]: ['defaulted', 'paid_off'] } },
    include: [
      { model: db.LandListing, as: 'listing', attributes: ['id', 'title', 'status'] },
      { model: db.User, as: 'buyer', attributes: ['id', 'email', 'full_name'] },
      { model: db.User, as: 'seller', attributes: ['id', 'email', 'full_name'] }
    ]
  });

  for (const account of accounts) {
    const overdueMonths = await db.MonthlyAmortization.findAll({
      where: {
        installment_account_id: account.id,
        status: { [Op.ne]: 'paid' },
        due_date: { [Op.lt]: today }
      },
      order: [['month_number', 'ASC']]
    });

    if (overdueMonths.length === 0) continue;

    let maxOverdueDays = 0;
    let accountStatus = 'active';
    let shouldDefault = false;

    for (const month of overdueMonths) {
      const days = daysBetween(month.due_date, today);
      month.days_overdue = days;
      maxOverdueDays = Math.max(maxOverdueDays, days);

      if (days >= 1 && days <= 30) {
        month.status = 'grace_period';
        if (!month.reminder_sent_at) {
          await sendReminder(account, month, 'grace');
          month.reminder_sent_at = new Date();
        }
      } else if (days >= 31 && days <= 60) {
        month.status = 'overdue';
        if (toNum(month.penalty_amount) === 0) {
          const rate = toNum(month.penalty_rate_pct) || toNum(account.penalty_rate_pct) || 5;
          const penalty = Math.round((toNum(month.principal_amount) * (rate / 100)) * 100) / 100;
          month.penalty_amount = penalty;
          await sendReminder(account, month, 'penalty');
        }
        if (!month.warning_sent_at) {
          month.warning_sent_at = new Date();
        }
      } else if (days >= 61 && days <= 90) {
        month.status = 'delinquent';
        if (!month.demand_letter_sent_at) {
          await sendReminder(account, month, 'demand');
          month.demand_letter_sent_at = new Date();
          await notifyAdmins(account, month);
        }
      } else if (days > 90) {
        month.status = 'defaulted';
        shouldDefault = true;
      }

      await month.save();
    }

    if (shouldDefault) {
      accountStatus = 'defaulted';
      await defaultAccount(account, today);
    } else if (maxOverdueDays >= 61) {
      accountStatus = 'delinquent';
    } else if (maxOverdueDays >= 31) {
      accountStatus = 'overdue';
    } else if (maxOverdueDays >= 1) {
      accountStatus = 'grace_period';
    }

    if (account.status !== accountStatus && !['defaulted', 'paid_off'].includes(account.status)) {
      await account.update({ status: accountStatus });
    }
  }

  return { processed: accounts.length };
};

const sendReminder = async (account, month, type) => {
  const buyer = account.buyer;
  const listing = account.listing;
  const dueDate = month.due_date;
  const amount = formatCurrency(month.principal_amount);
  const penalty = formatCurrency(month.penalty_amount);

  let title, message, subject, text, html;

  if (type === 'grace') {
    title = 'Payment reminder';
    message = `Your monthly payment of ${amount} for "${listing.title}" is due on ${dueDate}. Please pay on time to avoid penalties.`;
    subject = `Terrava Payment Reminder - ${listing.title}`;
    text = `Hi ${buyer?.full_name || 'Buyer'},\n\nYour monthly payment of ${amount} for "${listing.title}" is due on ${dueDate}. Please pay on time to avoid a ${account.penalty_rate_pct || 5}% penalty.\n\nTerrava`;
    html = `<p>Hi ${buyer?.full_name || 'Buyer'},</p><p>Your monthly payment of <strong>${amount}</strong> for <strong>${listing.title}</strong> is due on <strong>${dueDate}</strong>.</p><p>Please pay on time to avoid a <strong>${account.penalty_rate_pct || 5}%</strong> penalty.</p><p>Terrava</p>`;
  } else if (type === 'penalty') {
    title = 'Payment overdue - penalty applied';
    message = `Your payment for "${listing.title}" is ${month.days_overdue} days overdue. A penalty of ${penalty} has been added.`;
    subject = `Terrava Overdue Notice - ${listing.title}`;
    text = `Hi ${buyer?.full_name || 'Buyer'},\n\nYour payment for "${listing.title}" is ${month.days_overdue} days overdue. A penalty of ${penalty} has been added to your ledger.\n\nTerrava`;
    html = `<p>Hi ${buyer?.full_name || 'Buyer'},</p><p>Your payment for <strong>${listing.title}</strong> is <strong>${month.days_overdue} days overdue</strong>.</p><p>A penalty of <strong>${penalty}</strong> has been added to your ledger.</p><p>Terrava</p>`;
  } else {
    title = 'Delinquent account - demand letter';
    message = `Your account for "${listing.title}" is now delinquent. Please settle immediately to avoid contract cancellation.`;
    subject = `Terrava Delinquency Notice - ${listing.title}`;
    text = `Hi ${buyer?.full_name || 'Buyer'},\n\nYour account for "${listing.title}" is now delinquent (${month.days_overdue} days overdue). Please settle immediately to avoid contract cancellation.\n\nTerrava`;
    html = `<p>Hi ${buyer?.full_name || 'Buyer'},</p><p>Your account for <strong>${listing.title}</strong> is now delinquent (<strong>${month.days_overdue} days overdue</strong>).</p><p>Please settle immediately to avoid contract cancellation.</p><p>Terrava</p>`;
  }

  await createNotification({
    user_id: buyer.id,
    title,
    message,
    type: 'system',
    data: { installment_account_id: account.id, listing_id: listing.id, month_id: month.id, type }
  });

  if (buyer?.email) {
    await sendEmail({ to: buyer.email, subject, text, html });
  }
};

const notifyAdmins = async (account, month) => {
  const admins = await db.User.findAll({ where: { role: 'admin' }, attributes: ['id', 'email', 'full_name'] });
  const listing = account.listing;
  const title = 'Delinquent account flagged';
  const message = `${account.buyer?.full_name || 'Buyer'}'s account for "${listing.title}" is ${month.days_overdue} days overdue and flagged for manual review.`;

  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      title,
      message,
      type: 'system',
      data: { installment_account_id: account.id, listing_id: listing.id, buyer_id: account.buyer_id }
    });
    if (admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `Terrava Admin Alert - Delinquent Account`,
        text: `Hi ${admin.full_name || 'Admin'},\n\n${message}\n\nTerrava`,
        html: `<p>Hi ${admin.full_name || 'Admin'},</p><p>${message}</p><p>Terrava</p>`
      });
    }
  }
};

const defaultAccount = async (account, today) => {
  const listing = account.listing;
  await account.update({
    status: 'defaulted',
    defaulted_at: new Date(),
    remaining_balance: toNum(account.total_contract_price) - toNum(account.total_principal_paid)
  });
  await db.LandListing.update(
    { status: 'available', assigned_buyer_id: null },
    { where: { id: listing.id } }
  );

  await createNotification({
    user_id: account.buyer_id,
    title: 'Contract cancelled - account defaulted',
    message: `Your contract for "${listing.title}" has been cancelled due to non-payment. The lot has been reset to available.`,
    type: 'system',
    data: { installment_account_id: account.id, listing_id: listing.id }
  });

  if (account.buyer?.email) {
    await sendEmail({
      to: account.buyer.email,
      subject: `Terrava - Contract Cancelled`,
      text: `Hi ${account.buyer.full_name || 'Buyer'},\n\nYour contract for "${listing.title}" has been cancelled due to non-payment. The lot has been reset to available.\n\nTerrava`,
      html: `<p>Hi ${account.buyer.full_name || 'Buyer'},</p><p>Your contract for <strong>${listing.title}</strong> has been cancelled due to non-payment. The lot has been reset to available.</p><p>Terrava</p>`
    });
  }

  const admins = await db.User.findAll({ where: { role: 'admin' }, attributes: ['id', 'email', 'full_name'] });
  for (const admin of admins) {
    await createNotification({
      user_id: admin.id,
      title: 'Contract cancelled - lot reset',
      message: `${account.buyer?.full_name || 'Buyer'} defaulted on "${listing.title}". The lot status has been reset to available.`,
      type: 'system',
      data: { installment_account_id: account.id, listing_id: listing.id }
    });
    if (admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `Terrava Admin Alert - Contract Cancelled`,
        text: `Hi ${admin.full_name || 'Admin'},\n\n${account.buyer?.full_name || 'Buyer'} defaulted on "${listing.title}". The lot status has been reset to available.\n\nTerrava`,
        html: `<p>Hi ${admin.full_name || 'Admin'},</p><p>${account.buyer?.full_name || 'Buyer'} defaulted on <strong>${listing.title}</strong>. The lot status has been reset to available.</p><p>Terrava</p>`
      });
    }
  }
};

module.exports = {
  createInstallmentAccount,
  allocatePayment,
  processOverdueAccounts,
  addMonths,
  getToday,
  daysBetween,
  formatCurrency
};
