// Balgyn: Apartment routes

const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const { validate } = require('../middleware/validate');
const { getAll, getById, create, update, remove } = require('../controllers/apartmentController');

const router = express.Router();

const apartmentSchema = Joi.object({
  title: Joi.string().min(4).max(120).required(),
  description: Joi.string().allow('').optional(),
  price: Joi.number().min(0).required(),
  type: Joi.string().valid('rent', 'sale').required(),
  city: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
  rooms: Joi.number().min(0).optional(),
  area: Joi.number().min(0).optional(),
  floor: Joi.number().min(0).optional(),
  imageUrl: Joi.string().uri().allow('').optional(),
  categoryId: Joi.string().allow(null, '').optional()
});

const apartmentUpdateSchema = apartmentSchema.fork(
  ['title', 'price', 'type'],
  (s) => s.optional()
);

router.get('/', optionalAuth, getAll);
router.get('/:id', optionalAuth, getById);
router.post('/', auth, validate(apartmentSchema), create);
router.put('/:id', auth, validate(apartmentUpdateSchema), update);
router.delete('/:id', auth, remove);

module.exports = router;
