import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login({ setCurrentPage, showToast }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      showToast('Logged in successfully!', 'success');
      setCurrentPage('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Login failed', 'error');
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
          <h2>Welcome Back</h2>
          <p>Sign in to manage your smart expenses</p>
        </div>

        {error && (
          <div className="alert-message-banner critical" style={{ marginBottom: 20, padding: '10px 14px' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? 
          <a onClick={() => setCurrentPage('register')} style={{ cursor: 'pointer' }}>Register here</a>
        </div>
      </div>
    </div>
  );
}
