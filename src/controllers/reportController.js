// Ayana: User reports controller

const Report = require('../models/Report');
const Apartment = require('../models/Apartment');

async function createReport(req, res) {
  const { reason } = req.body;
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const report = await Report.create({
    apartment: apt._id,
    reporter: req.user._id,
    reason: String(reason || '').trim()
  });

  return res.status(201).json(report.toJSON());
}

module.exports = { createReport };
