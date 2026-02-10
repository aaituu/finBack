// Balgyn: Categories public routes

const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

router.get('/categories', async (_req, res) => {
  const items = await Category.find({}).sort({ name: 1 });
  return res.json({ items: items.map((c) => c.toJSON()) });
});

module.exports = router;
