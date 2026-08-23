import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Building2 } from 'lucide-react';
import * as authService from '../services/auth.js';

const TENANTS = [
  { id: 'green-valley', name: 'Green Valley Estate' },
  { id: 'sunrise', name: 'Sunrise Apartments' },
  { id: 'westlands', name: 'Westlands Residence' },
];

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('green-valley');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(email, password, tenantId);
      onLogin(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome to CommunityOS</h1>
          <p>Connecting communities to essential services</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Community</label>
            <div className="input-wrapper">
              <Building2 size={18} />
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                {TENANTS.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Demo Credentials:
            <br />
            <strong>Resident:</strong> resident@example.com / resident123
            <br />
            <strong>Provider:</strong> aquaflow@provider.com / provider123
            <br />
            <strong>Manager:</strong> manager@greenvally.com / manager123
          </p>
        </div>

        <button
          type="button"
          className="link-btn"
          onClick={onRegister}
        >
          Create new account
        </button>
      </div>
    </div>
  );
}
