const mongoose = require('mongoose');

const InspectionItemSchema = new mongoose.Schema({
  status: { type: String, default: 'green' }, // 'green' | 'yellow' | 'red'
  comment: { type: String, default: '' },
  type: { type: String, default: 'oem' } // 'oem' | 'repair' | 'vas'
}, { _id: false });

const RecommendationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  service: { type: String, required: true },
  details: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  proofUrl: { type: String, default: '' },
  status: { type: String, default: 'pending' }, // 'pending' | 'approved' | 'declined'
  category: { type: String, default: 'repair' }, // 'repair' | 'vas'
  executionProof: { type: String, default: '' }
}, { _id: false });

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  vehicle: { type: String, required: true },
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'scheduled' },
  estimatedCost: { type: Number, default: 0 },
  techSignature: { type: String, default: '' },
  qcSignature: { type: String, default: '' },
  inspection: {
    type: Map,
    of: InspectionItemSchema,
    default: {}
  },
  recommendations: { type: [RecommendationSchema], default: [] }
}, { timestamps: true });

AppointmentSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
