const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getAllMembers,
  getActiveMembers,
  getExpiredMembers,
  createMember,
  deleteMember,
  sendRenewalReminder,
  forceExpire,
  getAllMembersPaginated,
  updateMemberInfo,
  reactivateMember,
  getExpiredMembersPaginated,
} = require('../controllers/memberController');

router.get('/',                    protect, getAllMembers);
router.get('/active',              protect, getActiveMembers);
router.get('/expired',             protect, getExpiredMembers);
router.get('/paginated',           protect, getAllMembersPaginated);
router.get('/expired-paginated',   protect, getExpiredMembersPaginated);
router.post('/',                   protect, createMember);
router.delete('/:id',              protect, deleteMember);
router.post('/:id/send-renewal-email', protect, sendRenewalReminder);
router.patch('/:id/force-expire',      protect, forceExpire);
router.patch('/:id/info',              protect, updateMemberInfo);
router.patch('/:id/reactivate',        protect, reactivateMember);

module.exports = router;