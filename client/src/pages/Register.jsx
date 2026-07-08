import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer'); // default to buyer
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim() || !role) {
      setValidationError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      console.error('Registration error details:', err);
      const serverMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
          <label htmlFor="name">Name:</label>
          <br />
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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

        <div style={{ marginBottom: '10px' }}>
          <label>Account Role:</label>
          <br />
          <label style={{ marginRight: '15px' }}>
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={role === 'buyer'}
              onChange={() => setRole('buyer')}
            />
            Buyer
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="seller"
              checked={role === 'seller'}
              onChange={() => setRole('seller')}
            />
            Seller
          </label>
        </div>

        <button type="submit" disabled={loading} id="register-submit">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '15px' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
