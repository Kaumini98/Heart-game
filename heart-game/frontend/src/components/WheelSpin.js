import React, { useState, useRef, useEffect } from 'react';
import './WheelSpin.css';

const WheelSpin = ({ user, onComplete, onBack }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const wheelRef = useRef(null);

    const options = [
        { id: 1, label: 'Shallow', timer: '60s', color: '#4facfe', description: 'Gentle ocean currents' },
        { id: 2, label: 'Reef', timer: '40s', color: '#00f2fe', description: 'Colorful coral challenge' },
        { id: 3, label: 'Deep', timer: '30s', color: '#1a4b6d', description: 'Mysterious ocean depths' },
        { id: 4, label: 'Abyss', timer: '15s', color: '#0d2b45', description: 'Ultimate deep sea challenge' },
        { id: 5, label: 'Try Again', timer: 'Spin Again', color: '#88d3ce', description: 'Ride another wave!' }
    ];

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setShowResult(false);
        setSelectedOption(null);

        // Random rotation between 5 and 10 full rotations plus a segment
        const segments = options.length;
        const segmentAngle = 360 / segments;
        const extraSpins = 5 + Math.floor(Math.random() * 5); // 5-9 extra spins
        const randomSegment = Math.floor(Math.random() * segments);
        
        const targetRotation = (extraSpins * 360) + (randomSegment * segmentAngle) + (360 - (rotation % 360));
        
        setRotation(targetRotation);

        // Calculate which option was selected
        setTimeout(() => {
            const normalizedRotation = targetRotation % 360;
            const selectedIndex = segments - 1 - Math.floor(normalizedRotation / segmentAngle);
            const finalSelectedIndex = (selectedIndex + segments) % segments;
            
            setSelectedOption(options[finalSelectedIndex]);
            setIsSpinning(false);
            
            // Show result after a brief delay
            setTimeout(() => {
                setShowResult(true);
            }, 500);
        }, 4000); // Match this with CSS animation duration
    };

    const handleConfirmResult = () => {
        setShowResult(false);
        if (selectedOption && onComplete) {
            onComplete(selectedOption);
        }
    };

    const handleSpinAgain = () => {
        setShowResult(false);
        setSelectedOption(null);
    };

    return (
        <div className="wheel-spin-container">
            {/* Ocean Background */}
            <div className="wheel-background">
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
                </div>
                <div className="ocean-creatures">
                    <div className="creature fish-1">🐠</div>
                    <div className="creature fish-2">🐟</div>
                    <div className="creature turtle">🐢</div>
                </div>
                <div className="coral-reef">
                    <div className="coral coral-1">🪸</div>
                    <div className="coral coral-2">🪸</div>
                    <div className="seaweed seaweed-1">🌿</div>
                </div>
            </div>

            <div className="wheel-content">
                {/* Header */}
                <header className="wheel-header">
                    <button className="back-button" onClick={onBack}>
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Return to Shore
                    </button>
                    <div className="wheel-title">
                        <h1>Choose Your Ocean Depth</h1>
                        <p>Spin the compass to set your diving challenge</p>
                    </div>
                    <div className="user-badge">
                        <span>Diver: {user?.username}</span>
                    </div>
                </header>

                {/* Main Wheel Section */}
                <div className="wheel-main">
                    <div className="wheel-container">
                        <div 
                            className={`wheel ${isSpinning ? 'spinning' : ''}`}
                            ref={wheelRef}
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            {options.map((option, index) => {
                                const segmentAngle = 360 / options.length;
                                const rotationAngle = index * segmentAngle;
                                
                                return (
                                    <div
                                        key={option.id}
                                        className="wheel-segment"
                                        style={{
                                            transform: `rotate(${rotationAngle}deg)`,
                                            backgroundColor: option.color,
                                            '--segment-angle': `${segmentAngle}deg`
                                        }}
                                    >
                                        <div className="segment-content">
                                            <span className="segment-label">{option.label}</span>
                                            <span className="segment-timer">{option.timer}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Wheel Center */}
                        <div className="wheel-center">
                            <div className="center-logo">🧭</div>
                        </div>
                        
                        {/* Wheel Pointer */}
                        <div className="wheel-pointer">
                            <div className="pointer-arrow"></div>
                        </div>
                    </div>

                    {/* Spin Button */}
                    <button 
                        className={`spin-button ${isSpinning ? 'spinning' : ''}`}
                        onClick={spinWheel}
                        disabled={isSpinning}
                    >
                        {isSpinning ? (
                            <>
                                <div className="spinner"></div>
                                Navigating...
                            </>
                        ) : (
                            <>
                                <span className="spin-icon">🌊</span>
                                Spin the Compass!
                            </>
                        )}
                    </button>
                </div>

                {/* Options Info */}
                <div className="options-info">
                    <h3>Ocean Depths</h3>
                    <div className="options-grid">
                        {options.map(option => (
                            <div key={option.id} className="option-card">
                                <div 
                                    className="option-color" 
                                    style={{ backgroundColor: option.color }}
                                ></div>
                                <div className="option-details">
                                    <h4>{option.label}</h4>
                                    <p className="option-timer">{option.timer}</p>
                                    <p className="option-desc">{option.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Result Alert */}
            {showResult && selectedOption && (
                <div className="result-overlay">
                    <div className="result-alert">
                        <div className="result-header">
                            <div 
                                className="result-icon"
                                style={{ backgroundColor: selectedOption.color }}
                            >
                                {selectedOption.label === 'Try Again' ? '🔄' : '🧭'}
                            </div>
                            <h2>Depth Selected!</h2>
                        </div>
                        
                        <div className="result-content">
                            <div className="result-difficulty">
                                <span className="difficulty-label">{selectedOption.label}</span>
                                <span className="difficulty-timer">{selectedOption.timer}</span>
                            </div>
                            <p className="result-description">{selectedOption.description}</p>
                            
                            {selectedOption.label === 'Try Again' ? (
                                <div className="try-again-message">
                                    <p>The currents changed! You get another chance to navigate.</p>
                                </div>
                            ) : (
                                <div className="timer-info">
                                    <div className="timer-display">
                                        <span className="timer-icon">⏱️</span>
                                        <span className="timer-text">
                                            You'll have {selectedOption.timer} to explore the depths!
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="result-actions">
                            {selectedOption.label === 'Try Again' ? (
                                <button 
                                    className="result-button spin-again-button"
                                    onClick={handleSpinAgain}
                                >
                                    <span>Navigate Again</span>
                                    <span className="button-emoji">🧭</span>
                                </button>
                            ) : (
                                <button 
                                    className="result-button confirm-button"
                                    onClick={handleConfirmResult}
                                >
                                    <span>Start Dive</span>
                                    <span className="button-emoji">🌊</span>
                                </button>
                            )}
                            <button 
                                className="result-button back-button"
                                onClick={onBack}
                            >
                                Return to Shore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WheelSpin;