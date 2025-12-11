import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './Auth.css';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFocus = (field) => {
        setFocusedField(field);
    };

    const handleBlur = () => {
        setFocusedField('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await authAPI.register(registerData);
            
            if (response.data.success) {
                setMessage('Welcome aboard! Your ocean adventure begins now!');
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onRegisterSuccess(response.data.user);
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-background">
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
                </div>
                <div className="ocean-glow">
                    <div className="glow glow-1"></div>
                    <div className="glow glow-2"></div>
                </div>
            </div>
            
            <div className="auth-card">
                <div className="card-header">
                    <div className="logo-container">
                        <div className="logo">
                            <div className="ocean-pearl">
                                <div className="pearl-shine"></div>
                            </div>
                        </div>
                        <h1>Ocean Quest</h1>
                    </div>
                    <div className="header-content">
                        <h2>Begin Your Voyage</h2>
                        <p>Collect Hearts❤️ in a deep blue adventure</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <div className={`input-container ${focusedField === 'username' ? 'focused' : ''} ${formData.username ? 'filled' : ''}`}>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={() => handleFocus('username')}
                                onBlur={handleBlur}
                                required
                            />
                            <label htmlFor="username" className="floating-label">
                                <span className="label-icon">👤</span>
                                <span className="label-text">Captain's Name</span>
                            </label>
                            <div className="input-decoration">
                                <div className="input-wave"></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className={`input-container ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'filled' : ''}`}>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onFocus={() => handleFocus('email')}
                                onBlur={handleBlur}
                                required
                            />
                            <label htmlFor="email" className="floating-label">
                                <span className="label-icon">📧</span>
                                <span className="label-text">Message Bottle</span>
                            </label>
                            <div className="input-decoration">
                                <div className="input-wave"></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className={`input-container ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'filled' : ''}`}>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onFocus={() => handleFocus('password')}
                                onBlur={handleBlur}
                                required
                            />
                            <label htmlFor="password" className="floating-label">
                                <span className="label-icon">🔒</span>
                                <span className="label-text">Secret Code</span>
                            </label>
                            <div className="input-decoration">
                                <div className="input-wave"></div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <div className={`input-container ${focusedField === 'confirmPassword' ? 'focused' : ''} ${formData.confirmPassword ? 'filled' : ''}`}>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => handleFocus('confirmPassword')}
                                onBlur={handleBlur}
                                required
                            />
                            <label htmlFor="confirmPassword" className="floating-label">
                                <span className="label-icon">🔑</span>
                                <span className="label-text">Confirm Secret Code</span>
                            </label>
                            <div className="input-decoration">
                                <div className="input-wave"></div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        <span className="button-text">
                            {loading ? 'Charting Your Course...' : 'Set Sail'}
                        </span>
                        <div className="button-loader">
                            <div className="bubble-loader">
                                <div className="bubble-load"></div>
                                <div className="bubble-load"></div>
                                <div className="bubble-load"></div>
                            </div>
                        </div>
                        <div className="button-wave"></div>
                    </button>
                </form>

                {message && (
                    <div className={`message ${message.includes('aboard') ? 'success' : 'error'}`}>
                        <div className="message-icon">
                            {message.includes('aboard') ? '🐚' : '🌊'}
                        </div>
                        <span>{message}</span>
                    </div>
                )}

                <div className="auth-footer">
                    <div className="divider">
                        <span>Already sailing with us?</span>
                    </div>
                    <button 
                        className="switch-button"
                        onClick={onSwitchToLogin}
                    >
                        <span>Return to Voyage</span>
                        <svg className="wave-icon" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12C2 12 5.5 8 12 8C18.5 8 22 12 22 12M2 12C2 12 5.5 16 12 16C18.5 16 22 12 22 12M2 12L22 12" 
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;