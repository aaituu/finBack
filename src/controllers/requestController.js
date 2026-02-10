// Ayana: Contact requests logic

const Apartment = require('../models/Apartment');
const Request = require('../models/Request');
const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

async function createRequest(req, res) {
  const { id } = req.params;
  const apt = await Apartment.findById(id);
  if (!apt) return res.status(404).json({ message: 'Apartment not found' });
  if (apt.isHidden) return res.status(404).json({ message: 'Apartment not found' });

  const { phone, message } = req.body;

  const newReq = await Request.create({
    apartment: apt._id,
    fromUser: req.user._id,
    phone,
    message
  });

  // Optional email to owner (advanced)
  try {
    const owner = await User.findById(apt.owner);
    if (owner?.email) {
      await sendMail({
        to: owner.email,
        subject: `Rentify request: ${apt.title}`,
        text: `You have a new request for your listing "${apt.title}".\n\nFrom: ${req.user.name} (${req.user.email})\nPhone: ${phone}\nMessage: ${message}`
      });
    }
  } catch {
    // ignore email errors
  }

  return res.status(201).json({ success: true, request: newReq.toJSON() });
}

async function myRequests(req, res) {
  const items = await Request.find({ fromUser: req.user._id })
    .sort({ createdAt: -1 })
    .populate('apartment')
    .lean({ virtuals: true });

  const mapped = items.map((r) => {
    const id = r._id.toString();
    return { ...r, id };
  });

  return res.json({ items: mapped });
}

// Ayana: Incoming requests for apartment owners
async function incomingRequests(req, res) {
  const owned = await Apartment.find({ owner: req.user._id }).select('_id').lean();
  const aptIds = owned.map((a) => a._id);

  const items = await Request.find({ apartment: { $in: aptIds } })
    .sort({ createdAt: -1 })
    .populate('apartment')
    .populate('fromUser', 'name email role')
    .lean({ virtuals: true });

  const mapped = items.map((r) => ({ ...r, id: r._id.toString() }));
  return res.json({ items: mapped });
}

// Ayana: Owner can decline/delete an incoming request
async function deleteRequest(req, res) {
  const { id } = req.params;
  const r = await Request.findById(id).populate('apartment');
  if (!r) return res.status(404).json({ message: 'Request not found' });

  const apt = r.apartment;
  if (!apt) return res.status(404).json({ message: 'Request not found' });

  if (apt.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await Request.deleteOne({ _id: r._id });
  return res.status(204).send();
}

module.exports = { createRequest, myRequests, incomingRequests, deleteRequest };
