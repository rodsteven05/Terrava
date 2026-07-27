const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createSeller, getUsers, updateUserRole, archiveUser, restoreUser, getDashboardStats, getSalesReport, getBuyers, archiveListing, restoreListing } = require('../controllers/adminController');

router.post('/sellers', authenticate, authorize('admin'), createSeller);
router.get('/users', authenticate, authorize('admin'), getUsers);
router.get('/buyers', authenticate, authorize('seller', 'admin'), getBuyers);
router.put('/users/:id/role', authenticate, authorize('admin'), updateUserRole);
router.put('/users/:id/archive', authenticate, authorize('admin'), archiveUser);
router.put('/users/:id/restore', authenticate, authorize('admin'), restoreUser);
router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/sales-report', authenticate, authorize('admin'), getSalesReport);
router.put('/listings/:id/archive', authenticate, authorize('admin'), archiveListing);
router.put('/listings/:id/restore', authenticate, authorize('admin'), restoreListing);

module.exports = router;
