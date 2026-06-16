const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
  },
  fullName:           { type: String, required: true, trim: true },
  email:              { type: String, required: true, trim: true, lowercase: true },
  phone:              { type: String, required: true, trim: true },
  membershipId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
  membershipName:     { type: String, required: true },
  membershipDuration: { type: String, required: true },
  membershipAmount:   { type: Number, required: true },
  joinDate:           { type: Date,   required: true },
  expiryDate:         { type: Date,   required: true },

  // ── All payment methods frontend can send ──
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'QR Code', 'UPI QR', 'Razorpay'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Paid',          // changed default from 'Pending' to 'Paid' — most payments are immediate
  },
  razorpayTransactionId: { type: String, default: null },
  membershipStatus: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active',
  },
  createdAt: { type: Date, default: Date.now },
});

// ── Safe memberId generation ──
MemberSchema.pre('save', async function () {
  if (!this.memberId) {
    const MemberModel = mongoose.model('Member');

    const last = await MemberModel.findOne(
      { memberId: { $regex: /^GYM\d+$/ } },
      { memberId: 1 },
      { sort: { memberId: -1 } }
    ).lean();

    let nextNumber = 1;
    if (last && last.memberId) {
      const parsed = parseInt(last.memberId.replace('GYM', ''), 10);
      if (!isNaN(parsed)) nextNumber = parsed + 1;
    }

    let candidate = `GYM${String(nextNumber).padStart(4, '0')}`;
    while (await MemberModel.exists({ memberId: candidate })) {
      nextNumber++;
      candidate = `GYM${String(nextNumber).padStart(4, '0')}`;
    }

    this.memberId = candidate;
  }
});

MemberSchema.index({ fullName: 1 });
MemberSchema.index({ membershipStatus: 1, fullName: 1 });
MemberSchema.index({ email: 1 });
MemberSchema.index({ phone: 1 });

module.exports = mongoose.model('Member', MemberSchema);