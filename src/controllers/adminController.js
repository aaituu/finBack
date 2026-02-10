// Ayana: Admin moderation endpoints

const Apartment = require('../models/Apartment');
const User = require('../models/User');
const Category = require('../models/Category');
const Report = require('../models/Report');
const Request = require('../models/Request');
const ContactMessage = require('../models/ContactMessage');

async function listApartments(req, res) {
  const { status, hidden } = req.query;
  const q = {};
  if (status) q.status = status;
  if (hidden === 'true') q.isHidden = true;
  if (hidden === 'false') q.isHidden = false;

  const items = await Apartment.find(q).sort({ createdAt: -1 }).lean({ virtuals: true });
  const mapped = items.map((a) => ({
    ...a,
    id: a._id.toString(),
    ownerId: a.owner?.toString ? a.owner.toString() : a.owner,
    imageUrl: Array.isArray(a.images) && a.images.length ? a.images[0] : ''
  }));
  return res.json({ items: mapped });
}

async function approveApartment(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });
  apt.status = 'approved';
  apt.isHidden = false;
  await apt.save();
  return res.json(apt.toJSON());
}

async function rejectApartment(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });
  apt.status = 'rejected';
  await apt.save();
  return res.json(apt.toJSON());
}

async function hideApartment(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });
  apt.isHidden = true;
  await apt.save();
  return res.json(apt.toJSON());
}

async function unhideApartment(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });
  apt.isHidden = false;
  await apt.save();
  return res.json(apt.toJSON());
}

async function deleteApartment(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });
  await apt.deleteOne();
  return res.status(204).send();
}

// Users
async function listUsers(req, res) {
  // Do not show admins in the users table to avoid self-lockout.
  const items = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
  return res.json({ items: items.map((u) => u.toJSON()) });
}

async function setBan(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban admin' });
  user.isBanned = Boolean(req.body.isBanned);
  await user.save();
  return res.json(user.toJSON());
}

async function setRole(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot change role of admin' });
  const role = req.body.role;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  user.role = role;
  await user.save();
  return res.json(user.toJSON());
}

// Categories
async function listCategories(req, res) {
  const items = await Category.find({}).sort({ name: 1 });
  return res.json({ items: items.map((c) => c.toJSON()) });
}

async function createCategory(req, res) {
  const { name } = req.body;
  const exists = await Category.findOne({ name: String(name).trim() });
  if (exists) return res.status(400).json({ message: 'Category exists' });
  const c = await Category.create({ name: String(name).trim() });
  return res.status(201).json(c.toJSON());
}

async function updateCategory(req, res) {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.name = String(req.body.name || '').trim();
  await c.save();
  return res.json(c.toJSON());
}

async function deleteCategory(req, res) {
  const c = await Category.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  await c.deleteOne();
  return res.status(204).send();
}

// Reports
async function listReports(req, res) {
  const { status } = req.query;
  const q = {};
  if (status) q.status = status;

  const items = await Report.find(q)
    .sort({ createdAt: -1 })
    .populate('apartment')
    .populate('reporter');
  const mapped = items.map((r) => ({
    ...r.toJSON(),
    apartment: r.apartment ? r.apartment.toJSON() : null,
    reporter: r.reporter ? r.reporter.toJSON() : null
  }));
  return res.json({ items: mapped });
}

async function resolveReport(req, res) {
  const r = await Report.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Not found' });
  r.status = 'resolved';
  await r.save();
  return res.json(r.toJSON());
}

async function deleteReport(req, res) {
  const r = await Report.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Not found' });
  await r.deleteOne();
  return res.status(204).send();
}

// Contact messages (from /contact form)
async function listContactMessages(req, res) {
  const items = await ContactMessage.find({}).sort({ createdAt: -1 });
  return res.json({ items: items.map((m) => m.toJSON()) });
}

async function deleteContactMessage(req, res) {
  const m = await ContactMessage.findById(req.params.id);
  if (!m) return res.status(404).json({ message: 'Not found' });
  await m.deleteOne();
  return res.status(204).send();
}

// Stats
async function stats(req, res) {
  const [
    users,
    apartments,
    pending,
    approved,
    hidden,
    requests,
    openReports
  ] = await Promise.all([
    User.countDocuments({}),
    Apartment.countDocuments({}),
    Apartment.countDocuments({ status: 'pending' }),
    Apartment.countDocuments({ status: 'approved', isHidden: false }),
    Apartment.countDocuments({ isHidden: true }),
    Request.countDocuments({}),
    Report.countDocuments({ status: 'open' })
  ]);

  return res.json({
    users,
    apartments,
    pending,
    approvedVisible: approved,
    hidden,
    requests,
    openReports
  });
}

module.exports = {
  listApartments,
  approveApartment,
  rejectApartment,
  hideApartment,
  unhideApartment,
  deleteApartment,
  listUsers,
  setBan,
  setRole,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listReports,
  resolveReport,
  deleteReport,
  stats
  ,
  // Contact messages
  listContactMessages,
  deleteContactMessage
};
