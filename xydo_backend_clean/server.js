const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const authController = require('./controllers/authController');
const { protect, authorize } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS with credentials
app.use(cors({
  origin: ['https://www.xy-do.com', 'https://xy-do.pages.dev', 'https://4ac00b04.xy-do.pages.dev', 'http://localhost:3000'],
  credentials: true
}));

// Connect to MongoDB first (needed for session store)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Express session with MongoDB store (fixes Google OAuth session issue)
app.use(session({
  secret: process.env.JWT_SECRET || 'xydo-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'XY-DO Athletic Programs Backend API',
    version: '1.0.0'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy'
  });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/verify-email/:token', authController.verifyEmail);
app.post('/api/auth/resend-verification', authController.resendVerification);
app.get('/api/auth/me', protect, authController.getMe);
app.get('/api/auth/logout', protect, authController.logout);

// Google OAuth routes
app.get('/api/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login.html?error=google_auth_failed`,
    session: true
  }),
  (req, res) => {
    // Successful authentication
    const token = req.user.getSignedJwtToken();
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isEmailVerified: req.user.isEmailVerified
    }));
    
    // Redirect to auth-success page with token and user data
    res.redirect(`${process.env.FRONTEND_URL}/auth-success.html?token=${token}&user=${userData}`);
  }
);

// Video routes (protected)
app.get('/api/videos', protect, (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Message routes (protected)
app.post('/api/messages', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Message sent successfully'
  });
});

// Team routes (protected)
app.get('/api/teams', protect, (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Content routes (protected)
app.get('/api/content', protect, (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

