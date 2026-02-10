// Ayana: Reports schema/model

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true, maxlength: 400 },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true }
  },
  { timestamps: true }
);

ReportSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Report', ReportSchema);
