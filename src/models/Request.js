// Ayana: Request schema/model

const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, minlength: 2, maxlength: 1000 },
    phone: { type: String, required: true, minlength: 3, maxlength: 40 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RequestSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Request', RequestSchema);
