const db = require('../models');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const PROFILE_FIELDS = ['id', 'email', 'full_name', 'first_name', 'middle_name', 'last_name',
  'extension_name', 'role', 'phone', 'phone2', 'birthdate', 'address', 'branch',
  'occupation', 'spouse_first_name', 'spouse_middle_name', 'spouse_last_name',
  'spouse_extension_name', 'spouse_email', 'spouse_phone', 'spouse_occupation'];

const computeAge = (birthdate) => {
  if (!birthdate) return null;
  const today = new Date();
  const dob = new Date(birthdate);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  first_name: user.first_name,
  middle_name: user.middle_name,
  last_name: user.last_name,
  extension_name: user.extension_name,
  role: user.role,
  phone: user.phone,
  phone2: user.phone2,
  birthdate: user.birthdate,
  age: computeAge(user.birthdate),
  address: user.address,
  branch: user.branch,
  occupation: user.occupation,
  spouse_first_name: user.spouse_first_name,
  spouse_middle_name: user.spouse_middle_name,
  spouse_last_name: user.spouse_last_name,
  spouse_extension_name: user.spouse_extension_name,
  spouse_email: user.spouse_email,
  spouse_phone: user.spouse_phone,
  spouse_occupation: user.spouse_occupation
});

const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'Password must contain at least one number or special character';
  return '';
};

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, first_name, middle_name, last_name,
      extension_name, phone, phone2, birthdate, address, occupation,
      spouse_first_name, spouse_middle_name, spouse_last_name, spouse_extension_name,
      spouse_email, spouse_phone, spouse_occupation } = req.body;

    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ error: pwdError });

    const existing = await db.User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const password_hash = await hashPassword(password);
    const user = await db.User.create({
      email, password_hash, full_name, first_name, middle_name, last_name,
      extension_name, role: 'buyer', phone, phone2, birthdate, address, occupation,
      spouse_first_name, spouse_middle_name, spouse_last_name, spouse_extension_name,
      spouse_email, spouse_phone, spouse_occupation
    });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user: formatUser(user), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ user: formatUser(user), token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both current and new password are required' });
    const valid = await comparePassword(current_password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const pwdError = validatePassword(new_password);
    if (pwdError) return res.status(400).json({ error: pwdError });
    const password_hash = await hashPassword(new_password);
    await user.update({ password_hash });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { full_name, first_name, middle_name, last_name, extension_name,
      phone, phone2, birthdate, address, occupation,
      spouse_first_name, spouse_middle_name, spouse_last_name, spouse_extension_name,
      spouse_email, spouse_phone, spouse_occupation } = req.body;
    await user.update({ full_name, first_name, middle_name, last_name,
      extension_name, phone, phone2, birthdate, address, occupation,
      spouse_first_name, spouse_middle_name, spouse_last_name, spouse_extension_name,
      spouse_email, spouse_phone, spouse_occupation });
    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
