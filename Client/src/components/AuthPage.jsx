import React, { useState } from 'react';

export default function AuthPage({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async e => {
    e.preventDefault();
    // Simplified: directly call onAuthSuccess for testing
    if (onAuthSuccess) onAuthSuccess('fake-token');
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleAuth}>
        <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
        {authMode === 'register' && (
          <>
            <input placeholder="Full Name" className="auth-input" />
            <input placeholder="Email" className="auth-input" />
          </>
        )}
        <input placeholder="Username" value={authUser} onChange={e => setAuthUser(e.target.value)} className="auth-input" required />
        <input type="password" placeholder="Password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="auth-input" required />
        {authMode === 'register' && <input type="password" placeholder="Confirm Password" className="auth-input" required />}
        <button type="submit" className="auth-button">
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
        <p className="auth-switch">
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="auth-switch-button">
            {authMode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  );
}