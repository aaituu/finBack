// Ayana: Contact messages schema/model

const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    email: { type: String, default: '', trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

ContactMessageSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
