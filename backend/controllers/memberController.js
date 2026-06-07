const Member = require('../models/Member');
const Membership = require('../models/Membership');
const { sendMembershipConfirmationEmail } = require('../utils/sendEmail');

const calculateExpiry = (joinDate, duration) => {
  const expiry = new Date(joinDate);
  switch (duration) {
    case '1 Month':  expiry.setMonth(expiry.getMonth() + 1);       break;
    case '3 Months': expiry.setMonth(expiry.getMonth() + 3);       break;
    case '6 Months': expiry.setMonth(expiry.getMonth() + 6);       break;
    case '1 Year':   expiry.setFullYear(expiry.getFullYear() + 1); break;
    default: break;
  }
  return expiry;
};

exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('getAllMembers error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

exports.getActiveMembers = async (req, res) => {
  try {
    await Member.updateMany(
      { expiryDate: { $lt: new Date() }, membershipStatus: 'Active' },
      { membershipStatus: 'Expired' }
    );
    const members = await Member.find({ membershipStatus: 'Active' }).sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('getActiveMembers error:', error);
    res.status(500).json({ message: 'Failed to fetch active members' });
  }
};

exports.getExpiredMembers = async (req, res) => {
  try {
    await Member.updateMany(
      { expiryDate: { $lt: new Date() }, membershipStatus: 'Active' },
      { membershipStatus: 'Expired' }
    );
    const members = await Member.find({ membershipStatus: 'Expired' }).sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('getExpiredMembers error:', error);
    res.status(500).json({ message: 'Failed to fetch expired members' });
  }
};

exports.createMember = async (req, res) => {
  try {
    const {
      fullName, email, phone, membershipId,
      paymentMethod, paymentStatus, razorpayTransactionId,
    } = req.body;

    console.log('createMember body:', req.body);

    if (!fullName || !email || !phone || !membershipId || !paymentMethod) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const existing = await Member.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: 'A member with this phone number already exists' });
    }

    const plan = await Membership.findById(membershipId);
    if (!plan) {
      return res.status(404).json({ message: 'Membership plan not found' });
    }

    const joinDate   = new Date();
    const expiryDate = calculateExpiry(joinDate, plan.duration);

    const member = await Member.create({
      fullName,
      email,
      phone,
      membershipId:          plan._id,
      membershipName:        plan.name,
      membershipDuration:    plan.duration,
      membershipAmount:      plan.amount,
      joinDate,
      expiryDate,
      paymentMethod,
      paymentStatus:         paymentStatus || 'Paid',
      razorpayTransactionId: razorpayTransactionId || null,
      membershipStatus:      'Active',
    });

    sendMembershipConfirmationEmail(member).catch((err) => {
      console.error('Membership confirmation email failed (non-fatal):', err.message);
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('createMember error:', error);
    res.status(500).json({ message: 'Failed to register member' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findByIdAndDelete(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete member' });
  }
};

const nodemailer = require('nodemailer');
const buildRenewalEmailHTML = require('../utils/reminderEmail');

exports.sendRenewalReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const GYM_NAME = process.env.GYM_NAME || 'Lifetime Fitness';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD },
    });

    const html = buildRenewalEmailHTML(member);

    await transporter.sendMail({
      from: `"${GYM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: member.email,
      subject: `Your Membership Has Expired – Renew Today | ${GYM_NAME}`,
      html,
    });

    res.status(200).json({ message: 'Renewal reminder sent successfully' });
  } catch (error) {
    console.error('sendRenewalReminder error:', error);
    res.status(500).json({ message: 'Failed to send renewal reminder' });
  }
};

// ── DEV ONLY: Force expire a member instantly for testing ──
exports.forceExpire = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.membershipStatus === 'Expired') {
      return res.status(400).json({ message: 'Member is already expired' });
    }

    // Set expiryDate to 1 minute ago so it's definitively in the past
    member.expiryDate = new Date(Date.now() - 60 * 1000);
    member.membershipStatus = 'Expired';
    await member.save();

    res.status(200).json({ message: 'Member force-expired for testing', member });
  } catch (error) {
    console.error('forceExpire error:', error);
    res.status(500).json({ message: 'Failed to force expire member' });
  }
};
// ── Paginated total members (Active + Expired, sorted A-Z) ──
exports.getAllMembersPaginated = async (req, res) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page)  || 1);
    const limit     = Math.min(100, parseInt(req.query.limit) || 30);
    const skip      = (page - 1) * limit;
    const status    = req.query.status   || 'all';   // all | Active | Expired
    const search    = req.query.search   || '';

    // Auto-expire overdue members first
    await Member.updateMany(
      { expiryDate: { $lt: new Date() }, membershipStatus: 'Active' },
      { membershipStatus: 'Expired' }
    );

    // Build filter
    const filter = {};
    if (status === 'Active')  filter.membershipStatus = 'Active';
    if (status === 'Expired') filter.membershipStatus = 'Expired';

    if (search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName:       rx },
        { email:          rx },
        { phone:          rx },
        { memberId:       rx },
        { membershipName: rx },
      ];
    }

    const [members, total] = await Promise.all([
      Member.find(filter)
        .sort({ fullName: 1 })   // A-Z
        .skip(skip)
        .limit(limit)
        .lean(),
      Member.countDocuments(filter),
    ]);

    res.status(200).json({
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getAllMembersPaginated error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};
exports.updateMemberInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: 'Name, email and phone are required' });
    }

    const member = await Member.findByIdAndUpdate(
      id,
      { fullName, email, phone },
      { new: true, runValidators: true }
    );

    if (!member) return res.status(404).json({ message: 'Member not found' });

    res.status(200).json(member);
  } catch (error) {
    console.error('updateMemberInfo error:', error);
    res.status(500).json({ message: 'Failed to update member' });
  }
};