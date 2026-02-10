// Ayana: Admin routes

const express = require('express');
const Joi = require('joi');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { validate } = require('../middleware/validate');
const admin = require('../controllers/adminController');

const router = express.Router();

// Apartments moderation
router.get('/apartments', auth, requireAdmin, admin.listApartments);
router.patch('/apartments/:id/approve', auth, requireAdmin, admin.approveApartment);
router.patch('/apartments/:id/reject', auth, requireAdmin, admin.rejectApartment);
router.patch('/apartments/:id/hide', auth, requireAdmin, admin.hideApartment);
router.patch('/apartments/:id/unhide', auth, requireAdmin, admin.unhideApartment);
router.delete('/apartments/:id', auth, requireAdmin, admin.deleteApartment);

// Users
router.get('/users', auth, requireAdmin, admin.listUsers);

router.patch(
  '/users/:id/ban',
  auth,
  requireAdmin,
  validate(Joi.object({ isBanned: Joi.boolean().required() })),
  admin.setBan
);

router.patch(
  '/users/:id/role',
  auth,
  requireAdmin,
  validate(Joi.object({ role: Joi.string().valid('user', 'admin').required() })),
  admin.setRole
);

// Categories
router.get('/categories', auth, requireAdmin, admin.listCategories);
router.post(
  '/categories',
  auth,
  requireAdmin,
  validate(Joi.object({ name: Joi.string().min(2).max(80).required() })),
  admin.createCategory
);
router.put(
  '/categories/:id',
  auth,
  requireAdmin,
  validate(Joi.object({ name: Joi.string().min(2).max(80).required() })),
  admin.updateCategory
);
router.delete('/categories/:id', auth, requireAdmin, admin.deleteCategory);

// Reports
router.get('/reports', auth, requireAdmin, admin.listReports);
router.patch('/reports/:id/resolve', auth, requireAdmin, admin.resolveReport);
router.delete('/reports/:id', auth, requireAdmin, admin.deleteReport);

// Contact messages
router.get('/messages', auth, requireAdmin, admin.listContactMessages);
router.delete('/messages/:id', auth, requireAdmin, admin.deleteContactMessage);

// Stats
router.get('/stats', auth, requireAdmin, admin.stats);

module.exports = router;
