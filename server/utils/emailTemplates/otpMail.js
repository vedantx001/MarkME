module.exports = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
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
            background-color: #1a73e8; /* Professional Blue */
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

        /* OTP Box */
        .otp-container {
            text-align: center;
            margin: 32px 0;
        }

        .otp-code {
            display: inline-block;
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1a73e8;
            background-color: #e8f0fe;
            padding: 16px 32px;
            border-radius: 8px;
            border: 1px dashed #1a73e8;
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

        /* Utilities */
        .text-center { text-align: center; }
        .text-muted { color: #6b7280; }
        .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
        
        @media only screen and (max-width: 600px) {
            .email-content { width: 100% !important; }
            .otp-code { font-size: 28px; padding: 12px 24px; }
        }
    </style>
</head>
<body>
    <table class="email-wrapper" role="presentation" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center">
                <!-- Main Content Container -->
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
                            <p><strong>Hello there,</strong></p>
                            <p>Thank you for starting your registration with <strong>MarkME</strong>. To ensure the security of your account, we need to verify your email address.</p>
                            
                            <p>Please use the following One-Time Password (OTP) to complete your sign-up process:</p>

                            <div class="otp-container">
                                <span class="otp-code">${otp}</span>
                            </div>

                            <p class="text-muted" style="font-size: 14px;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone, including MarkME support staff.</p>

                            <div class="divider"></div>

                            <p style="font-size: 14px; margin-bottom: 0;">If you didn't request this verification, you can safely ignore this email. Someone may have typed your email address by mistake.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="email-footer">
                            <p>&copy; ${new Date().getFullYear()} MarkME Inc. All rights reserved.</p>
                            <p>123 Business Avenue, Tech City, TC 90210</p>
                            <p>
                                <a href="#">Privacy Policy</a> &bull; 
                                <a href="#">Terms of Service</a> &bull; 
                                <a href="#">Help Center</a>
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