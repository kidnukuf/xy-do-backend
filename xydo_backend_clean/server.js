const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

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
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, coachCode } = req.body;
  
  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide name, email, and password' 
    });
  }
  
  // TODO: Hash password, save to database
  res.json({ 
    success: true, 
    message: 'Registration successful',
    data: { name, email, role: role || 'athlete' }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Please provide email and password' 
    });
  }
  
  // TODO: Verify credentials, generate JWT
  res.json({ 
    success: true, 
    message: 'Login successful',
    token: 'sample_jwt_token',
    data: { email }
  });
});

// User routes
app.get('/api/users', (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/users/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});

// Team routes
app.get('/api/teams', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/teams', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Content routes
app.get('/api/content', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/content', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Video routes
app.get('/api/videos', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      {
        id: 1,
        title: 'Sample Training Video',
        category: 'fundamentals',
        week: 1,
        url: 'https://example.com/video1'
      }
    ]
  });
});

app.post('/api/videos', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Message routes
app.get('/api/messages', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      {
        id: 1,
        author: 'Coach',
        message: 'Welcome to the team!',
        timestamp: new Date()
      }
    ]
  });
});

app.post('/api/messages', (req, res) => {
  res.json({ success: true, data: req.body });
});

// Feedback routes
app.post('/api/feedback', (req, res) => {
  res.json({ success: true, message: 'Feedback received' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Server Error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

