const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['player', 'coach', 'admin'],
    default: 'player'
  },
  position: {
    type: String,
    enum: ['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center', ''],
    default: ''
  },
  coachRole: {
    type: String,
    enum: ['head-coach', 'assistant-coach', 'defensive-coach', 'offensive-coach', 'skills-coach', ''],
    default: ''
  },
  team: {
    type: String,
    default: ''
  },
  school: {
    type: String,
    default: ''
  },
  teamCode: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: ''
  },
  emailVerificationExpires: {
    type: Date
  },
  passwordResetToken: {
    type: String,
    default: ''
  },
  passwordResetExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

