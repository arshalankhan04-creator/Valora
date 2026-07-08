import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setValidationError('Both email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error details:', err);
      const serverMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {validationError && (
          <div style={{ color: 'red', marginBottom: '10px' }} id="validation-error">
            {validationError}
          </div>
        )}
        {error && (
          <div style={{ color: 'darkred', marginBottom: '10px', fontWeight: 'bold' }} id="server-error">
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email Address:</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} id="login-submit">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
