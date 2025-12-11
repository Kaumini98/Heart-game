import React from 'react';
import './Loading.css';

const Loading = () => {
    return (
        <div className="loading-container">
            {/* Animated Ocean Background */}
            <div className="loading-background">
                <div className="ocean-waves">
                    <div className="wave wave-1"></div>
                    <div className="wave wave-2"></div>
                    <div className="wave wave-3"></div>
                </div>
                <div className="bubbles-container">
                    <div className="bubble bubble-1"></div>
                    <div className="bubble bubble-2"></div>
                    <div className="bubble bubble-3"></div>
                    <div className="bubble bubble-4"></div>
                    <div className="bubble bubble-5"></div>
                    <div className="bubble bubble-6"></div>
                    <div className="bubble bubble-7"></div>
                    <div className="bubble bubble-8"></div>
                </div>
                <div className="ocean-glow">
                    <div className="glow glow-1"></div>
                    <div className="glow glow-2"></div>
                    <div className="glow glow-3"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="loading-content">
                {/* Animated Logo */}
                <div className="loading-logo">
                    <div className="logo-core">
                        <div className="water-ripples">
                            <div className="ripple ripple-1"></div>
                            <div className="ripple ripple-2"></div>
                            <div className="ripple ripple-3"></div>
                        </div>
                        <div className="pearl-container">
                            <div className="ocean-pearl">
                                <div className="pearl-shine"></div>
                                <div className="pearl-core"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="loading-text">
                    <h1 className="loading-title">
                        <span className="title-gradient">Ocean Quest❤️</span>
                    </h1>
                    <p className="loading-subtitle">
                        Diving into your adventure
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="loading-progress">
                    <div className="progress-track">
                        <div className="progress-fill"></div>
                        <div className="water-reflection"></div>
                    </div>
                    <div className="progress-steps">
                        <div className="step step-active">
                            <div className="step-icon">🌊</div>
                            <span className="step-text">Diving In</span>
                        </div>
                        <div className="step">
                            <div className="step-icon">🐚</div>
                            <span className="step-text">Exploring</span>
                        </div>
                        <div className="step">
                            <div className="step-icon">🧜‍♀️</div>
                            <span className="step-text">Ready</span>
                        </div>
                    </div>
                </div>

                {/* Loading Dots */}
                <div className="modern-dots">
                    <div className="dot-wave">
                        <div className="dot dot-1"></div>
                        <div className="dot dot-2"></div>
                        <div className="dot dot-3"></div>
                        <div className="dot dot-4"></div>
                        <div className="dot dot-5"></div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="loading-footer">
                    <p className="tip-message">
                        <span className="tip-icon">💡</span>
                        Pro tip: Discover hidden treasures in deep waters!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Loading;