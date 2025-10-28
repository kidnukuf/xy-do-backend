const nodemailer = require('nodemailer');

// Create transporter using Gmail with timeout settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 1000,
  rateLimit: 5,
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000 // 15 seconds
});

// Send email verification email
exports.sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email.html?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"XY-DO Athletic Programs" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your XY-DO Account',
    text: `Hi ${name},\n\nWelcome to XY-DO Athletic Programs! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.\n\nBest regards,\nXY-DO Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #fbbf24; color: #1e3a8a; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to XY-DO Athletic Programs!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for creating an account with XY-DO Athletic Programs. We're excited to have you join our community of athletes and coaches!</p>
            <p>To complete your registration and access all features, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account with XY-DO, please ignore this email.</p>
            <p>Best regards,<br>The XY-DO Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} XY-DO Athletic Programs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
exports.sendWelcomeEmail = async (email, name, role) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard.html`;
  
  const mailOptions = {
    from: `"XY-DO Athletic Programs" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to XY-DO Athletic Programs!',
    text: `Hi ${name},\n\nYour email has been verified! You now have full access to XY-DO Athletic Programs.\n\nGet started by visiting your dashboard: ${dashboardUrl}\n\nBest regards,\nXY-DO Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #fbbf24; color: #1e3a8a; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to XY-DO!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Your email has been successfully verified! You now have full access to all XY-DO Athletic Programs features.</p>
            <p>Get started by visiting your dashboard:</p>
            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>
            <p>Here's what you can do:</p>
            <ul>
              <li>Access training videos and resources</li>
              <li>Track your progress</li>
              <li>Connect with coaches and teammates</li>
              <li>View personalized training plans</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The XY-DO Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} XY-DO Athletic Programs. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

