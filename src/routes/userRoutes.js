// Balgyn: User routes

const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  email: Joi.string().email().optional()
});

// Backward compatible
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validate(updateSchema), updateProfile);

// Preferred
router.get('/me', auth, getProfile);
router.put('/me', auth, validate(updateSchema), updateProfile);

module.exports = router;
