const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
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
  origin: ['https://www.xy-do.com', 'https://xy-do.pages.dev', 'http://localhost:3000'],
  credentials: true
}));

// Express session
app.use(session({
  secret: process.env.JWT_SECRET || 'xydo-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'XY-DO Athletic Programs Backend API',
    version: '1.0.0'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy' });
});

// Auth routes
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', protect, authController.getMe);
app.get('/api/auth/logout', authController.logout);

// Google OAuth routes
app.get('/api/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const token = req.user.getSignedJwtToken();
    
    // Redirect to frontend with token
    res.redirect(`https://www.xy-do.com/auth-success.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }))}`);
  }
);

// User routes (protected)
app.get('/api/users', protect, authorize('admin', 'coach'), (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/users/:id', protect, (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});

// Videos routes (protected)
app.get('/api/videos', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/videos', protect, authorize('admin', 'coach'), (req, res) => {
  res.json({ success: true, data: req.body });
});

// Messages routes (protected)
app.get('/api/messages', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/messages', protect, (req, res) => {
  res.json({ success: true, data: req.body });
});

// Teams routes (protected)
app.get('/api/teams', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/teams', protect, authorize('admin', 'coach'), (req, res) => {
  res.json({ success: true, data: req.body });
});

// Content routes (protected)
app.get('/api/content', protect, (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/content', protect, authorize('admin', 'coach'), (req, res) => {
  res.json({ success: true, data: req.body });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Server Error' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

