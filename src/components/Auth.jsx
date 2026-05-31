import React, { useState } from 'react';
import { supabase } from '../db.js';
import { useToast } from './Toast.jsx';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Logged in successfully', 'success');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Registration successful! You are now logged in.', 'success');
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d22 100%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        background: 'rgba(20, 20, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid rgba(67, 97, 238, 0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <svg viewBox="0 0 100 100" fill="none" style={{ width: '60px', height: '60px' }}>
            <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
            <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a1a3a"/>
            <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="3" fill="none"/>
            <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="3"/>
            <circle cx="50" cy="50" r="12" fill="#1a1a3a" stroke="#4361ee" strokeWidth="3"/>
            <circle cx="50" cy="50" r="5" fill="#ffd60a"/>
          </svg>
        </div>
        <h1 style={{ color: '#4361ee', fontFamily: 'Press Start 2P', fontSize: '14px', marginBottom: '30px' }}>
          3-ISB LOGIN
        </h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(67, 97, 238, 0.5)',
              background: 'rgba(10, 10, 26, 0.8)',
              color: '#fff',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(67, 97, 238, 0.5)',
              background: 'rgba(10, 10, 26, 0.8)',
              color: '#fff',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                background: '#4361ee',
                color: '#fff',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Processing...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #4361ee',
                background: 'transparent',
                color: '#4361ee',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
