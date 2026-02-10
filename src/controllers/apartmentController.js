// Balgyn: Apartment CRUD + filtering/sorting/pagination (with moderation)

const Apartment = require('../models/Apartment');

function buildSort(sort) {
  if (sort === 'price_asc') return { price: 1 };
  if (sort === 'price_desc') return { price: -1 };
  if (sort === 'newest') return { createdAt: -1 };
  return { createdAt: -1 };
}

async function getAll(req, res) {
  const {
    type,
    city,
    rooms,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10,
    owner,
    categoryId
  } = req.query;

  const q = {};

  if (type) q.type = type;
  if (city) q.city = { $regex: String(city), $options: 'i' };
  if (rooms) q.rooms = { $gte: Number(rooms) };
  if (categoryId) q.categoryId = categoryId;

  if (minPrice || maxPrice) {
    q.price = {};
    if (minPrice) q.price.$gte = Number(minPrice);
    if (maxPrice) q.price.$lte = Number(maxPrice);
  }

  // Owner filter
  if (owner === 'me') {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    q.owner = req.user._id;
  } else if (owner) {
    q.owner = owner;
  }

  const isAdmin = req.user?.role === 'admin';
  const isOwnerMe = owner === 'me';

  // Public listings: only approved and not hidden
  if (!isAdmin && !isOwnerMe) {
    // Treat legacy docs (created before moderation) as approved.
    // Also include docs where isHidden/status fields may not exist.
    q.isHidden = { $ne: true };
    q.$or = [{ status: 'approved' }, { status: { $exists: false } }];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Apartment.find(q).sort(buildSort(sort)).skip(skip).limit(limitNum).lean({ virtuals: true }),
    Apartment.countDocuments(q)
  ]);

  const mapped = items.map((a) => {
    const id = a._id.toString();
    return {
      ...a,
      id,
      ownerId: a.owner?.toString ? a.owner.toString() : a.owner,
      imageUrl: Array.isArray(a.images) && a.images.length ? a.images[0] : ''
    };
  });

  return res.json({ items: mapped, page: pageNum, limit: limitNum, total });
}

async function getById(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const isAdmin = req.user?.role === 'admin';
  const isOwner = req.user && apt.owner.toString() === req.user._id.toString();

  // hidden
  if (apt.isHidden && !isAdmin && !isOwner) return res.status(404).json({ message: 'Not found' });

  // moderation (legacy docs without status are treated as approved)
  if (apt.status && apt.status !== 'approved' && !isAdmin && !isOwner) {
    return res.status(404).json({ message: 'Not found' });
  }

  return res.json(apt.toJSON());
}

async function create(req, res) {
  const owner = req.user._id;
  const { imageUrl, categoryId, ...rest } = req.body;
  const images = imageUrl ? [imageUrl] : [];

  const apt = await Apartment.create({
    ...rest,
    images,
    owner,
    categoryId: categoryId || null,
    status: 'pending',
    isHidden: false
  });

  return res.status(201).json(apt.toJSON());
}

async function update(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const isAdmin = req.user.role === 'admin';
  const isOwner = apt.owner.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

  const { imageUrl, categoryId, ...rest } = req.body;

  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined) apt[k] = v;
  });

  if (categoryId !== undefined) apt.categoryId = categoryId || null;

  if (imageUrl !== undefined) {
    apt.images = imageUrl ? [imageUrl] : [];
  }

  // If owner edits - require re-approval
  if (!isAdmin) {
    apt.status = 'pending';
    apt.isHidden = false;
  }

  await apt.save();
  return res.json(apt.toJSON());
}

async function remove(req, res) {
  const apt = await Apartment.findById(req.params.id);
  if (!apt) return res.status(404).json({ message: 'Not found' });

  const isAdmin = req.user.role === 'admin';
  const isOwner = apt.owner.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

  await apt.deleteOne();
  return res.status(204).send();
}

module.exports = { getAll, getById, create, update, remove };
