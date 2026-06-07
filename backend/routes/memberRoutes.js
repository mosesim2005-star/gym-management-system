const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getAllMembers,
  getActiveMembers,
  getExpiredMembers,
  createMember,
  deleteMember,
    sendRenewalReminder,           // ← ADD
      forceExpire,              // ← ADD
        getAllMembersPaginated,   // ← ADD
          updateMemberInfo,          // ← ADD




} = require('../controllers/memberController');

router.get('/', protect, getAllMembers);
router.get('/active', protect, getActiveMembers);
router.get('/expired', protect, getExpiredMembers);
router.get('/paginated',   protect, getAllMembersPaginated);   // ← ADD

router.post('/', protect, createMember);
router.delete('/:id', protect, deleteMember);
router.post('/:id/send-renewal-email', protect, sendRenewalReminder);   // ← ADD
router.patch('/:id/force-expire', protect, forceExpire);   // ← ADD
router.patch('/:id/info',              protect, updateMemberInfo);   // ← ADD



module.exports = router;