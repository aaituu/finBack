// Ayana: Apartment schema/model

const mongoose = require('mongoose');

const ApartmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 4, maxlength: 120 },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['rent', 'sale'], required: true },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    rooms: { type: Number, default: 1, min: 0 },
    area: { type: Number, default: 0, min: 0 },
    floor: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Admin moderation
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    isHidden: { type: Boolean, default: false }
  },
  { timestamps: true }
);

ApartmentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;

    ret.ownerId = ret.owner?.toString ? ret.owner.toString() : ret.owner;
    ret.imageUrl = Array.isArray(ret.images) && ret.images.length ? ret.images[0] : '';

    return ret;
  }
});

module.exports = mongoose.model('Apartment', ApartmentSchema);
