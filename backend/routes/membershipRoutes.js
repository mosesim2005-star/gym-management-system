const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getAllMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
} = require('../controllers/membershipController');

router.get('/', protect, getAllMemberships);
router.post('/', protect, createMembership);
router.put('/:id', protect, updateMembership);
router.delete('/:id', protect, deleteMembership);

module.exports = router;