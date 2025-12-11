const express = require('express');
const router = express.Router();
const GameScore = require('../models/GameScore');
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const auth = require('./auth');

// @desc    Save game score
// @route   POST /api/games/save-score
// @access  Private
router.post('/save-score', auth, async (req, res) => {
  try {
    const {
      userId,
      username,
      score,
      difficulty,
      status,
      correctAnswers,
      totalQuestions,
      gameType,
      sessionId
    } = req.body;

    // Validate required fields
    if (!userId || !username || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'UserId, username, and score are required'
      });
    }

    // Create new game score
    const gameScore = new GameScore({
      userId,
      username,
      score,
      difficulty: difficulty || 'Easy',
      status: status || 'completed',
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 0,
      gameType: gameType || 'heart-counting',
      sessionId: sessionId || null,
      finalScore: score
    });

    await gameScore.save();

    // Update user's total statistics
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalScore: score,
        gamesPlayed: 1,
        correctAnswers: correctAnswers || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Score saved successfully',
      data: gameScore
    });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving score',
      error: error.message
    });
  }
});

// @desc    Save game session
// @route   POST /api/games/save-session
// @access  Private
router.post('/save-session', auth, async (req, res) => {
  try {
    const {
      userId,
      username,
      difficulty,
      startTime,
      status
    } = req.body;

    if (!userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'UserId and username are required'
      });
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const gameSession = new GameSession({
      sessionId,
      userId,
      username,
      difficulty: difficulty || 'Easy',
      startTime: startTime || new Date(),
      status: status || 'active'
    });

    await gameSession.save();

    res.status(201).json({
      success: true,
      message: 'Game session started',
      sessionId,
      data: gameSession
    });
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving session',
      error: error.message
    });
  }
});

// @desc    Update game session
// @route   PUT /api/games/session/:sessionId
// @access  Private
router.put('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      endTime,
      status,
      finalScore,
      correctAnswers,
      totalQuestions
    } = req.body;

    const updateData = {};
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;
    if (finalScore !== undefined) updateData.finalScore = finalScore;
    if (correctAnswers !== undefined) updateData.correctAnswers = correctAnswers;
    if (totalQuestions !== undefined) updateData.totalQuestions = totalQuestions;

    const updatedSession = await GameSession.findOneAndUpdate(
      { sessionId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSession) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found'
      });
    }

    res.json({
      success: true,
      message: 'Game session updated successfully',
      data: updatedSession
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating session',
      error: error.message
    });
  }
});

// @desc    Get user's game scores
// @route   GET /api/games/user-scores/:userId
// @access  Private
router.get('/user-scores/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const scores = await GameScore.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalScores = await GameScore.countDocuments({ userId });

    res.json({
      success: true,
      data: scores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalScores,
        pages: Math.ceil(totalScores / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user scores',
      error: error.message
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/games/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10, difficulty, timeFrame = 'all' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (timeFrame) {
      case 'daily':
        dateFilter = { createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) } };
        break;
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case 'monthly':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      // 'all' - no date filter
    }

    let matchStage = { status: 'completed', ...dateFilter };
    if (difficulty && difficulty !== 'all') {
      matchStage.difficulty = difficulty;
    }

    const leaderboard = await GameScore.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          username: { $first: '$username' },
          totalScore: { $sum: '$score' },
          gamesPlayed: { $sum: 1 },
          avgScore: { $avg: '$score' },
          lastPlayed: { $max: '$createdAt' }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: 1,
          totalScore: 1,
          gamesPlayed: 1,
          avgScore: { $round: ['$avgScore', 2] },
          lastPlayed: 1
        }
      }
    ]);

    // Add ranks
    const leaderboardWithRanks = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    res.json({
      success: true,
      data: leaderboardWithRanks,
      timeFrame,
      difficulty: difficulty || 'all',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message
    });
  }
});

// @desc    Get user's active sessions
// @route   GET /api/games/active-sessions/:userId
// @access  Private
router.get('/active-sessions/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const activeSessions = await GameSession.find({
      userId,
      status: 'active'
    }).sort({ startTime: -1 });

    res.json({
      success: true,
      data: activeSessions
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active sessions',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/games/user-stats/:userId
// @access  Private
router.get('/user-stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await GameScore.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalScore: { $sum: '$score' },
          totalGames: { $sum: 1 },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' },
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          gamesByDifficulty: {
            $push: {
              difficulty: '$difficulty',
              score: '$score'
            }
          }
        }
      }
    ]);

    const difficultyStats = await GameScore.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$difficulty',
          gamesPlayed: { $sum: 1 },
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' },
          bestScore: { $max: '$score' }
        }
      }
    ]);

    const user = await User.findById(userId).select('username avatar achievements');

    const defaultStats = {
      totalScore: 0,
      totalGames: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      avgScore: 0,
      bestScore: 0,
      accuracy: 0
    };

    const userStats = stats[0] ? {
      ...stats[0],
      accuracy: stats[0].totalQuestions > 0 
        ? Math.round((stats[0].totalCorrectAnswers / stats[0].totalQuestions) * 100)
        : 0
    } : defaultStats;

    res.json({
      success: true,
      data: {
        user: {
          username: user?.username,
          avatar: user?.avatar,
          achievements: user?.achievements || []
        },
        overallStats: userStats,
        difficultyStats,
        rank: await calculateUserRank(userId)
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user stats',
      error: error.message
    });
  }
});

// @desc    Get game statistics (admin only)
// @route   GET /api/games/stats
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement admin check)
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ success: false, message: 'Access denied' });
    // }

    const totalGames = await GameScore.countDocuments();
    const totalPlayers = await GameScore.distinct('userId').then(ids => ids.length);
    const totalScore = await GameScore.aggregate([
      { $group: { _id: null, total: { $sum: '$score' } } }
    ]);
    
    const gamesByDifficulty = await GameScore.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const recentGames = await GameScore.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username avatar');

    res.json({
      success: true,
      data: {
        totalGames,
        totalPlayers,
        totalScore: totalGames[0]?.total || 0,
        gamesByDifficulty,
        recentGames
      }
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching game stats',
      error: error.message
    });
  }
});

// @desc    Save mini-game score
// @route   POST /api/games/save-mini-game
// @access  Private
router.post('/save-mini-game', auth, async (req, res) => {
  try {
    const {
      userId,
      username,
      score,
      correctAnswers,
      totalQuestions,
      sessionId
    } = req.body;

    if (!userId || !username || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'UserId, username, and score are required'
      });
    }

    const miniGameScore = new GameScore({
      userId,
      username,
      score,
      difficulty: 'Easy', // Mini-games are typically easy
      status: 'completed',
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 0,
      gameType: 'mini-heart-counting',
      sessionId: sessionId || null,
      finalScore: score
    });

    await miniGameScore.save();

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalScore: score,
        gamesPlayed: 1,
        correctAnswers: correctAnswers || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Mini-game score saved successfully',
      data: miniGameScore
    });
  } catch (error) {
    console.error('Save mini-game score error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving mini-game score',
      error: error.message
    });
  }
});

// Helper function to calculate user rank
async function calculateUserRank(userId) {
  const userTotalScore = await GameScore.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'completed' } },
    { $group: { _id: null, totalScore: { $sum: '$score' } } }
  ]);

  if (!userTotalScore[0]) return null;

  const usersWithHigherScore = await GameScore.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$userId',
        totalScore: { $sum: '$score' }
      }
    },
    { $match: { totalScore: { $gt: userTotalScore[0].totalScore } } },
    { $count: 'count' }
  ]);

  return (usersWithHigherScore[0]?.count || 0) + 1;
}

module.exports = router;