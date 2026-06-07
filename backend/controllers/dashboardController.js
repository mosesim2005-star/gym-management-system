// ─────────────────────────────────────────────────────────────
// dashboardController.js
// Place: backend/controllers/dashboardController.js
// ─────────────────────────────────────────────────────────────

const Member    = require('../models/Member');
const Membership = require('../models/Membership');

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    // Auto-expire overdue memberships
    await Member.updateMany(
      { expiryDate: { $lt: now }, membershipStatus: 'Active' },
      { membershipStatus: 'Expired' }
    );

    // ── Core counts ──
    const totalMembers   = await Member.countDocuments();
    const activeMembers  = await Member.countDocuments({ membershipStatus: 'Active' });
    const expiredMembers = await Member.countDocuments({ membershipStatus: 'Expired' });

    // ── Expiring within 7 days ──
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const renewalsDue = await Member.countDocuments({
      membershipStatus: 'Active',
      expiryDate: { $gte: now, $lte: in7Days },
    });

    // ── Total revenue (all time) ──
    const revenueAgg = await Member.aggregate([
      { $group: { _id: null, total: { $sum: '$membershipAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // ── This month's revenue ──
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenueAgg = await Member.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$membershipAmount' } } },
    ]);
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

    // ── Last month's revenue (for % change) ──
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const lastMonthRevAgg  = await Member.aggregate([
      { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$membershipAmount' } } },
    ]);
    const lastMonthRevenue = lastMonthRevAgg[0]?.total || 0;

    // ── Members joined this month vs last month ──
    const thisMonthMembers = await Member.countDocuments({ createdAt: { $gte: startOfMonth } });
    const lastMonthMembers = await Member.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // ── Membership growth — last 7 months ──
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = await Member.countDocuments({ createdAt: { $gte: start, $lte: end } });
      growthData.push({
        month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        members: count,
      });
    }

    // ── Revenue by month — last 7 months ──
    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const agg   = await Member.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$membershipAmount' } } },
      ]);
      revenueData.push({
        month:   d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        revenue: agg[0]?.total || 0,
      });
    }

    // ── Payment method breakdown ──
    const paymentAgg = await Member.aggregate([
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$membershipAmount' } } },
    ]);
    const paymentBreakdown = paymentAgg.map(p => ({
      method: p._id,
      count:  p.count,
      amount: p.amount,
    }));

    // ── Top membership plans ──
    const planAgg = await Member.aggregate([
      { $group: {
          _id:    '$membershipName',
          count:  { $sum: 1 },
          revenue:{ $sum: '$membershipAmount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topPlans = planAgg.map(p => ({ name: p._id, subscribers: p.count, revenue: p.revenue }));

    // ── Recent 6 registrations ──
    const recentMembers = await Member.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('fullName membershipName joinDate membershipStatus memberId membershipAmount paymentMethod');

    // ── Expiring soon — next 7 days, top 5 ──
    const expiringSoon = await Member.find({
      membershipStatus: 'Active',
      expiryDate: { $gte: now, $lte: in7Days },
    })
      .sort({ expiryDate: 1 })
      .limit(5)
      .select('fullName membershipName expiryDate memberId');

    res.status(200).json({
      stats: {
        totalMembers,
        activeMembers,
        expiredMembers,
        renewalsDue,
        totalRevenue,
        monthlyRevenue,
        lastMonthRevenue,
        thisMonthMembers,
        lastMonthMembers,
      },
      growthData,
      revenueData,
      paymentBreakdown,
      topPlans,
      recentMembers,
      expiringSoon,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};