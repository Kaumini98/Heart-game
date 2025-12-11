const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Easy'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'timeout'],
    default: 'active'
  },
  finalScore: {
    type: Number,
    default: 0
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
  }
}, {
  timestamps: true
});

// Index for better query performance
gameSessionSchema.index({ userId: 1, status: 1 });
gameSessionSchema.index({ sessionId: 1 });
gameSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);