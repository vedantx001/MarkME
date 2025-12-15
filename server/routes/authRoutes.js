const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Email verification & password reset flows
router.get('/verify-email', authController.verifyEmail); // link: /api/auth/verify-email?token=...
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword); // body: { token, newPassword }

module.exports = router;
