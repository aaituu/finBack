// Balgyn: User profile endpoints

const User = require('../models/User');

async function getProfile(req, res) {
  return res.json(req.user.toJSON());
}

async function updateProfile(req, res) {
  const { name, email } = req.body;
  if (email) {
    const other = await User.findOne({ email });
    if (other && other._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }
  }

  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  await req.user.save();
  return res.json(req.user.toJSON());
}

module.exports = { getProfile, updateProfile };
