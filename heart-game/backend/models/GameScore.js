const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Easy'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  gameType: {
    type: String,
    enum: ['heart-counting', 'mini-heart-counting'],
    default: 'heart-counting'
  },
  sessionId: {
    type: String
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  finalScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
gameScoreSchema.index({ userId: 1, createdAt: -1 });
gameScoreSchema.index({ score: -1 });
gameScoreSchema.index({ difficulty: 1, score: -1 });

module.exports = mongoose.model('GameScore', gameScoreSchema);