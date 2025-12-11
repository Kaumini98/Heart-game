// gameAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const gameAPI = {
    // Save game score
    saveScore: async (gameData) => {
        try {
            const response = await api.post('/games/save-score', gameData);
            return response.data;
        } catch (error) {
            console.error('Error saving score:', error);
            throw error;
        }
    },
    
    // Get user's game history
    getUserScores: async (userId) => {
        try {
            const response = await api.get(`/games/user-scores/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user scores:', error);
            throw error;
        }
    },
    
    // Get leaderboard
    getLeaderboard: async (limit = 10) => {
        try {
            const response = await api.get(`/games/leaderboard?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    },
    
    // Save game session
    saveGameSession: async (sessionData) => {
        try {
            const response = await api.post('/games/save-session', sessionData);
            return response.data;
        } catch (error) {
            console.error('Error saving game session:', error);
            throw error;
        }
    },
    
    // Update game session
    updateGameSession: async (sessionId, updateData) => {
        try {
            const response = await api.put(`/games/session/${sessionId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating game session:', error);
            throw error;
        }
    },
    
    // Get user's active sessions
    getActiveSessions: async (userId) => {
        try {
            const response = await api.get(`/games/active-sessions/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching active sessions:', error);
            throw error;
        }
    },
    
    // Get user statistics
    getUserStats: async (userId) => {
        try {
            const response = await api.get(`/games/user-stats/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    },
    
    // Get game statistics (admin only)
    getGameStats: async () => {
        try {
            const response = await api.get('/games/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching game stats:', error);
            throw error;
        }
    },
    
    // Save mini-game progress
    saveMiniGameScore: async (miniGameData) => {
        try {
            const response = await api.post('/games/save-mini-game', miniGameData);
            return response.data;
        } catch (error) {
            console.error('Error saving mini-game score:', error);
            throw error;
        }
    },
    
    // Get user's achievement progress
    getUserAchievements: async (userId) => {
        try {
            const response = await api.get(`/games/achievements/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching achievements:', error);
            throw error;
        }
    },
    
    // Unlock achievement
    unlockAchievement: async (achievementData) => {
        try {
            const response = await api.post('/games/unlock-achievement', achievementData);
            return response.data;
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            throw error;
        }
    }
};

// Mock data for development/demo purposes
export const mockGameAPI = {
    saveScore: async (gameData) => {
        console.log('Mock: Saving score:', gameData);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            message: 'Score saved successfully',
            scoreId: `score_${Date.now()}`,
            ...gameData
        };
    },
    
    saveGameSession: async (sessionData) => {
        console.log('Mock: Saving game session:', sessionData);
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            sessionId: `session_${Date.now()}`,
            ...sessionData
        };
    },
    
    updateGameSession: async (sessionId, updateData) => {
        console.log('Mock: Updating game session:', sessionId, updateData);
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            message: 'Session updated successfully',
            sessionId,
            ...updateData
        };
    },
    
    getUserScores: async (userId) => {
        console.log('Mock: Fetching user scores for:', userId);
        await new Promise(resolve => setTimeout(resolve, 400));
        return {
            success: true,
            scores: [
                {
                    id: '1',
                    userId,
                    score: 150,
                    difficulty: 'Medium',
                    correctAnswers: 5,
                    totalQuestions: 8,
                    date: new Date().toISOString()
                },
                {
                    id: '2',
                    userId,
                    score: 200,
                    difficulty: 'Easy',
                    correctAnswers: 7,
                    totalQuestions: 7,
                    date: new Date(Date.now() - 86400000).toISOString()
                }
            ]
        };
    },
    
    getLeaderboard: async (limit = 10) => {
        console.log('Mock: Fetching leaderboard');
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockUsers = [
            { username: 'CarrotMaster', score: 450, rank: 1 },
            { username: 'ThumperFan', score: 380, rank: 2 },
            { username: 'BunnyHop', score: 320, rank: 3 },
            { username: 'CarrotCounter', score: 290, rank: 4 },
            { username: 'JungleExplorer', score: 260, rank: 5 },
        ];
        return {
            success: true,
            leaderboard: mockUsers.slice(0, limit),
            updatedAt: new Date().toISOString()
        };
    }
};

// Helper function to determine which API to use (real or mock)
export const getGameAPI = () => {
    // Use mock API if no real API URL is set (for development/demo)
    if (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL === 'http://localhost:5000/api') {
        console.log('Using mock game API for development');
        return mockGameAPI;
    }
    return gameAPI;
};

// Default export with the appropriate API
export default getGameAPI();