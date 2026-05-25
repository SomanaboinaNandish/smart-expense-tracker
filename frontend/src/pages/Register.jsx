import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Register({ setCurrentPage, showToast }) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      showToast('Registration successful! Please login.', 'success');
      setCurrentPage('login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-blob purple"></div>
      <div className="auth-blob pink"></div>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Get started with smart expense tracking</p>
        </div>

        {error && (
          <div className="alert-message-banner critical" style={{ marginBottom: 20, padding: '10px 14px' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-control"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? 
          <a onClick={() => setCurrentPage('login')} style={{ cursor: 'pointer' }}>Login here</a>
        </div>
      </div>
    </div>
  );
}
