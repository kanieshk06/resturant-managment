'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UtensilsCrossed, ShieldCheck, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'pin' | 'credentials'>('pin');
  const [pin, setPin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = authMode === 'pin' ? { pin } : { username, password };
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickPin = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleClearPin = () => {
    setPin('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a1e16',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #0f3d2c 0%, #061e15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Rings */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(16, 185, 129, 0.08)',
          top: '-150px',
          right: '-150px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          border: '1px solid rgba(16, 185, 129, 0.05)',
          bottom: '-120px',
          left: '-120px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            backgroundColor: '#065f46',
            padding: '32px 28px 24px',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#044e39',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(52, 211, 153, 0.3)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <UtensilsCrossed size={28} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Dine<span style={{ color: '#34d399' }}>Desk</span>
          </h2>
          <p style={{ fontSize: '13px', color: '#a7f3d0', marginTop: '6px' }}>
            Restaurant Owner Access Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            margin: '20px 24px 0',
            borderRadius: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('pin');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: authMode === 'pin' ? '#ffffff' : 'transparent',
              color: authMode === 'pin' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'pin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Owner PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('credentials');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: authMode === 'credentials' ? '#ffffff' : 'transparent',
              color: authMode === 'credentials' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: authMode === 'credentials' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Username & Password
          </button>
        </div>

        {/* Form Body */}
        <div className="login-form-body">
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                color: '#9f1239',
                fontSize: '13px',
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            {authMode === 'pin' ? (
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  Enter Owner 4-Digit Security PIN
                </label>
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="• • • •"
                    className="input-field tabular-nums"
                    style={{
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '0.3em',
                      fontWeight: 700,
                      padding: '12px',
                    }}
                    autoFocus
                  />
                </div>

                {/* Quick Keypad */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginBottom: '20px',
                  }}
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '←'].map((btn) => (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        if (btn === 'C') handleClearPin();
                        else if (btn === '←') setPin((p) => p.slice(0, -1));
                        else handleQuickPin(btn);
                      }}
                      style={{
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: btn === 'C' ? '#e11d48' : '#0f172a',
                        transition: 'background-color 0.1s ease',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                      onMouseUp={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    >
                      {btn}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0',
                    fontSize: '12px',
                    color: '#064e3b',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <KeyRound size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: '-2px' }} />
                  Default Owner PIN: <strong>1234</strong>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="owner"
                    className="input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-field"
                    required
                  />
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#64748b',
                  }}
                >
                  Default credentials: <strong>owner</strong> / <strong>dinedesk123</strong>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (authMode === 'pin' && !pin)}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
                fontSize: '15px',
              }}
            >
              {loading ? (
                <span>Verifying Owner Access...</span>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Enter Owner Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
