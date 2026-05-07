import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService, { LoginRequest, RegisterRequest } from '../../services/authService';
import './RegisterLogIn.css';

const RegisterLogIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  
  const [isLoginView, setIsLoginView] = useState(mode === 'login');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (mode === 'login') {
      setIsLoginView(true);
    } else {
      setIsLoginView(false);
    }
  }, [mode]);

  const handleToggle = () => {
    setIsTransitioning(true);
    setError('');
    setSuccess('');
    
    setTimeout(() => {
      setIsLoginView(prev => !prev);
    }, 300);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Attempting login with:', { email: loginForm.email });
      
      const response = await authService.login(loginForm);
      
      setSuccess(`Welcome back, ${response.user.fullName}!`);
      console.log('✅ Login successful:', response.user);

      // Redirect based on user role
      setTimeout(() => {
        if (response.user.role === 'DOCTOR' || response.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Attempting registration for patient');

      const response = await authService.register(registerForm);
      setSuccess('Registration successful! You can now login.');
      console.log('✅ Patient registered:', response);

      // Auto-switch to login view after successful registration
      setTimeout(() => {
        setIsLoginView(true);
        setRegisterForm({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          address: '',
        });
      }, 2000);

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register_container">
      <div className="register_box">
        
        {/* Error/Success Messages */}
        {error && (
          <div className="message error_message">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="message success_message">
            ✅ {success}
          </div>
        )}
        
        {/* Sliding overlay */}
        <div className={`sliding_overlay ${isLoginView ? 'login_view' : 'register_view'} ${isTransitioning ? 'transitioning' : ''}`}>
          
          {/* Welcome Register view */}
          <div className={`welcome_content register_welcome ${!isLoginView && !isTransitioning ? 'active' : ''}`}>
            <h2 className="welcome_title">Welcome!</h2>
            <p className="welcome_text">
              Already have an account?<br/>
              Please login to continue
            </p>
            <button onClick={handleToggle} className="welcome_button">
              Log in
            </button>
          </div>

          {/* Welcome Login view */}
          <div className={`welcome_content login_welcome ${isLoginView && !isTransitioning ? 'active' : ''}`}>
            <h2 className="welcome_title">Hello!</h2>
            <p className="welcome_text">
              Don't have an account?<br/>
              Sign up to get started
            </p>
            <button onClick={handleToggle} className="welcome_button">
              Register
            </button>
          </div>
        </div>

        {/* Left - Form Register */}
        <div className="form_section left_section">
          <div className={`form_content register_form ${!isLoginView && !isTransitioning ? 'active' : ''}`}>
            <h2 className="form_title">Register</h2>
            <form onSubmit={handleRegister} className="form_inputs">
              
              <input 
                type="text" 
                placeholder="Full Name"
                className="form_input"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
              <input 
                type="email" 
                placeholder="Email"
                className="form_input"
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input 
                type="password" 
                placeholder="Password"
                className="form_input"
                value={registerForm.password}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <input 
                type="tel" 
                placeholder="Phone Number (Optional)"
                className="form_input"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
              />
              <input 
                type="text" 
                placeholder="Address (Optional)"
                className="form_input"
                value={registerForm.address}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, address: e.target.value }))}
              />

              <button 
                type="submit" 
                className="form_button"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>
        </div>

        {/* Right - Form Log in */}
        <div className="form_section right_section">
          <div className={`form_content login_form ${isLoginView && !isTransitioning ? 'active' : ''}`}>
            <h2 className="form_title">Log in</h2>
            <form onSubmit={handleLogin} className="form_inputs">
              <input 
                type="email" 
                placeholder="Email"
                className="form_input"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input 
                type="password" 
                placeholder="Password"
                className="form_input"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <button 
                type="submit" 
                className="form_button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <p className="forgot_password">
              <a href="#" className="forgot_link">Forgot password ?</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLogIn;
