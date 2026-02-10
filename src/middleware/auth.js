// Balgyn: JWT auth middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account is restricted' });
    }

    req.user = user; // mongoose doc
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { auth };
