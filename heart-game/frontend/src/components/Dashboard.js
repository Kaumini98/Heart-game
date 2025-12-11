import React, { useState, useEffect } from 'react';
import { gameAPI } from './gameAPI';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, onStartGame }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [userScores, setUserScores] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('global');
    const [userStats, setUserStats] = useState({
        highScore: 0,
        totalPearls: 0,
        gamesPlayed: 0
    });

    useEffect(() => {
        if (user?.id) {
            fetchUserScores();
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            setIsLoading(true);
            const response = await gameAPI.getLeaderboard(3);
            if (response.success) {
                setLeaderboardData(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLeaderboardData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserScores = async () => {
        try {
            if (user?.id) {
                const response = await gameAPI.getUserScores(user.id);
                if (response.success && response.data) {
                    const scores = response.data;
                    setUserScores(scores);
                    
                    // Calculate stats
                    const highScore = scores.length > 0 
                        ? Math.max(...scores.map(score => score.score || 0))
                        : 0;
                    
                    const totalPearls = scores.reduce((total, score) => 
                        total + (score.score || 0), 0
                    );
                    
                    const gamesPlayed = scores.length;

                    setUserStats({
                        highScore,
                        totalPearls,
                        gamesPlayed
                    });
                } else {
                    setUserStats({
                        highScore: 0,
                        totalPearls: 0,
                        gamesPlayed: 0
                    });
                    setUserScores([]);
                }
            }
        } catch (error) {
            console.error('Error fetching user scores:', error);
            setUserScores([]);
            setUserStats({
                highScore: 0,
                totalPearls: 0,
                gamesPlayed: 0
            });
        }
    };

    const handleShowLeaderboard = async () => {
        setShowLeaderboard(true);
        setActiveTab('global');
        await fetchLeaderboard();
        await fetchUserScores();
    };

    const handleCloseLeaderboard = () => {
        setShowLeaderboard(false);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏆';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'Easy': return '#4CAF50';
            case 'Medium': return '#FF9800';
            case 'Hard': return '#F44336';
            case 'Expert': return '#9C27B0';
            default: return '#666';
        }
    };

    const getTopUserScores = () => {
        return userScores
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
    };

    return (
        <div className="dashboard-container">
            {/* Background Elements */}
            <div className="dashboard-background">
                <div className="ocean-waves">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                </div>
                <div className="floating-bubbles">
                    <div className="bubble bubble-1">🫧</div>
                    <div className="bubble bubble-2">🫧</div>
                    <div className="bubble bubble-3">🫧</div>
                    <div className="bubble bubble-4">🫧</div>
                    <div className="bubble bubble-5">🫧</div>
                    <div className="bubble bubble-6">🫧</div>
                </div>
                <div className="ocean-creatures">
                    <div className="creature fish-1">🐠</div>
                    <div className="creature fish-2">🐟</div>
                    <div className="creature turtle">🐢</div>
                    <div className="creature dolphin">🐬</div>
                </div>
                <div className="coral-reef">
                    <div className="coral coral-1">🪸</div>
                    <div className="coral coral-2">🪸</div>
                    <div className="coral coral-3">🪸</div>
                    <div className="seaweed seaweed-1">🌿</div>
                    <div className="seaweed seaweed-2">🌱</div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Header with User Info */}
                <header className="dashboard-header">
                    <div className="user-profile">
                        <div className="profile-avatar">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <h3 className="username">@{user?.username}</h3>
                            <p className="user-email">{user?.email}</p>
                            <p className="user-id">ID: {user?.id}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>
                        <svg className="logout-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2"/>
                            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 12H9" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Return to Shore
                    </button>
                </header>

                {/* Main Game Content */}
                <main className="game-content">
                    <div className="welcome-card">
                        <div className="card-header">
                            <div className="fish-character">
                                <div className="finn-fish">
                                    <div className="fish-body"></div>
                                    <div className="fish-tail"></div>
                                    <div className="fish-fin"></div>
                                    <div className="fish-eye"></div>
                                </div>
                            </div>
                            <h1 className="welcome-title">
                                Welcome to the Deep!❤️
                            </h1>
                        </div>

                        <div className="game-description">
                            <p className="description-text">
                                Dive into an underwater adventure with Finn the Fish,
                                as he bravely searches for precious Red Hearts beneath the ocean waves! 
                                Explore the ocean depths, collect Hearts❤️ and pearls💎, and discover 
                                hidden treasures along the way. Ready to make a splash? 
                                Tap Start to begin your oceanic journey! 
                            </p>
                            
                            <div className="game-features">
                                <div className="feature">
                                    <span className="feature-icon">❤️</span>
                                    <span>Collect Hearts</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🌊</span>
                                    <span>Navigate Currents</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>Discover Treasures</span>
                                </div>
                            </div>
                        </div>

                        <button className="start-button" onClick={onStartGame}>
                            <span className="button-content">
                                <span className="button-text">Start Diving</span>
                                <span className="button-emoji">🌊</span>
                            </span>
                            <div className="button-shine"></div>
                        </button>
                    </div>

                    {/* Stats Preview */}
                    {/* <div className="stats-preview">
                        <div className="stat-card">
                            <div className="stat-icon">🏆</div>
                            <div className="stat-info">
                                <h4>High Score</h4>
                                <p>{userStats.highScore}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💎</div>
                            <div className="stat-info">
                                <h4>Pearls</h4>
                                <p>{userStats.totalPearls}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <h4>Dives</h4>
                                <p>{userStats.gamesPlayed}</p>
                            </div>
                        </div>
                    </div> */}

                    {/* Leaderboard Button */}
                    <div className="leaderboard-section">
                        <button 
                            className="leaderboard-btn"
                            onClick={handleShowLeaderboard}
                        >
                            <span className="leaderboard-icon">📊</span>
                            View Ocean Rankings
                        </button>
                    </div>
                </main>
            </div>

            {/* Leaderboard Popup */}
            {showLeaderboard && (
                <div className="leaderboard-popup-overlay">
                    <div className="leaderboard-popup">
                        <div className="leaderboard-header">
                            <h2>🏆 Ocean Rankings 🏆</h2>
                            <button 
                                className="close-leaderboard-btn"
                                onClick={handleCloseLeaderboard}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="leaderboard-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
                                onClick={() => handleTabChange('global')}
                            >
                                🌍 Global Top 3
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => handleTabChange('personal')}
                            >
                                👤 My Best Dives
                            </button>
                        </div>

                        <div className="leaderboard-content">
                            {isLoading ? (
                                <div className="leaderboard-loading">
                                    <div className="loading-spinner"></div>
                                    <p>Diving for rankings...</p>
                                </div>
                            ) : activeTab === 'global' ? (
                                leaderboardData.length > 0 ? (
                                    <div className="leaderboard-list">
                                        {leaderboardData.map((player, index) => (
                                            <div 
                                                key={player.userId || index} 
                                                className={`leaderboard-item ${index === 0 ? 'first-place' : ''}`}
                                            >
                                                <div className="player-rank">
                                                    <span className="rank-icon">
                                                        {getRankIcon(index + 1)}
                                                    </span>
                                                    <span className="rank-number">#{index + 1}</span>
                                                </div>
                                                
                                                <div className="player-info">
                                                    <div className="player-name">
                                                        @{player.username}
                                                        {player.userId === user?.id && (
                                                            <span className="you-badge"> (You)</span>
                                                        )}
                                                    </div>
                                                    <div className="player-stats">
                                                        <span className="player-score">
                                                            {player.totalScore} 💎
                                                        </span>
                                                        <span 
                                                            className="player-difficulty"
                                                            style={{ color: getDifficultyColor(player.difficulty) }}
                                                        >
                                                            {player.difficulty || 'Easy'}
                                                        </span>
                                                    </div>
                                                    {player.lastPlayed && (
                                                        <div className="player-date">
                                                            {formatDate(player.lastPlayed)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="player-additional-stats">
                                                    <div className="additional-stat">
                                                        <span className="stat-label">Dives:</span>
                                                        <span className="stat-value">{player.gamesPlayed || 1}</span>
                                                    </div>
                                                    {player.avgScore && (
                                                        <div className="additional-stat">
                                                            <span className="stat-label">Avg:</span>
                                                            <span className="stat-value">{Math.round(player.avgScore)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="leaderboard-empty">
                                        <div className="empty-icon">🌊</div>
                                        <h3>No Ocean Rankings Yet</h3>
                                        <p>Be the first to dive and top the ocean rankings!</p>
                                        <button 
                                            className="start-from-leaderboard-btn"
                                            onClick={onStartGame}
                                        >
                                            Start Diving
                                        </button>
                                    </div>
                                )
                            ) : (
                                // Personal Scores Tab
                                getTopUserScores().length > 0 ? (
                                    <div className="leaderboard-list">
                                        {getTopUserScores().map((score, index) => (
                                            <div 
                                                key={score._id || index} 
                                                className="leaderboard-item personal-score"
                                            >
                                                <div className="player-rank">
                                                    <span className="rank-icon">
                                                        {getRankIcon(index + 1)}
                                                    </span>
                                                    <span className="rank-number">#{index + 1}</span>
                                                </div>
                                                
                                                <div className="player-info">
                                                    <div className="player-name">
                                                        @{user.username}
                                                        <span className="you-badge"> (You)</span>
                                                    </div>
                                                    <div className="player-stats">
                                                        <span className="player-score">
                                                            {score.score || 0} 💎
                                                        </span>
                                                        <span 
                                                            className="player-difficulty"
                                                            style={{ color: getDifficultyColor(score.difficulty) }}
                                                        >
                                                            {score.difficulty || 'Easy'}
                                                        </span>
                                                    </div>
                                                    {score.createdAt && (
                                                        <div className="player-date">
                                                            {formatDate(score.createdAt)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="player-additional-stats">
                                                    <div className="additional-stat">
                                                        <span className="stat-label">Correct:</span>
                                                        <span className="stat-value">{score.correctAnswers || 0}</span>
                                                    </div>
                                                    <div className="additional-stat">
                                                        <span className="stat-label">Total Q:</span>
                                                        <span className="stat-value">{score.totalQuestions || 0}</span>
                                                    </div>
                                                    {score.gameType && (
                                                        <div className="additional-stat">
                                                            <span className="stat-label">Type:</span>
                                                            <span className="stat-value">
                                                                {score.gameType === 'mini-pearl-collecting' ? 'Mini' : 'Main'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="leaderboard-empty">
                                        <div className="empty-icon">🐠</div>
                                        <h3>No Dive Records Yet</h3>
                                        <p>Start diving to track your personal best scores!</p>
                                        <button 
                                            className="start-from-leaderboard-btn"
                                            onClick={onStartGame}
                                        >
                                            Start Diving
                                        </button>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="leaderboard-footer">
                            <p>🎯 Dive deeper to climb the ocean rankings!</p>
                            {activeTab === 'personal' && getTopUserScores().length > 0 && (
                                <p className="personal-stats-summary">
                                    Your best: <strong>{userStats.highScore} pearls</strong> • Total: <strong>{userStats.totalPearls} pearls</strong> • Dives: <strong>{userStats.gamesPlayed}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;