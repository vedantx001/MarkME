const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-admin', authController.registerAdmin);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// OTP email verification flow
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Password reset flows
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password-token', authController.resetPasswordWithUserToken);

// Legacy endpoints (kept in controller but not exposed)
// router.get('/verify-email', authController.verifyEmail);
// router.post('/request-password-reset', authController.requestPasswordReset);
// router.post('/reset-password', authController.resetPassword);

module.exports = router;
