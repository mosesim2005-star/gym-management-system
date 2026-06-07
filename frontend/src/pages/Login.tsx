// ─────────────────────────────────────────────────────────────
// Login.tsx
// Place: frontend/src/pages/Login.tsx
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { saveToken, isAuthenticated } from '../utils/auth';
import { loginStyles, loginCSS } from '../styles/Login.styles';
import lifetimeImg from '../assets/lifetime.png';

type Step = 'email' | 'otp';

// ── Particle type ──
interface Particle {
  id: number;
  x: number;
  style: React.CSSProperties;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  // ── State ──
  const [step, setStep]           = useState<Step>('email');
  const [swapped, setSwapped]     = useState(false);
  const [swapping, setSwapping]   = useState(false);
  const [email, setEmail]         = useState('');
  const [otp, setOtp]             = useState<string[]>(['', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [timeLeft, setTimeLeft]   = useState(180);
  const [expired, setExpired]     = useState(false);
  const [btnHover, setBtnHover]   = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const timerRef  = useRef<NodeJS.Timeout | null>(null);
  const otpRefs   = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const inputRef  = useRef<HTMLInputElement>(null);

  // ── Auth guard ──
  useEffect(() => {
    if (isAuthenticated()) navigate('/dashboard');
  }, [navigate]);

  // ── Spawn particles ──
  useEffect(() => {
    const ps: Particle[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      style: {
        position: 'absolute' as const,
        left: `${Math.random() * 100}%`,
        bottom: 0,
        width: `${2 + Math.random() * 3}px`,
        height: `${2 + Math.random() * 3}px`,
        borderRadius: '50%',
        background: Math.random() > 0.5 ? '#ff2b2b' : '#ff6b6b',
        boxShadow: '0 0 6px rgba(220,0,0,0.8)',
        ['--dx' as any]: `${(Math.random() - 0.5) * 80}px`,
        animation: `particle-float ${3 + Math.random() * 4}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`,
        opacity: 0,
      },
    }));
    setParticles(ps);
  }, []);

