const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Gold Plan',
      'Diwali Offer',
      'New Year Special',
      'Student Offer',
      'Festival Offer',
      "Women's Special",
      'Package Plan',
    ],
  },
  duration: {
    type: String,
    required: true,
    enum: ['1 Month', '3 Months', '6 Months', '1 Year'],
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Membership', MembershipSchema);