// Ayana: Contact routes

const express = require('express');
const Joi = require('joi');
const { validate } = require('../middleware/validate');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().allow('').max(120).optional(),
  phone: Joi.string().allow('').max(40).optional(),
  email: Joi.string().email().allow('').max(160).optional(),
  message: Joi.string().min(2).max(2000).required()
});

router.post('/contact', validate(schema), submitContact);

module.exports = router;
