/**
 * MindMingle Backend API
 * Node.js + Express + MongoDB
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmingle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String,
  bio: String,
  points: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  badges: [String],
  streak: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

const ChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true }, // creative, problem, whatif, advice, fun
  title: { type: String, required: true },
  description: String,
  category: String,
  rewardPoints: { type: Number, default: 50 },
  status: { type: String, default: 'active' }, // active, completed, expired
  expiresAt: Date,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  created: { type: Date, default: Date.now },
});

const ResponseSchema = new mongoose.Schema({
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  media: [String],
  votes: { type: Number, default: 0 },
  isWinner: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

const VoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Response' },
  value: { type: Number, default: 1 }, // 1 for upvote
  created: { type: Date, default: Date.now },
});

// Models
const User = mongoose.model('User', UserSchema);
const Challenge = mongoose.model('Challenge', ChallengeSchema);
const Response = mongoose.model('Response', ResponseSchema);
const Vote = mongoose.model('Vote', VoteSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============= AUTH ROUTES =============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= CHALLENGE ROUTES =============

app.get('/api/challenges', async (req, res) => {
  try {
    const { type, sort = 'hot', limit = 20 } = req.query;

    let query = { status: 'active' };
    if (type) query.type = type;

    let sortOption = {};
    if (sort === 'hot') sortOption = { likes: -1, created: -1 };
    if (sort === 'new') sortOption = { created: -1 };
    if (sort === 'trending') sortOption = { views: -1, created: -1 };

    const challenges = await Challenge.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .populate('userId', 'username avatar');

    // Get response count for each challenge
    const challengesWithCounts = await Promise.all(
      challenges.map(async (challenge) => {
        const responseCount = await Response.countDocuments({
          challengeId: challenge._id,
        });
        return {
          ...challenge.toObject(),
          responseCount,
        };
      })
    );

    res.json({ success: true, challenges: challengesWithCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate(
      'userId',
      'username avatar points level'
    );

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Increment views
    challenge.views += 1;
    await challenge.save();

    // Get responses
    const responses = await Response.find({ challengeId: challenge._id })
      .sort({ votes: -1 })
      .populate('userId', 'username avatar points level');

    res.json({ success: true, challenge, responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/challenges', authMiddleware, async (req, res) => {
  try {
    const { type, title, description, category, rewardPoints } = req.body;

    const user = await User.findById(req.userId);
    
    // Check if user can create challenge (limit for free users)
    if (!user.isPremium) {
      const todayChallenges = await Challenge.countDocuments({
        userId: req.userId,
        created: { $gte: new Date().setHours(0, 0, 0, 0) },
      });

      if (todayChallenges >= 5) {
        return res.status(403).json({
          error: 'Daily limit reached. Upgrade to Premium for unlimited challenges.',
        });
      }
    }

    const challenge = new Challenge({
      userId: req.userId,
      type,
      title,
      description,
      category,
      rewardPoints: rewardPoints || 50,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    await challenge.save();

    // Award points for creating challenge
    user.points += 10;
    await user.save();

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= RESPONSE ROUTES =============

app.post('/api/responses', authMiddleware, async (req, res) => {
  try {
    const { challengeId, content, media } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.status !== 'active') {
      return res.status(400).json({ error: 'Challenge is no longer active' });
    }

    const response = new Response({
      challengeId,
      userId: req.userId,
      content,
      media: media || [],
    });

    await response.save();

    // Award points for responding
    const user = await User.findById(req.userId);
    user.points += 5;
    await user.save();

    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= VOTE ROUTES =============

app.post('/api/vote', authMiddleware, async (req, res) => {
  try {
    const { responseId } = req.body;

    // Check if already voted
    const existingVote = await Vote.findOne({
      userId: req.userId,
      responseId,
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted' });
    }

    // Create vote
    const vote = new Vote({
      userId: req.userId,
      responseId,
    });

    await vote.save();

    // Update response vote count
    const response = await Response.findById(responseId);
    response.votes += 1;
    await response.save();

    // Award points to response author
    const responseUser = await User.findById(response.userId);
    responseUser.points += 2;
    await responseUser.save();

    res.json({ success: true, votes: response.votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= USER ROUTES =============

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get stats
    const challengeCount = await Challenge.countDocuments({ userId: user._id });
    const responseCount = await Response.countDocuments({ userId: user._id });
    const wins = await Response.countDocuments({
      userId: user._id,
      isWinner: true,
    });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          challenges: challengeCount,
          responses: responseCount,
          wins,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { period = 'all', limit = 50 } = req.query;

    let dateFilter = {};
    if (period === 'week') {
      dateFilter = {
        created: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };
    } else if (period === 'month') {
      dateFilter = {
        created: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };
    }

    const users = await User.find(dateFilter)
      .select('username avatar points level badges isPremium')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PREMIUM ROUTES =============

app.post('/api/premium/subscribe', authMiddleware, async (req, res) => {
  try {
    // In production, integrate with Stripe/PayPal
    const user = await User.findById(req.userId);
    user.isPremium = true;
    await user.save();

    res.json({ success: true, message: 'Subscribed to Premium!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ADMIN ROUTES =============

app.post('/api/admin/select-winner', authMiddleware, async (req, res) => {
  try {
    const { challengeId, responseId } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (challenge.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark response as winner
    const response = await Response.findById(responseId);
    response.isWinner = true;
    await response.save();

    // Mark challenge as completed
    challenge.status = 'completed';
    await challenge.save();

    // Award points to winner
    const winner = await User.findById(response.userId);
    winner.points += challenge.rewardPoints;
    await winner.save();

    res.json({ success: true, message: 'Winner selected!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', version: '1.0.0' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MindMingle API running on port ${PORT}`);
});

module.exports = app;
