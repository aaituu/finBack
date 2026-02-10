// Balgyn: optional JWT auth (attaches req.user if token exists)

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) return next();

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) req.user = user;
  } catch {
    // ignore
  }
  next();
}

module.exports = { optionalAuth };
