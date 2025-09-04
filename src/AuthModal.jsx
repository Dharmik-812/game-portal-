import React, { useState, useCallback, useMemo } from "react";
import "./AuthModal.css";

// Enhanced AuthModal Component
const AuthModal = React.memo(({ onClose, onLogin, mode, setMode }) => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        dob: "",
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (mode === 'signup') {
            if (!formData.username.trim()) {
                newErrors.username = "Username is required";
            } else if (formData.username.length < 3) {
                newErrors.username = "Username must be at least 3 characters";
            } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
                newErrors.username = "Username can only contain letters, numbers, and underscores";
            }

            if (!formData.dob) {
                newErrors.dob = "Date of birth is required";
            } else {
                const birthDate = new Date(formData.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 13) {
                    newErrors.dob = "You must be at least 13 years old";
                } else if (age > 120) {
                    newErrors.dob = "Please enter a valid date of birth";
                }
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase and number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [mode, formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (mode === 'login') {
            onLogin({
                username: formData.email.split('@')[0],
                email: formData.email,
                dob: "2000-01-01"
            }, formData.rememberMe);
        } else {
            onLogin({
                username: formData.username,
                email: formData.email,
                dob: formData.dob
            }, formData.rememberMe);
        }

        setIsSubmitting(false);
        onClose();
    }, [validateForm, mode, onLogin, onClose, formData]);

    const handleModeSwitch = useCallback(() => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setErrors({});
        setFormData({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            dob: "",
            rememberMe: false
        });
    }, [mode, setMode]);

    const handleOverlayClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    }, [errors]);

    const togglePasswordVisibility = useCallback((field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    }, [showPassword, showConfirmPassword]);

    // Social login handlers
    const handleSocialLogin = useCallback((provider) => {
        // In a real app, this would redirect to the provider's authentication
        console.log(`Logging in with ${provider}`);
        // Simulate social login success
        setTimeout(() => {
            onLogin({
                username: "socialuser",
                email: "user@example.com",
                dob: "2000-01-01"
            }, false);
            onClose();
        }, 1000);
    }, [onLogin, onClose]);

    const socialLoginOptions = useMemo(() => [
        { provider: 'google', label: 'Continue with Google', icon: 'G', color: '#DB4437' },
        { provider: 'facebook', label: 'Continue with Facebook', icon: 'f', color: '#4267B2' },
        { provider: 'discord', label: 'Continue with Discord', icon: 'D', color: '#5865F2' }
    ], []);

    return (
        <div className="auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal-backdrop"></div>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="auth-modal-close"
                    onClick={onClose}
                    aria-label="Close modal"
                    type="button"
                >
                    <span aria-hidden="true">&times;</span>
                </button>

                <div className="auth-modal-header">
                    <div className="auth-modal-logo">
                        <div className="auth-logo-icon">🎮</div>
                        <h2>AvesOL</h2>
                    </div>
                    <h3>{mode === 'login' ? 'Welcome Back!' : 'Join Our Community'}</h3>
                    <p>{mode === 'login' ? 'Sign in to continue your gaming journey' : 'Create an account to unlock all features'}</p>
                </div>

                {/* Social login options */}
                <div className="social-login-options">
                    {socialLoginOptions.map((option) => (
                        <button
                            key={option.provider}
                            type="button"
                            className="social-login-btn"
                            style={{ '--social-color': option.color }}
                            onClick={() => handleSocialLogin(option.provider)}
                            disabled={isSubmitting}
                        >
                            <span className="social-icon">{option.icon}</span>
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-modal-form" noValidate>
                    {mode === 'signup' && (
                        <div className="auth-input-field">
                            <input
                                type="text"
                                value={formData.username}
                                onChange={e => handleInputChange('username', e.target.value)}
                                className={errors.username ? 'error' : ''}
                                aria-invalid={!!errors.username}
                                aria-describedby={errors.username ? 'username-error' : undefined}
                                disabled={isSubmitting}
                                placeholder=" "
                            />
                            <label>Username</label>
                            <div className="auth-input-underline"></div>
                            {errors.username && <span id="username-error" className="auth-error-text">{errors.username}</span>}
                        </div>
                    )}

                    <div className="auth-input-field">
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => handleInputChange('email', e.target.value)}
                            className={errors.email ? 'error' : ''}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            disabled={isSubmitting}
                            placeholder=" "
                        />
                        <label>Email</label>
                        <div className="auth-input-underline"></div>
                        {errors.email && <span id="email-error" className="auth-error-text">{errors.email}</span>}
                    </div>

                    <div className="auth-input-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={e => handleInputChange('password', e.target.value)}
                            className={errors.password ? 'error' : ''}
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                            disabled={isSubmitting}
                            placeholder=" "
                        />
                        <label>Password</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('password')}
                            tabIndex={-1}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                        <div className="auth-input-underline"></div>
                        {errors.password && <span id="password-error" className="auth-error-text">{errors.password}</span>}
                    </div>

                    {mode === 'signup' && (
                        <>
                            <div className="auth-input-field">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                                    className={errors.confirmPassword ? 'error' : ''}
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                                    disabled={isSubmitting}
                                    placeholder=" "
                                />
                                <label>Confirm Password</label>
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                                <div className="auth-input-underline"></div>
                                {errors.confirmPassword && <span id="confirm-password-error" className="auth-error-text">{errors.confirmPassword}</span>}
                            </div>

                            <div className="auth-input-field">
                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => handleInputChange('dob', e.target.value)}
                                    className={errors.dob ? 'error' : ''}
                                    aria-invalid={!!errors.dob}
                                    aria-describedby={errors.dob ? 'dob-error' : undefined}
                                    disabled={isSubmitting}
                                    placeholder=" "
                                />
                                <label>Date of Birth</label>
                                <div className="auth-input-underline"></div>
                                {errors.dob && <span id="dob-error" className="auth-error-text">{errors.dob}</span>}
                            </div>
                        </>
                    )}

                    {mode === 'login' && (
                        <div className="auth-remember-forgot">
                            <label className="auth-remember-me">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={e => handleInputChange('rememberMe', e.target.checked)}
                                    disabled={isSubmitting}
                                />
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="auth-forgot-password">
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="auth-spinner"></div>
                        ) : (
                            <span>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                        )}
                    </button>
                </form>

                <div className="auth-modal-footer">
                    <p>
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={handleModeSwitch}
                            className="auth-mode-switch-btn"
                            disabled={isSubmitting}
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
});

AuthModal.displayName = 'AuthModal';

export default AuthModal; 