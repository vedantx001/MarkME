const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole, requireAnyRole } = require('../middlewares/roleMiddleware');

// All admin endpoints require authentication
router.use(authMiddleware);

// List users by school (optional query: role, page, limit)
// Allow PRINCIPAL read-only access to list, so principal dashboard can reuse adminContext.
router.get('/users', requireAnyRole(['ADMIN', 'PRINCIPAL']), adminController.listUsers);

// ADMIN-only below
router.use(requireRole('ADMIN'));

// Create teacher/principal
router.post('/users', adminController.createUser);

// Update teacher/principal
router.put('/users/:id', adminController.updateUser);

// Delete teacher (principal deletion blocked in controller)
router.delete('/users/:id', adminController.deleteUser);

// Update current admin profile + school details
router.put('/profile', adminController.updateAdminProfile);

module.exports = router;
