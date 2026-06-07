const Membership = require('../models/Membership');

exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });
    res.status(200).json(memberships);
  } catch (error) {
    console.error('getAllMemberships error:', error);
    res.status(500).json({ message: 'Failed to fetch memberships' });
  }
};

exports.createMembership = async (req, res) => {
  try {
    const { name, duration, amount } = req.body;

    if (!name || !duration || amount === undefined) {
      return res.status(400).json({ message: 'Name, duration, and amount are required' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    const membership = await Membership.create({ name, duration, amount });
    res.status(201).json(membership);
  } catch (error) {
    console.error('createMembership error:', error);
    res.status(500).json({ message: 'Failed to create membership' });
  }
};

exports.updateMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, amount } = req.body;

    const membership = await Membership.findByIdAndUpdate(
      id,
      { name, duration, amount },
      { new: true, runValidators: true }
    );

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.status(200).json(membership);
  } catch (error) {
    console.error('updateMembership error:', error);
    res.status(500).json({ message: 'Failed to update membership' });
  }
};

exports.deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByIdAndDelete(id);

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.status(200).json({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('deleteMembership error:', error);
    res.status(500).json({ message: 'Failed to delete membership' });
  }
};