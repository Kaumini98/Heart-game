import React, { useState, useEffect, useRef } from 'react';
import { gameAPI } from './gameAPI';
import './GamePage.css';

// Sound Manager Component
const SoundManager = () => {
  const sounds = useRef({
    background: new Audio('/sounds/ocean-waves.mp3'),
    correct: new Audio('/sounds/bubble-pop.mp3'),
    wrong: new Audio('/sounds/wrong-answer.mp3'),
    timeout: new Audio('/sounds/timeout.mp3'),
    gameOver: new Audio('/sounds/game-over.mp3'),
    buttonClick: new Audio('/sounds/button-click.mp3'),
    countdown: new Audio('/sounds/countdown-beep.mp3'),
    fishHappy: new Audio('/sounds/fish-happy.mp3'),
    fishSad: new Audio('/sounds/fish-sad.mp3'),
    treasureCollect: new Audio('/sounds/treasure-collect.mp3'),
    miniGameStart: new Audio('/sounds/mini-game-start.mp3'),
    popupOpen: new Audio('/sounds/popup-open.mp3'),
    popupClose: new Audio('/sounds/popup-close.mp3')
  });

  // Preload sounds
  useEffect(() => {
    Object.values(sounds.current).forEach(sound => {
      sound.preload = 'auto';
      sound.load();
    });
  }, []);

  const playSound = (soundName, options = {}) => {
    const sound = sounds.current[soundName];
    if (!sound) return;

    sound.volume = options.volume || 0.7;
    sound.currentTime = 0;
    
    if (options.loop) {
      sound.loop = true;
    }
    
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  const stopSound = (soundName) => {
    const sound = sounds.current[soundName];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  };

  const setVolume = (soundName, volume) => {
    const sound = sounds.current[soundName];
    if (sound) {
      sound.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return {
    playSound,
    stopSound,
    setVolume
  };
};

const GamePage = ({ user, gameSettings, onBack }) => {
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [gameStatus, setGameStatus] = useState('playing');
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [fishAnimation, setFishAnimation] = useState('idle');
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameSessionId, setGameSessionId] = useState(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isMiniGame, setIsMiniGame] = useState(false);
  const [miniGameChances, setMiniGameChances] = useState(3);
  const [showMiniGamePopup, setShowMiniGamePopup] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const countdownSoundRef = useRef(null);
  const lastTimeWarningRef = useRef(null);

  // Initialize Sound Manager
  const soundManager = SoundManager();

  // Simple pearl counting mini-game data
  const miniGames = [
    {
      question: "",
      solution: 0,
      pearls: 5,
      description: "No pearls! Count carefully!"
    },
    {
      question: "💎",
      solution: 1,
      pearls: 5
    },
    {
      question: "💎💎",
      solution: 2,
      pearls: 10
    },
    {
      question: "💎💎💎",
      solution: 3,
      pearls: 10
    },
    {
      question: "💎💎💎💎",
      solution: 4,
      pearls: 10
    },
    {
      question: "💎💎💎💎💎",
      solution: 5,
      pearls: 15
    },
    {
      question: "💎💎💎💎💎💎",
      solution: 6,
      pearls: 20
    },
    {
      question: "💎💎💎💎💎💎💎",
      solution: 7,
      pearls: 25
    },
    {
      question: "💎💎💎💎💎💎💎💎",
      solution: 8,
      pearls: 30
    }
  ];

  // Sound effect functions
  const playBackgroundMusic = () => {
    if (musicEnabled) {
      soundManager.playSound('background', { volume: 0.1, loop: true });
    }
  };

  const stopBackgroundMusic = () => {
    soundManager.stopSound('background');
  };

  const playSoundEffect = (soundName, options = {}) => {
    if (soundEnabled) {
      soundManager.playSound(soundName, options);
    }
  };

  const playButtonClick = () => {
    playSoundEffect('buttonClick', { volume: 0.5 });
  };

  const playCountdownBeep = () => {
    playSoundEffect('countdown', { volume: 0.4 });
  };

  const playCorrectSound = () => {
    playSoundEffect('correct', { volume: 0.8 });
    playSoundEffect('treasureCollect', { volume: 0.6 });
    playSoundEffect('fishHappy', { volume: 0.7 });
  };

  const playWrongSound = () => {
    playSoundEffect('wrong', { volume: 0.8 });
    playSoundEffect('fishSad', { volume: 0.7 });
  };

  const playGameOverSound = () => {
    playSoundEffect('gameOver', { volume: 0.8 });
    stopBackgroundMusic();
  };

  const playTimeoutSound = () => {
    playSoundEffect('timeout', { volume: 0.8 });
    playSoundEffect('fishSad', { volume: 0.7 });
  };

  const playPopupSound = () => {
    playSoundEffect('popupOpen', { volume: 0.6 });
  };

  const playMiniGameStart = () => {
    playSoundEffect('miniGameStart', { volume: 0.7 });
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      playButtonClick();
    }
  };

  // Toggle music
  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    if (musicEnabled) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
    playButtonClick();
  };

  // Get user from localStorage
  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : user;
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return user;
    }
  };

  // Get time based on difficulty from level selection
  const getTimeForDifficulty = () => {
    if (!gameSettings) return 60;

    switch (gameSettings.name) {
      case 'Easy': return 60;
      case 'Medium': return 40;
      case 'Hard': return 30;
      case 'Expert': return 15;
      default: return 60;
    }
  };

  // Save score to backend - ONLY FOR MAIN GAME
  const saveScoreToBackend = async (finalScore, status, correctAnswers) => {
    try {
      if (isMiniGame) {
        console.log('Mini-game score not saved to database');
        return;
      }

      const currentUser = getStoredUser();

      const statusMap = {
        'correct': 'completed',
        'wrong': 'completed',
        'timeout': 'completed',
        'gameOver': 'completed',
        'playing': 'active',
        'quit': 'completed'
      };

      const gameData = {
        userId: currentUser?.id,
        username: currentUser?.username,
        score: finalScore,
        difficulty: gameSettings?.name || 'Easy',
        status: statusMap[status] || 'completed',
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        gameType: 'pearl-counting',
        sessionId: gameSessionId
      };

      console.log('Saving score to database:', gameData);
      await gameAPI.saveScore(gameData);
      console.log('Score saved successfully to database');
    } catch (error) {
      console.error('Error saving score to database:', error);
    }
  };

  // Start new game session
  const startNewGameSession = async () => {
    try {
      const currentUser = getStoredUser();
      const sessionData = {
        userId: currentUser?.id,
        username: currentUser?.username,
        difficulty: gameSettings?.name || 'Easy',
        startTime: new Date().toISOString(),
        status: 'active'
      };

      const response = await gameAPI.saveGameSession(sessionData);
      setGameSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Error starting game session:', error);
    }
  };

  // Update game session
  const updateGameSession = async (status, finalScore) => {
    try {
      if (gameSessionId) {
        const updateData = {
          endTime: new Date().toISOString(),
          status: status,
          finalScore: finalScore,
          correctAnswers: consecutiveCorrect,
          totalQuestions: totalQuestions
        };

        console.log('Updating session:', gameSessionId, updateData);
        await gameAPI.updateGameSession(gameSessionId, updateData);
      }
    } catch (error) {
      console.error('Error updating game session:', error);
    }
  };

  // Fetch question from heart API
  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFishAnimation('thinking');
      setIsMiniGame(false);

      const response = await fetch('https://marcconrad.com/uob/heart/api.php');

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setQuestionData(data);
      setGameStatus('playing');
      setUserAnswer('');

      // Reset timer for new question with the correct difficulty time
      const initialTime = getTimeForDifficulty();
      setTimeLeft(initialTime);
      setFishAnimation('idle');

      // Increment total questions counter
      setTotalQuestions(prev => prev + 1);

      // Play new question sound
      playButtonClick();

    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to load question. Please try again.');
      setFishAnimation('sad');
      playWrongSound();
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Simple pearl counting mini-game
  const startMiniGame = () => {
    setIsLoading(true);
    setFishAnimation('excited');
    playMiniGameStart();

    setTimeout(() => {
      // Select a random mini-game
      const randomGame = miniGames[Math.floor(Math.random() * miniGames.length)];
      setQuestionData(randomGame);
      setGameStatus('playing');
      setUserAnswer('');

      // Set shorter time for mini-game
      setTimeLeft(20);
      setIsMiniGame(true);
      setFishAnimation('idle');
      setIsLoading(false);

      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1000);
  };

  // Handle mini-game continuation
  const handleMiniGameContinue = () => {
    playButtonClick();
    setShowMiniGamePopup(false);
    setGameStatus('playing');
    
    // Start mini-game
    startMiniGame();
  };

  // Handle mini-game success
  const handleMiniGameSuccess = () => {
    setShowMiniGamePopup(false);
    setMiniGameChances(prev => prev - 1);
    setGameStatus('playing');
    setFishAnimation('happy');
    
    // Continue with main game
    setTimeout(() => {
      fetchQuestion();
    }, 1000);
  };

  // Handle mini-game failure
  const handleMiniGameFailure = () => {
    playWrongSound();
    setShowMiniGamePopup(false);
    setMiniGameChances(prev => prev - 1);
    
    if (miniGameChances <= 1) {
      // No more chances, game over
      handleGameOver('wrong');
    } else {
      // Show mini-game popup again
      setTimeout(() => {
        setShowMiniGamePopup(true);
        playPopupSound();
      }, 500);
    }
  };

  // Handle quit game
  const handleQuitGame = async () => {
    playButtonClick();
    stopBackgroundMusic();
    
    // Save current score to database before quitting
    await saveScoreToBackend(score, 'quit', consecutiveCorrect);
    await updateGameSession('completed', score);
    
    // Go back to main menu
    onBack();
  };

  // Handle quit confirmation
  const handleQuitConfirm = () => {
    playButtonClick();
    setShowQuitConfirm(true);
    playPopupSound();
  };

  // Handle cancel quit
  const handleCancelQuit = () => {
    playButtonClick();
    setShowQuitConfirm(false);
  };

  useEffect(() => {
    const initialTime = getTimeForDifficulty();
    setTimeLeft(initialTime);
    fetchQuestion();
    startNewGameSession();
    playBackgroundMusic();

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownSoundRef.current) {
        clearInterval(countdownSoundRef.current);
      }
      stopBackgroundMusic();
      
      // Auto-save if game is in progress when leaving
      if (gameStatus === 'playing' && !isMiniGame && score > 0) {
        saveScoreToBackend(score, 'quit', consecutiveCorrect);
      }
    };
  }, []);

  // Countdown timer effect with sound
  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing' && questionData) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);

        // Play countdown beep when time is running out
        const totalTime = isMiniGame ? 20 : getTimeForDifficulty();
        if (timeLeft <= 5 && timeLeft > 0) {
          playCountdownBeep();
        }

        // Change fish animation based on time left
        if (timeLeft <= totalTime * 0.3) {
          setFishAnimation('nervous');
        } else if (timeLeft <= totalTime * 0.6) {
          setFishAnimation('alert');
        }
      }, 1000);
    } else if (timeLeft === 0 && gameStatus === 'playing' && questionData) {
      if (isMiniGame) {
        handleMiniGameFailure();
      } else {
        handleGameOver('timeout');
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, gameStatus, questionData]);

  // Reset timer when game status changes
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownSoundRef.current) {
        clearInterval(countdownSoundRef.current);
      }
    }
  }, [gameStatus]);

  // Handle game over
  const handleGameOver = async (reason) => {
    setGameStatus('gameOver');
    setFishAnimation('sad');

    if (reason === 'timeout') {
      playTimeoutSound();
    } else {
      playGameOverSound();
    }

    // Save score to backend ONLY for main game
    if (!isMiniGame) {
      await saveScoreToBackend(score, reason, consecutiveCorrect);
      await updateGameSession('completed', score);
    }

    // Show game over popup after a short delay
    setTimeout(() => {
      setShowGameOver(true);
      playPopupSound();
    }, 1000);
  };

  // Handle answer submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    playButtonClick();
    
    if (!userAnswer.trim() || !questionData || gameStatus !== 'playing') return;

    const userAnswerNum = parseInt(userAnswer);
    
    // Allow 0 as valid answer
    if (userAnswerNum === questionData.solution) {
      if (isMiniGame) {
        // Mini-game success
        setGameStatus('correct');
        const pearlsEarned = questionData.pearls;
        const newScore = score + pearlsEarned;
        setScore(newScore);
        setFishAnimation('happy');
        
        playCorrectSound();
        
        // Show success message and then continue to main game
        setTimeout(() => {
          handleMiniGameSuccess();
        }, 1500);
      } else {
        // Main game success
        setGameStatus('correct');
        const pearlsEarned = questionData.pearls || 10;
        const newScore = score + pearlsEarned;
        setScore(newScore);
        setConsecutiveCorrect(prev => prev + 1);
        setFishAnimation('happy');
        
        playCorrectSound();
        
        // Save progress after correct answer to database
        await saveScoreToBackend(newScore, 'correct', consecutiveCorrect + 1);
      }
    } else {
      if (isMiniGame) {
        // Mini-game failure
        handleMiniGameFailure();
      } else {
        // Main game failure - offer mini-game chance
        playWrongSound();
        if (miniGameChances > 0) {
          setShowMiniGamePopup(true);
          playPopupSound();
        } else {
          handleGameOver('wrong');
        }
      }
    }
  };

  // Continue with mini-game (from game over popup)
  const handleContinue = async () => {
    playButtonClick();
    setShowGameOver(false);
    setGameStatus('playing');
    setMiniGameChances(3); // Reset chances
    
    // Start mini-game instead of regular game
    startMiniGame();
  };

  // Try again - restart the game
  const handleTryAgain = async () => {
    playButtonClick();
    setShowGameOver(false);
    setShowMiniGamePopup(false);
    setShowQuitConfirm(false);

    // Reset all game state
    setScore(0);
    setConsecutiveCorrect(0);
    setTotalQuestions(0);
    setGameStatus('playing');
    setFishAnimation('idle');
    setIsMiniGame(false);
    setMiniGameChances(3);

    // Start new session
    await startNewGameSession();

    // Load new question from main API
    await fetchQuestion();
  };

  // Next Question (for correct answers in main game)
  const handleNext = () => {
    playButtonClick();
    setFishAnimation('excited');
    setTimeout(() => {
      fetchQuestion();
    }, 500);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const totalTime = isMiniGame ? 20 : getTimeForDifficulty();
    const percentage = (timeLeft / totalTime) * 100;

    if (percentage > 50) return '#4facfe';
    if (percentage > 25) return '#FF9800';
    return '#F44336';
  };

  // Get timer warning state
  const getTimerWarning = () => {
    const totalTime = isMiniGame ? 20 : getTimeForDifficulty();
    const percentage = (timeLeft / totalTime) * 100;

    if (percentage > 50) return 'normal';
    if (percentage > 25) return 'warning';
    return 'critical';
  };

  // Get fish emoji based on animation state
  const getFishEmoji = () => {
    switch (fishAnimation) {
      case 'happy': return '🐠✨';
      case 'sad': return '🐠😢';
      case 'excited': return '🐠⚡';
      case 'thinking': return '🐠🤔';
      case 'nervous': return '🐠😰';
      case 'alert': return '🐠👀';
      case 'timeout': return '🐠⏰';
      case 'idle':
      default: return '🐠';
    }
  };

  return (
    <div className="ocean-game-container">
      {/* Ocean Background */}
      <div className="ocean-game-background">
        <div className="ocean-wave wave-1"></div>
        <div className="ocean-wave wave-2"></div>
        <div className="ocean-wave wave-3"></div>
        <div className="seaweed seaweed-1">🌿</div>
        <div className="seaweed seaweed-2">🌱</div>
        <div className="coral coral-1">🪸</div>
        <div className="coral coral-2">🪸</div>
        <div className="coral coral-3">🪸</div>
        <div className="bubble bubble-1">🫧</div>
        <div className="bubble bubble-2">🫧</div>
        <div className="bubble bubble-3">🫧</div>
        <div className="bubble bubble-4">🫧</div>
        <div className="treasure-chest">🗝️</div>
        <div className="shell shell-1">🐚</div>
        <div className="shell shell-2">🐚</div>
      </div>

      <div className="ocean-game-content">
        {/* Header */}
        <header className="ocean-game-header">
          <div className="ocean-header-left">
            <button className="ocean-back-button" onClick={handleQuitConfirm}>
              <span className="ocean-back-icon">←</span>
              Return to Shore
            </button>
          </div>

          <div className="ocean-header-center">
            <h1>
              {isMiniGame ? "Finn's Quick Challenge" : "Finn's Heart Hunt"}
            </h1>
            <p>
              {isMiniGame
                ? "Quick! Count the pearls before time runs out!"
                : "Help Finn count the Hearts in the ocean depths!"
              }
            </p>
            {gameSettings && !isMiniGame && (
              <div className="ocean-difficulty-info">
                <span className="ocean-difficulty-badge">{gameSettings.name} Depth</span>
                <span className="ocean-difficulty-time">{getTimeForDifficulty()}s per question</span>
              </div>
            )}
            {isMiniGame && (
              <div className="ocean-difficulty-info">
                <span className="ocean-difficulty-badge" style={{ background: '#FF9800' }}>Mini-Game</span>
                <span className="ocean-difficulty-time">20s per question</span>
              </div>
            )}
          </div>

          <div className="ocean-header-right">
            <div className="ocean-user-stats">
              <div className="ocean-stat-item">
                <span className="ocean-stat-label">Diver</span>
                <span className="ocean-stat-value">@{user?.username}</span>
              </div>
              <div className="ocean-stat-item">
                <span className="ocean-stat-label">Hearts</span>
                <span className="ocean-stat-value">{score} ❤️</span>
              </div>
              <div className="ocean-stat-item">
                <span className="ocean-stat-label">Streak</span>
                <span className="ocean-stat-value">{consecutiveCorrect} 🔥</span>
              </div>
              {!isMiniGame && (
                <div className="ocean-stat-item">
                  <span className="ocean-stat-label">Second Chances</span>
                  <span className="ocean-stat-value">{miniGameChances} 🎯</span>
                </div>
              )}
            </div>
            
            {/* Sound Controls */}
            <div className="ocean-sound-controls">
              <button 
                className={`sound-control-btn ${soundEnabled ? 'active' : ''}`}
                onClick={toggleSound}
                title={soundEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
              <button 
                className={`sound-control-btn ${musicEnabled ? 'active' : ''}`}
                onClick={toggleMusic}
                title={musicEnabled ? "Disable Music" : "Enable Music"}
              >
                {musicEnabled ? '🎵' : '🎵❌'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="ocean-main-content">
          {/* Left Side - Game Area */}
          <div className="ocean-game-area">
            {isLoading ? (
              <div className="ocean-loading-state">
                <div className="ocean-loading-spinner"></div>
                <div className="ocean-fish-animation">{getFishEmoji()}</div>
                <h3>
                  {isMiniGame ? "Finn is preparing a quick challenge..." : "Finn is exploring the ocean depths..."}
                </h3>
                <p>
                  {isMiniGame ? "Gathering pearls..." : "Searching for pearls and treasures..."}
                </p>
              </div>
            ) : error ? (
              <div className="ocean-error-state">
                <div className="ocean-error-icon">{getFishEmoji()}</div>
                <h3>Oh no! The current is too strong!</h3>
                <p>{error}</p>
                <button onClick={isMiniGame ? startMiniGame : fetchQuestion} className="ocean-retry-button">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="ocean-game-card">
                {/* Fish Character */}
                <div className="ocean-fish-character">
                  <div className={`finn-fish ${fishAnimation}`}>
                    <div className="fish-body"></div>
                    <div className="fish-tail"></div>
                    <div className="fish-fin"></div>
                    <div className="fish-eye"></div>
                  </div>
                  <div className="fish-message">
                    {gameStatus === 'playing' && timeLeft > (isMiniGame ? 6 : getTimeForDifficulty() * 0.3) &&
                      (isMiniGame ? "Quick! Count these pearls!" : "Count the pearls quickly!")}
                    {gameStatus === 'playing' && timeLeft <= (isMiniGame ? 6 : getTimeForDifficulty() * 0.3) && "Hurry up! The current is changing!"}
                    {gameStatus === 'correct' && isMiniGame && "Excellent! You found bonus pearls! 🎉"}
                    {gameStatus === 'correct' && !isMiniGame && "Wonderful! You got it right! 🎉"}
                    {gameStatus === 'wrong' && "Oh no! Let's try again! 💪"}
                    {gameStatus === 'timeout' && "Too slow! The current carried them away! 🌊"}
                    {gameStatus === 'gameOver' && "Game Over! Let's dive again! 🎮"}
                  </div>
                </div>

                {/* Timer Display */}
                {gameStatus === 'playing' && questionData && (
                  <div className="ocean-timer-section">
                    <div className={`ocean-timer-display ${getTimerWarning()}`}>
                      <div className="ocean-timer-circle">
                        <svg className="ocean-timer-svg" viewBox="0 0 100 100">
                          <circle
                            className="ocean-timer-bg"
                            cx="50"
                            cy="50"
                            r="45"
                          />
                          <circle
                            className="ocean-timer-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            style={{
                              stroke: getTimerColor(),
                              strokeDashoffset: 283 - (283 * timeLeft) / (isMiniGame ? 20 : getTimeForDifficulty())
                            }}
                          />
                        </svg>
                        <div className="ocean-timer-text">
                          <span className="ocean-time-left">{formatTime(timeLeft)}</span>
                          <span className="ocean-timer-label">Current Strength</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="ocean-game-card-header">
                  <h2>
                    {isMiniGame ? "Count the Pearls! 💎" : "Count the Hearts! ❤️"}
                  </h2>
                  <p>
                    {isMiniGame
                      ? questionData?.description || "How many pearls do you see below?"
                      : "How many Hearts can you spot in the image below?"
                    }
                  </p>
                  {isMiniGame && questionData?.solution === 0 && (
                    <div className="zero-pearl-warning">
                      ⚠️ Careful! There might be zero pearls!
                    </div>
                  )}
                </div>

                <div className="ocean-image-container">
                  {isMiniGame ? (
                    <div className="mini-game-display">
                      <div className="pearl-display">
                        {questionData?.question || "No pearls visible!"}
                      </div>
                      {!questionData?.question && (
                        <div className="empty-pearl-message">
                          Look carefully! No pearls here!
                        </div>
                      )}
                      <div className="mini-game-hint">
                        {questionData?.solution === 0 
                          ? "Look carefully! Count might be zero!" 
                          : "Simple pearl counting challenge!"
                        }
                      </div>
                    </div>
                  ) : (
                    <img
                      src={questionData?.question}
                      alt="Pearl counting puzzle"
                      className="ocean-puzzle-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/4facfe/ffffff?text=Pearl+Counting+Puzzle';
                      }}
                    />
                  )}
                </div>

                {/* Answer Section */}
                {gameStatus === 'playing' && questionData && (
                  <div className="ocean-answer-section">
                    <form onSubmit={handleSubmit} className="ocean-answer-form">
                      <div className="ocean-input-container">
                        <input
                          ref={inputRef}
                          type="number"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder={isMiniGame 
                            ? "Enter number (0 is possible)..." 
                            : "Enter total number (0 is possible)..."
                          }
                          min="0"
                          max={isMiniGame ? "10" : "100"}
                          required
                          disabled={gameStatus !== 'playing'}
                        />
                        <button
                          type="submit"
                          className="ocean-submit-btn"
                          disabled={!userAnswer.trim()}
                        >
                          <span>Submit Answer</span>
                          <span className="ocean-btn-icon">🎯</span>
                        </button>
                      </div>
                    </form>
                    <div className="zero-hint">
                      💡 Remember: 0 can be a valid answer if there are no pearls!
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {gameStatus === 'correct' && !isMiniGame && (
                  <div className={`ocean-results-section ${gameStatus}`}>
                    <div className="ocean-result-icon">
                      🎉
                    </div>
                    <div className="ocean-result-text">
                      <h3>Brilliant! 🎊</h3>
                      <p>
                        Finn is delighted! You earned {questionData?.pearls || 10} Hearts❤️! 
                      </p>
                    </div>
                    <button onClick={handleNext} className="ocean-next-btn">
                      <span>Dive Deeper</span>
                      <span className="ocean-btn-icon">➡️</span>
                    </button>
                  </div>
                )}

                {gameStatus === 'correct' && isMiniGame && (
                  <div className={`ocean-results-section ${gameStatus}`}>
                    <div className="ocean-result-icon">
                      🎯
                    </div>
                    <div className="ocean-result-text">
                      <h3>Mini-Game Success! 🎊</h3>
                      <p>
                        You earned {questionData?.pearls} bonus pearls! Continue to main game...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Instructions */}
          <div className="ocean-instructions-sidebar">
            <div className="ocean-instructions-card">
              <h3>
                {isMiniGame ? "Mini-Game Rules 📝" : "How to Play 📝"}
              </h3>
              <div className="ocean-instructions-list">
                {isMiniGame ? (
                  <>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">👀</span>
                      <span>Count the pearls shown above carefully</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">⏱️</span>
                      <span>You have 20 seconds to answer</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">🔢</span>
                      <span>Enter the number (0 is possible!)</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">✅</span>
                      <span>Get it right to earn bonus pearls and continue!</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">👀</span>
                      <span>Count all Hearts in the image carefully</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">⏱️</span>
                      <span>Answer before the ocean current changes!</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">🔢</span>
                      <span>Enter the total number (0 is possible!)</span>
                    </div>
                    <div className="ocean-instruction-item">
                      <span className="ocean-instruction-icon">✅</span>
                      <span>Submit your answer to help Finn collect Hearts</span>
                    </div>
                  </>
                )}
                <div className="ocean-instruction-item">
                  <span className="ocean-instruction-icon">💎</span>
                  <span>Earn pearls for each correct answer</span>
                </div>
                {!isMiniGame && (
                  <div className="ocean-instruction-item">
                    <span className="ocean-instruction-icon">🎯</span>
                    <span>You have {miniGameChances} second chance(s) with mini-games</span>
                  </div>
                )}
              </div>

              <div className="ocean-pro-tips">
                <h4>Finn's Tips 💡</h4>
                <p>
                  {isMiniGame 
                    ? "This is your second chance! Count carefully but don't take too long!" 
                    : "Look for heart patterns and groups to count faster! Start from one corner and work systematically."
                  }
                </p>
                <p className="zero-tip">
                  🎯 <strong>Important:</strong> 0 can be a valid answer! Always count carefully!
                </p>
              </div>

              {/* Game Stats */}
              <div className="ocean-stats-card">
                <h4>Current Dive Stats</h4>
                <div className="ocean-stats-details">
                  <div className="stat-row">
                    <span>Current Score:</span>
                    <span className="stat-value">{score} ❤️</span>
                  </div>
                  <div className="stat-row">
                    <span>Correct Streak:</span>
                    <span className="stat-value">{consecutiveCorrect} 🔥</span>
                  </div>
                  <div className="stat-row">
                    <span>Total Questions:</span>
                    <span className="stat-value">{totalQuestions}</span>
                  </div>
                  <div className="stat-row">
                    <span>Second Chances:</span>
                    <span className="stat-value">{miniGameChances} 🎯</span>
                  </div>
                  <div className="stat-row">
                    <span>Game Mode:</span>
                    <span className="stat-value">{isMiniGame ? "Mini-Game" : "Main Game"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Confirmation Popup */}
      {showQuitConfirm && (
        <div className="ocean-popup-overlay">
          <div className="ocean-popup-dialog">
            <div className="ocean-popup-header">
              <div className="ocean-popup-icon">
                🏝️
              </div>
              <h2 className="ocean-popup-title">
                Return to Shore?
              </h2>
            </div>

            <div className="ocean-popup-content">
              <div className="ocean-final-stats">
                <div className="final-stat">
                  <span className="final-stat-label">Current Score</span>
                  <span className="final-stat-value">{score} 💎</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">Correct Answers</span>
                  <span className="final-stat-value">{consecutiveCorrect}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">Total Questions</span>
                  <span className="final-stat-value">{totalQuestions}</span>
                </div>
              </div>
              
              <p className="ocean-popup-message">
                Are you sure you want to return to shore? Your current progress will be saved to the database.
              </p>
            </div>

            <div className="ocean-popup-actions">
              <button 
                className="ocean-popup-button ocean-popup-button-secondary"
                onClick={handleCancelQuit}
              >
                <span className="button-icon">↶</span>
                Keep Diving
              </button>
              <button 
                className="ocean-popup-button ocean-popup-button-primary"
                onClick={handleQuitGame}
              >
                <span className="button-icon">🏝️</span>
                Return to Shore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini-Game Chance Popup */}
      {showMiniGamePopup && (
        <div className="ocean-popup-overlay">
          <div className="ocean-popup-dialog mini-game-popup">
            <div className="ocean-popup-header">
              <div className="ocean-popup-icon">
                🎯
              </div>
              <h2 className="ocean-popup-title">
                Second Chance!
              </h2>
            </div>
            
            <div className="ocean-popup-content">
              <div className="mini-game-chance-info">
                <div className="chance-stat">
                  <span className="chance-label">Chances Left</span>
                  <span className="chance-value">{miniGameChances}</span>
                </div>
                <p className="ocean-popup-message">
                  You have {miniGameChances} second chance(s) remaining! 
                  Complete a mini-game to continue your main game with your current score of <strong>{score} pearls</strong>.
                </p>
                <div className="mini-game-rules">
                  <h4>Mini-Game Rules:</h4>
                  <ul>
                    <li>Count the pearls in the simple challenge</li>
                    <li>You have 20 seconds to answer</li>
                    <li>Get it right to continue your main game</li>
                    <li>Get it wrong and lose one chance</li>
                    <li>0 can be a valid answer!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="ocean-popup-actions">
              <button 
                className="ocean-popup-button ocean-popup-button-secondary"
                onClick={handleTryAgain}
              >
                <span className="button-icon">🔄</span>
                New Dive
              </button>
              <button 
                className="ocean-popup-button ocean-popup-button-primary"
                onClick={handleMiniGameContinue}
              >
                <span className="button-icon">🎮</span>
                Try Mini-Game ({miniGameChances} left)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Popup */}
      {showGameOver && (
        <div className="ocean-popup-overlay">
          <div className="ocean-popup-dialog">
            <div className="ocean-popup-header">
              <div className="ocean-popup-icon">
                {gameStatus === 'wrong' ? '❌' : '⏰'}
              </div>
              <h2 className="ocean-popup-title">
                {gameStatus === 'wrong' ? 'Game Over!' : "Time's Up!"}
              </h2>
            </div>

            <div className="ocean-popup-content">
              <div className="ocean-final-stats">
                <div className="final-stat">
                  <span className="final-stat-label">Final Score</span>
                  <span className="final-stat-value">{score} 💎</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">Correct Answers</span>
                  <span className="final-stat-value">{consecutiveCorrect}</span>
                </div>
                <div className="final-stat">
                  <span className="final-stat-label">Total Questions</span>
                  <span className="final-stat-value">{totalQuestions}</span>
                </div>
              </div>
              
              <p className="ocean-popup-message">
                {gameStatus === 'wrong' 
                  ? `The correct answer was ${questionData?.solution}. Don't give up!` 
                  : `Time ran out! The answer was ${questionData?.solution}. Be quicker next time!`
                }
              </p>
            </div>

            <div className="ocean-popup-actions">
              <button 
                className="ocean-popup-button ocean-popup-button-secondary"
                onClick={handleTryAgain}
              >
                <span className="button-icon">🔄</span>
                Try Again
              </button>
              <button 
                className="ocean-popup-button ocean-popup-button-primary"
                onClick={handleContinue}
              >
                <span className="button-icon">🎮</span>
                Play Mini-Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;