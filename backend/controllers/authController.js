const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const getMidnightExpiry = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(23, 59, 59, 999);
  return midnight;
};

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Log env check on every OTP request
    console.log('[requestOTP] email:', email);
    console.log('[requestOTP] SMTP_EMAIL:', process.env.SMTP_EMAIL);
    console.log('[requestOTP] SMTP_PASSWORD set:', !!process.env.SMTP_PASSWORD);
    console.log('[requestOTP] JWT_SECRET set:', !!process.env.JWT_SECRET);
    console.log('[requestOTP] MONGO_URI set:', !!process.env.MONGO_URI);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp, expiresAt });

    console.log('[requestOTP] OTP created, sending email...');
    await sendEmail(email, otp);
    console.log('[requestOTP] Email sent successfully');

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[requestOTP] FULL ERROR:', error);
    console.error('[requestOTP] error message:', error.message);
    console.error('[requestOTP] error stack:', error.stack);
    res.status(500).json({ message: 'Failed to send OTP', detail: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (new Date() > record.expiresAt) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.', expired: true });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await OTP.deleteMany({ email });

    const tokenExpiry = getMidnightExpiry();
    const expiresIn = Math.floor((tokenExpiry - Date.now()) / 1000);

    const token = jwt.sign(
      { email, loginDate: new Date().toDateString() },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      expiresAt: tokenExpiry,
    });
  } catch (error) {
    console.error('[verifyOTP] FULL ERROR:', error);
    res.status(500).json({ message: 'Verification failed', detail: error.message });
  }
};