  // ── Timer ──
  const startTimer = useCallback(() => {
    setTimeLeft(180);
    setExpired(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const formatTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // ── Send OTP ──
  const handleSendOTP = async () => {
    if (!email.trim()) return setError('Please enter your email address');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-otp', { email });
      // Start panel swap animation
      setSwapping(true);
      setTimeout(() => {
        setSwapped(true);
        setSwapping(false);
        setStep('otp');
        startTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 350);
      }, 650);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend / go back ──
  const handleResend = () => {
    setSwapping(true);
    setTimeout(() => {
      setSwapped(false);
      setSwapping(false);
      setStep('email');
      setOtp(['', '', '', '']);
      setError('');
      setExpired(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => inputRef.current?.focus(), 350);
    }, 650);
  };

  // ── OTP input handling ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value.length === 1 && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '' && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // ── Verify OTP ──
  const handleVerifyOTP = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < 4) return setError('Please enter all 4 digits');
    if (expired) return setError('OTP has expired. Please click Back to resend.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp: otpStr });
      saveToken(res.data.token, res.data.expiresAt);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.expired) setExpired(true);
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Panel positions ──
  const brandLeft = swapped ? '50%' : '0%';
  const loginLeft = swapped ? '0%' : '50%';
  const swapFilter = swapping ? 'blur(5px)' : 'none';
  const swapOpacity = swapping ? 0.5 : 1;

  return (
    <>
      {/* Inject all CSS */}
      <style>{loginCSS}</style>
      <style>{`
        /* Extra animation keyframes needed at runtime */
        @keyframes particle-float {
          0%   { opacity: 0; transform: translateY(0) scale(0); }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-120px) translateX(var(--dx, 0px)) scale(0.5); }
        }
        @keyframes btn-shine {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes border-shimmer {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes orbit-ring {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes orbit-ring-rev {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(-360deg); }
        }
        @keyframes neon-breathe {
          0%,100% { text-shadow: 0 0 20px rgba(220,0,0,0.5), 0 0 40px rgba(220,0,0,0.2); }
          50%      { text-shadow: 0 0 40px rgba(220,0,0,1), 0 0 80px rgba(220,0,0,0.5), 0 0 120px rgba(220,0,0,0.2); }
        }
        @keyframes shield-glow {
          0%,100% { filter: drop-shadow(0 0 10px rgba(220,0,0,0.6)); }
          50%      { filter: drop-shadow(0 0 28px rgba(220,0,0,1)) drop-shadow(0 0 60px rgba(220,0,0,0.4)); }
        }
        @keyframes shield-glow-green {
          0%,100% { filter: drop-shadow(0 0 10px rgba(0,200,100,0.6)); }
          50%      { filter: drop-shadow(0 0 28px rgba(0,200,100,1)) drop-shadow(0 0 60px rgba(0,200,100,0.4)); }
        }
        @keyframes ring-pulse {
          0%,100% { transform: scale(1); opacity: 0.35; }
          50%      { transform: scale(1.1); opacity: 0.9; }
        }
        @keyframes hologram-flicker {
          0%,95%,97%,100% { opacity: 1; }
          96%,98%          { opacity: 0.82; }
        }
        @keyframes float-y {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Input focus override */
        .lf-email-input:focus {
          border-color: rgba(220,0,0,0.6) !important;
          background: rgba(220,0,0,0.04) !important;
          box-shadow: 0 0 0 3px rgba(220,0,0,0.1), inset 0 0 20px rgba(220,0,0,0.03) !important;
        }
      `}</style>

      {/* ════ PAGE ════ */}
      <div style={{
        ...loginStyles.page,
        background: `
          radial-gradient(ellipse at 20% 50%, rgba(120,0,0,0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(80,0,0,0.1) 0%, transparent 50%),
          #060609
        `,
      }}>
        {/* ════ CARD ROOT ════ */}
        <div style={{
          ...loginStyles.root,
          boxShadow: '0 0 0 1px rgba(220,0,0,0.2), 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(220,0,0,0.06)',
        }}>

          {/* ════ BRAND PANEL ════ */}
          <div style={{
            ...loginStyles.panel,
            ...loginStyles.brandPanel,
            left: brandLeft,
            filter: swapFilter,
            opacity: swapOpacity,
            zIndex: swapped ? 1 : 2,
          }}>
            {/* Your actual gym image */}
            <img
              src={lifetimeImg}
              alt="Lifetime Fitness"
              style={{
                ...loginStyles.brandImg,
                animation: 'hologram-flicker 8s infinite',
              }}
            />
            {/* Dark vignette overlay */}
            <div style={loginStyles.brandOverlay} />
            {/* Red edge glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 2,
              height: '100%',
              background: 'linear-gradient(180deg, transparent, rgba(220,0,0,0.8), transparent)',
              boxShadow: '0 0 16px rgba(220,0,0,0.6), 0 0 32px rgba(220,0,0,0.3)',
              animation: 'ring-pulse 2.5s ease-in-out infinite',
            }} />
            {/* Floating particles on brand side */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 5 }}>
              {particles.map(p => <div key={p.id} style={p.style} />)}
            </div>
          </div>

          {/* ════ LOGIN PANEL ════ */}
          <div style={{
            ...loginStyles.panel,
            ...loginStyles.loginPanel,
            left: loginLeft,
            filter: swapFilter,
            opacity: swapOpacity,
            zIndex: swapped ? 2 : 1,
          }}>
            {/* Grid background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(220,0,0,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(220,0,0,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }} />
            {/* Ambient glow top-right */}
            <div style={{
              position: 'absolute',
              top: -80, right: -80,
              width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(220,0,0,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'float-y 5s ease-in-out infinite',
            }} />

            <div style={loginStyles.loginInner}>

              {/* ─── EMAIL STEP ─── */}
              {step === 'email' && (
                <div style={{
                  ...loginStyles.loginForm,
                  animation: 'fadeUp 0.45s ease both',
                }}>
                  {/* Heading */}
                  <h2 style={loginStyles.heading}>
                    Welcome Back,{' '}
                    <span style={{
                      color: '#ff2b2b',
                      textShadow: '0 0 20px rgba(255,43,43,0.6), 0 0 40px rgba(255,43,43,0.3)',
                      animation: 'neon-breathe 3s ease-in-out infinite',
                    }}>
                      Admin
                    </span>
                  </h2>
                  <p style={loginStyles.subtext}>Sign in to access your gym dashboard</p>

                  {/* Shield with orbit rings */}
                  <div style={loginStyles.shieldWrap}>
                    {/* Orbit ring 1 */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 130, height: 130,
                      border: '1px solid rgba(220,0,0,0.2)',
                      borderTop: '2px solid rgba(220,0,0,0.7)',
                      borderRadius: '50%',
                      animation: 'orbit-ring 2.8s linear infinite',
                    }} />
                    {/* Orbit ring 2 */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 100, height: 100,
                      border: '1px solid rgba(220,0,0,0.15)',
                      borderRight: '2px solid rgba(220,0,0,0.6)',
                      borderRadius: '50%',
                      animation: 'orbit-ring-rev 2s linear infinite',
                    }} />
                    {/* Orbit ring 3 */}
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 74, height: 74,
                      border: '1px solid rgba(220,0,0,0.12)',
                      borderBottom: '2px solid rgba(220,0,0,0.5)',
                      borderRadius: '50%',
                      animation: 'orbit-ring 4s linear infinite',
                    }} />
                    {/* Orbit dots */}
                    {[
                      { size: 130, angle: 0,   color: '#ff2b2b' },
                      { size: 100, angle: 90,  color: '#ff6b6b' },
                      { size: 74,  angle: 180, color: '#ff2b2b' },
                    ].map((dot, i) => (
                      <div key={i} style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 6,
                        height: 6,
                        background: dot.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 10px ${dot.color}, 0 0 20px ${dot.color}`,
                        transformOrigin: `0 ${-dot.size / 2}px`,
                        animation: `orbit-ring ${2 + i * 0.8}s linear infinite`,
                        marginLeft: -3,
                        marginTop: -3,
                      }} />
                    ))}
                    {/* Shield SVG */}
                    <svg
                      width="64" height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        position: 'relative', zIndex: 2,
                        animation: 'shield-glow 2.5s ease-in-out infinite',
                      }}
                    >
                      <path
                        d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z"
                        fill="rgba(220,0,0,0.12)"
                        stroke="#ff2b2b"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 7l4.5 2.25V12c0 2.625-1.75 4.875-4.5 5.5-2.75-.625-4.5-2.875-4.5-5.5V9.25L12 7z"
                        fill="rgba(220,0,0,0.08)"
                        stroke="rgba(220,0,0,0.4)"
                        strokeWidth="0.8"
                      />
                      <circle cx="12" cy="11.5" r="2" fill="none" stroke="#ff2b2b" strokeWidth="1.5"/>
                      <line x1="12" y1="13.5" x2="12" y2="15.5" stroke="#ff2b2b" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Divider */}
                  <div style={loginStyles.divider}>
                    <div style={loginStyles.divLine} />
                    <span style={loginStyles.divText}>ADMIN LOGIN</span>
                    <div style={loginStyles.divLine} />
                  </div>

                  {/* Email Input */}
                  <div style={loginStyles.inputWrap}>
                    {/* Left mail icon */}
                    <svg
                      style={loginStyles.inputIcon}
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(220,0,0,0.55)"
                      strokeWidth="1.5"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M2 7l10 7 10-7"/>
                    </svg>
                    <input
                      ref={inputRef}
                      style={loginStyles.emailInput}
                      type="email"
                      placeholder="admin@gym.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      autoComplete="email"
                      autoFocus
                    />
                    {/* Right user icon */}
                    <svg
                      style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                      width="16" height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>

                  {error && <p style={loginStyles.errorText}>{error}</p>}

                  {/* SEND OTP Button */}
                  <button
                    style={{
                      ...loginStyles.redBtn,
                      ...(btnHover ? {
                        transform: 'scale(1.03) translateY(-2px)',
                        boxShadow: '0 8px 40px rgba(220,0,0,0.65), 0 0 60px rgba(220,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
                      } : {}),
                    }}
                    onClick={handleSendOTP}
                    disabled={loading}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                  >
                    {/* Shine overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0, left: '-100%',
                      width: '60%', height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                      animation: 'btn-shine 2.5s ease-in-out infinite',
                      borderRadius: 'inherit',
                    }} />
                    {/* Paper plane icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22,2 15,22 11,13 2,9"/>
                    </svg>
                    <span style={{ flex: 1, textAlign: 'center' }}>
                      {loading ? 'SENDING...' : 'SEND OTP'}
                    </span>
                    {/* Right arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>

                  {/* Secure note */}
                  <div style={loginStyles.secureNote}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(220,0,0,0.45)" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <path d="M9 12l2 2 4-4" stroke="rgba(0,200,100,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>Secure OTP authentication</span>
                  </div>

                  <p style={loginStyles.copyright}>© 2024 Lifetime Fitness. All rights reserved.</p>
                </div>
              )}

              {/* ─── OTP STEP ─── */}
              {step === 'otp' && (
                <div style={{
                  ...loginStyles.loginForm,
                  animation: 'fadeUp 0.45s ease both',
                }}>
                  <h2 style={loginStyles.heading}>
                    Verify{' '}
                    <span style={{
                      color: '#ff2b2b',
                      textShadow: '0 0 20px rgba(255,43,43,0.6)',
                      animation: 'neon-breathe 3s ease-in-out infinite',
                    }}>
                      OTP
                    </span>
                  </h2>
                  <p style={loginStyles.subtext}>
                    Code sent to{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</strong>
                  </p>

                  {/* Green shield for OTP step */}
                  <div style={{ ...loginStyles.shieldWrap, marginBottom: 18 }}>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 120, height: 120,
                      border: '1px solid rgba(0,200,100,0.2)',
                      borderTop: '2px solid rgba(0,200,100,0.7)',
                      borderRadius: '50%',
                      animation: 'orbit-ring 2.8s linear infinite',
                    }} />
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: 90, height: 90,
                      border: '1px solid rgba(0,200,100,0.15)',
                      borderRight: '2px solid rgba(0,200,100,0.6)',
                      borderRadius: '50%',
                      animation: 'orbit-ring-rev 2s linear infinite',
                    }} />
                    <svg
                      width="64" height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        position: 'relative', zIndex: 2,
                        animation: 'shield-glow-green 2.5s ease-in-out infinite',
                      }}
                    >
                      <path
                        d="M12 2l8 4v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z"
                        fill="rgba(0,200,100,0.1)"
                        stroke="#00c864"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M8 12l3 3 5-5"
                        stroke="#00c864"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* 4 OTP Boxes */}
                  <div style={loginStyles.otpRow}>
                    {[0, 1, 2, 3].map(i => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        style={{
                          ...loginStyles.otpBox,
                          ...(otp[i] ? {
                            borderColor: 'rgba(220,0,0,0.7)',
                            boxShadow: '0 0 0 3px rgba(220,0,0,0.15), 0 0 16px rgba(220,0,0,0.25)',
                            background: 'rgba(220,0,0,0.06)',
                          } : {}),
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otp[i]}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        autoComplete="off"
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div style={loginStyles.timer}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    {expired ? (
                      <span style={{ color: '#ff4444', fontWeight: 600 }}>
                        OTP Expired — please go back to resend
                      </span>
                    ) : (
                      <>
                        Expires in{' '}
                        <strong style={{ color: timeLeft <= 30 ? '#ff4444' : '#ff2b2b' }}>
                          {formatTime(timeLeft)}
                        </strong>
                      </>
                    )}
                  </div>

                  {error && <p style={loginStyles.errorText}>{error}</p>}

                  {/* VERIFY Button */}
                  <button
                    style={{
                      ...loginStyles.redBtn,
                      opacity: expired ? 0.5 : 1,
                      ...(btnHover && !expired ? {
                        transform: 'scale(1.03) translateY(-2px)',
                        boxShadow: '0 8px 40px rgba(220,0,0,0.65), 0 0 60px rgba(220,0,0,0.25)',
                      } : {}),
                    }}
                    onClick={handleVerifyOTP}
                    disabled={loading || expired}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                  >
                    <div style={{
                      position: 'absolute', top: 0, left: '-100%',
                      width: '60%', height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                      animation: 'btn-shine 2.5s ease-in-out infinite',
                    }} />
                    {loading ? (
                      <>
                        <div style={{
                          width: 16, height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                        VERIFYING...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span style={{ flex: 1, textAlign: 'center' }}>VERIFY & LOGIN</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </>
                    )}
                  </button>

                  <button style={loginStyles.backBtn} onClick={handleResend}>
                    ← Back / Resend OTP
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;