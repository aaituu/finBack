// Ayana: Reports routes (user)

const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createReport } = require('../controllers/reportController');

const router = express.Router();

const schema = Joi.object({
  reason: Joi.string().min(3).max(400).required()
});

router.post('/apartments/:id/reports', auth, validate(schema), createReport);

module.exports = router;
