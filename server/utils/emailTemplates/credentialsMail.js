/**
 * credentialsMail(role, email, password)
 * Professional HTML template for sending assigned credentials to newly created TEACHER/PRINCIPAL.
 */

module.exports = function credentialsMail(role, email, password) {
    const safeRole = String(role || '').toUpperCase();
    const safeEmail = String(email || '');
    const safePassword = String(password || '');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Credentials</title>
    <style>
        /* Base Reset */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: none;
            width: 100% !important;
            height: 100%;
            line-height: 1.6;
        }

        /* Container */
        .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 40px 20px;
        }

        .email-content {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
            padding: 30px;
            text-align: center;
        }

        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }

        /* Hero Section */
        .hero-section {
            text-align: center;
            padding: 40px 20px 0;
        }

        .key-icon {
            display: inline-block;
            width: 80px;
            height: 80px;
            background-color: #e8f0fe;
            color: #1a73e8;
            border-radius: 50%;
            font-size: 40px;
            line-height: 80px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        /* Body */
        .email-body {
            padding: 20px 40px 40px;
            color: #333333;
            text-align: center;
        }

        .email-body h2 {
            font-size: 24px;
            color: #202124;
            margin-bottom: 12px;
        }

        .email-body p {
            margin-bottom: 24px;
            font-size: 16px;
            color: #5f6368;
            line-height: 1.8;
        }

        /* Credential Card */
        .cred-card {
            background-color: #f8f9fa;
            border: 1px dashed #c0c4c9;
            border-radius: 8px;
            padding: 24px;
            text-align: left;
            margin: 20px 0;
            position: relative;
        }

        .cred-item {
            margin-bottom: 16px;
        }
        
        .cred-item:last-child {
            margin-bottom: 0;
        }

        .cred-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #5f6368;
            font-weight: 700;
            margin-bottom: 4px;
            display: block;
        }

        .cred-value {
            font-family: 'Courier New', Courier, monospace;
            font-size: 18px;
            color: #202124;
            font-weight: 600;
            background: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            display: block;
            word-break: break-all;
        }

        /* Button */
        .btn {
            display: inline-block;
            background-color: #1a73e8;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 36px;
            border-radius: 50px;
            box-shadow: 0 4px 6px rgba(26, 115, 232, 0.2);
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .btn:hover {
            background-color: #1557b0;
            box-shadow: 0 6px 8px rgba(26, 115, 232, 0.3);
        }

        /* Security Note */
        .security-note {
            background-color: #fff8e1;
            border-left: 4px solid #fbc02d;
            padding: 12px 16px;
            text-align: left;
            font-size: 13px;
            color: #b7791f;
            margin-top: 30px;
            border-radius: 0 4px 4px 0;
        }

        /* Footer */
        .email-footer {
            background-color: #f1f3f4;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #eaecf0;
        }

        .email-footer p {
            font-size: 12px;
            color: #9aa0a6;
            margin: 6px 0;
        }

        @media only screen and (max-width: 600px) {
            .email-wrapper { padding: 10px; }
            .email-content { width: 100% !important; border-radius: 0; }
            .email-body { padding: 20px; }
            .cred-value { font-size: 16px; }
        }
    </style>
</head>
<body>
    <table class="email-wrapper" role="presentation" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <table class="email-content" role="presentation" cellspacing="0" cellpadding="0">
                    
                    <!-- Header -->
                    <tr>
                        <td class="email-header">
                            <h1>MarkME</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="email-body">
                            <!-- Hero Icon -->
                            <div class="hero-section">
                                <div class="key-icon">🔑</div>
                            </div>

                            <h2>Account Created Successfully</h2>
                            
                            <p>
                                Congratulations! You have been registered as a <strong>${safeRole}</strong> for MarkME. Your account is ready to use.
                            </p>

                            <p style="margin-bottom: 10px;">Here are your temporary login credentials:</p>

                            <!-- Credentials Box -->
                            <div class="cred-card">
                                <div class="cred-item">
                                    <span class="cred-label">Login ID / Email</span>
                                    <span class="cred-value">${safeEmail}</span>
                                </div>
                                <div class="cred-item">
                                    <span class="cred-label">Temporary Password</span>
                                    <span class="cred-value">${safePassword}</span>
                                </div>
                            </div>

                            <a href="#" class="btn" target="_blank">Login to Dashboard</a>

                            <!-- Security Warning -->
                            <div class="security-note">
                                <strong>Security Tip:</strong> Please change your password immediately after your first login to keep your account secure.
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <p>&copy; ${new Date().getFullYear()} MarkME Inc.</p>
                            <p>This is an automated message containing sensitive account information.</p>
                            <p>Do not share this email with anyone.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};