// Ayana: Request routes (contact owners)

const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createRequest, myRequests, incomingRequests, deleteRequest } = require('../controllers/requestController');

const router = express.Router();

const createSchema = Joi.object({
  name: Joi.string().allow('').optional(), // frontend sends name but we use req.user
  phone: Joi.string().min(3).max(40).required(),
  message: Joi.string().min(2).max(1000).required()
});

router.post('/apartments/:id/requests', auth, validate(createSchema), createRequest);
router.get('/requests/my', auth, myRequests);
router.get('/requests/incoming', auth, incomingRequests);
router.delete('/requests/:id', auth, deleteRequest);

module.exports = router;
