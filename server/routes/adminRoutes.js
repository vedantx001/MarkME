const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// All admin endpoints require authentication and ADMIN role
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

// Create teacher/principal
router.post('/users', adminController.createUser);

// List users by school (optional query: role, page, limit)
router.get('/users', adminController.listUsers);

// Update teacher/principal
router.put('/users/:id', adminController.updateUser);

// Delete teacher (principal deletion blocked in controller)
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
