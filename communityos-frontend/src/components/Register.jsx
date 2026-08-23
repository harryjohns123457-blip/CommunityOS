import React, { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import * as authService from '../services/auth.js';

const TENANTS = [
  { id: 'green-valley', name: 'Green Valley Estate' },
  { id: 'sunrise', name: 'Sunrise Apartments' },
  { id: 'westlands', name: 'Westlands Residence' },
];

const ROLES = [
  { value: 'RESIDENT', label: 'Resident' },
  { value: 'PROVIDER_REP', label: 'Service Provider' },
  { value: 'MANAGER', label: 'Community Manager' },
];

export default function Register({ onRegistered, onBackToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [tenantId, setTenantId] = useState('green-valley');
  const [role, setRole] = useState('RESIDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({
        fullName,
        email,
        password,
        phone,
        tenantId,
        role,
      });
      setSuccess(true);
      setTimeout(onRegistered, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="alert alert-success" style={{ textAlign: 'center' }}>
            <h2>Account Created!</h2>
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button
          type="button"
          className="link-btn"
          onClick={onBackToLogin}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} /> Back to login
        </button>

        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join the community platform</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                type="text"
                placeholder="John Kipchoge"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
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
            <label>Phone Number (Optional)</label>
            <div className="input-wrapper">
              <Phone size={18} />
              <input
                type="tel"
                placeholder="+254700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Community</label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              >
                {TENANTS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
