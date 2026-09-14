const db = require('../models');
const Blockchain = require('../blockchain/Blockchain');
const { recordPaymentOnChain } = require('../utils/ethereum');
const { createNotification } = require('./notificationController');
const { createInstallmentAccount, allocatePayment } = require('../services/installmentService');
const { Op } = require('sequelize');

exports.create = async (req, res) => {
  try {
    const { listing_id, amount, payment_method, reference_number, buyer_id } = req.body;
    const listing = await db.LandListing.findByPk(listing_id);
    if (!listing || listing.archived) return res.status(404).json({ error: 'Listing not found' });

    if (req.user.role === 'seller' && listing.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only record payments for your own listings' });
    }

    let finalBuyerId = req.user.id;
    if (['seller', 'admin'].includes(req.user.role)) {
      if (!buyer_id) return res.status(400).json({ error: 'buyer_id is required' });
      finalBuyerId = buyer_id;
    }

    const transaction = await db.Transaction.create({
      listing_id,
      buyer_id: finalBuyerId,
      seller_id: listing.seller_id,
      amount,
      payment_method,
      reference_number,
      recorded_by: req.user.id
    });

    const blockchain = new Blockchain();
    await blockchain.loadChain();
    await blockchain.persistGenesisIfEmpty();
    await blockchain.addBlock(transaction.id);

    await transaction.update({ status: 'verified' });

    const totalPaid = await db.Transaction.sum('amount', {
      where: { listing_id: listing_id, status: 'verified' }
    }) || 0;
    if (Number(totalPaid) >= Number(listing.price)) {
      await listing.update({ status: 'sold' });
    } else if (listing.status === 'available') {
      await listing.update({ status: 'reserved' });
    }

    // Installment account: create after reservation fee is paid, then allocate this payment
    const reservationFee = Number(listing.reservation_fee || 0);
    let activeAccount = await db.InstallmentAccount.findOne({
      where: { listing_id: listing.id, status: { [Op.ne]: 'defaulted' } }
    });

    if (!activeAccount && reservationFee > 0 && Number(totalPaid) >= reservationFee && listing.assigned_buyer_id) {
      const txBeforeThis = Math.max(0, Number(totalPaid) - Number(amount));
      const reservationCoveredByThis = Math.max(0, Math.min(Number(amount), reservationFee - txBeforeThis));
      const amountForInstallment = Math.max(0, Number(amount) - reservationCoveredByThis);

      activeAccount = await createInstallmentAccount(listing, listing.assigned_buyer_id, new Date().toISOString().slice(0, 10));
      if (activeAccount && amountForInstallment > 0) {
        await allocatePayment(activeAccount.id, amountForInstallment);
      }
    } else if (activeAccount) {
      await allocatePayment(activeAccount.id, Number(amount));
    }

    // Notify both buyer and seller about the successful transaction
    const buyerUser  = await db.User.findByPk(finalBuyerId, { attributes: ['full_name'] });
    const sellerUser = await db.User.findByPk(listing.seller_id, { attributes: ['full_name'] });
    const paymentStatus = Number(totalPaid) >= Number(listing.price) ? 'fully paid' : 'partially paid';
    const notificationTitle = `Payment ${paymentStatus} for ${listing.title}`;

    await createNotification({
      user_id: finalBuyerId,
      title: notificationTitle,
      message: `You ${paymentStatus} ₱${Number(amount).toLocaleString()} for "${listing.title}".`,
      type: 'transaction',
      data: { transaction_id: transaction.id, listing_id: listing.id }
    });

    await createNotification({
      user_id: listing.seller_id,
      title: notificationTitle,
      message: `${buyerUser?.full_name || 'A buyer'} ${paymentStatus} ₱${Number(amount).toLocaleString()} for "${listing.title}".`,
      type: 'transaction',
      data: { transaction_id: transaction.id, listing_id: listing.id }
    });

    const buyer  = await db.User.findByPk(req.user.id,       { attributes: ['full_name'] });
    const seller = await db.User.findByPk(listing.seller_id, { attributes: ['full_name'] });
    const ethResult = await recordPaymentOnChain({
      listingId:     listing_id,
      transactionId: transaction.id,
      buyerName:     buyer?.full_name  || 'Unknown',
      sellerName:    seller?.full_name || 'Unknown',
      amountPhp:     amount,
      paymentMethod: payment_method
    });
    if (ethResult.success) {
      await transaction.update({ eth_tx_hash: ethResult.txHash });
      console.log(`[Ethereum] Payment recorded on Sepolia: ${ethResult.txHash}`);
    }

    res.json({ ...transaction.toJSON(), eth_tx_hash: ethResult.txHash || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const transactions = await db.Transaction.findAll({
      include: [
        { model: db.LandListing, as: 'listing', attributes: ['id', 'title', 'location_text', 'area_sqm', 'price', 'branch', 'status', 'lot_block_number'] },
        { model: db.User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone', 'photo_url'] },
        { model: db.User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'branch', 'photo_url'] },
        { model: db.User, as: 'recorder', attributes: ['id', 'full_name', 'email', 'role'] },
        { model: db.Block, as: 'block' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const where = req.user.role === 'seller'
      ? { seller_id: req.user.id }
      : { buyer_id: req.user.id };
    const transactions = await db.Transaction.findAll({
      where,
      include: [
        { model: db.LandListing, as: 'listing', where: { archived: false }, required: true, attributes: ['id', 'title', 'location_text', 'area_sqm', 'price', 'branch', 'status', 'lot_block_number'] },
        { model: db.User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone', 'photo_url'] },
        { model: db.User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'branch', 'photo_url'] },
        { model: db.User, as: 'recorder', attributes: ['id', 'full_name', 'email', 'role'] },
        { model: db.Block, as: 'block' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
