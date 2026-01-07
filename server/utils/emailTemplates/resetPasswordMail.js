module.exports = (link) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
            padding: 20px;
        }

        .email-content {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }

        /* Header */
        .email-header {
            background-color: #d93025; /* Warning/Action Red or keep Brand Blue #1a73e8 */
            padding: 24px;
            text-align: center;
        }

        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        /* Body */
        .email-body {
            padding: 32px 24px;
            color: #333333;
        }

        .email-body p {
            margin-bottom: 16px;
            font-size: 16px;
            color: #555555;
        }

        /* Action Button */
        .btn-container {
            text-align: center;
            margin: 32px 0;
        }

        .btn {
            display: inline-block;
            background-color: #d93025; /* Matches header */
            color: #ffffff !important;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.3s ease;
        }

        .btn:hover {
            background-color: #b02018;
        }

        /* Fallback Link */
        .link-fallback {
            font-size: 13px;
            color: #6b7280;
            background-color: #f9fafb;
            padding: 16px;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            word-break: break-all;
        }
        
        .link-fallback a {
            color: #1a73e8;
            text-decoration: underline;
        }

        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .email-footer p {
            font-size: 12px;
            color: #9ca3af;
            margin: 4px 0;
        }

        .email-footer a {
            color: #1a73e8;
            text-decoration: none;
        }

        .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
        
        @media only screen and (max-width: 600px) {
            .email-content { width: 100% !important; }
            .btn { width: 100%; box-sizing: border-box; }
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
                            <h1>MarkME Security</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="email-body">
                            <p><strong>Hello,</strong></p>
                            <p>We received a request to reset the password for your MarkME account. If you made this request, please click the button below to choose a new password.</p>
                            
                            <!-- Action Button -->
                            <div class="btn-container">
                                <a href="${link}" class="btn" target="_blank">Reset Password</a>
                            </div>

                            <p>This link is valid for <strong>15 minutes</strong> for security reasons.</p>

                            <div class="divider"></div>

                            <!-- Fallback Link Section -->
                            <p style="font-size: 14px;">Having trouble clicking the button? Copy and paste the following URL into your web browser:</p>
                            <div class="link-fallback">
                                <a href="${link}">${link}</a>
                            </div>

                            <div class="divider"></div>

                            <p style="font-size: 14px; margin-bottom: 0; color: #666;">If you did not ask to reset your password, you can safely ignore this email. Your account is safe.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <p>&copy; ${new Date().getFullYear()} MarkME Inc. All rights reserved.</p>
                            <p>
                                <a href="#">Contact Support</a> &bull; 
                                <a href="#">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;