const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, position, coachRole, team, school, teamCode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // TEMPORARY: Email verification disabled until transactional email service is set up
    // Generate email verification token
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'player',
      position: position || '',
      coachRole: coachRole || '',
      team: team || '',
      school: school || '',
      teamCode: teamCode || '',
      isEmailVerified: true, // TEMPORARY: Auto-verify until email service is configured
      // emailVerificationToken: verificationToken,
      // emailVerificationExpires: verificationExpires
    });

    // TEMPORARY: Skip sending verification email
    // const emailResult = await emailService.sendVerificationEmail(email, name, verificationToken);
    // if (!emailResult.success) {
    //   console.error('Failed to send verification email:', emailResult.error);
    // }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      requiresVerification: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        coachRole: user.coachRole,
        team: user.team,
        school: user.school,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token and check if it's not expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.name, user.role);

    // Create token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        coachRole: user.coachRole,
        team: user.team,
        school: user.school,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during email verification'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(email, user.name, verificationToken);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // TEMPORARY: Email verification check disabled
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Please verify your email before logging in',
    //     requiresVerification: true,
    //     email: user.email
    //   });
    // }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        coachRole: user.coachRole,
        team: user.team,
        school: user.school,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {}
  });
};

