// ─────────────────────────────────────────────────────────────
// Login.styles.ts
// Place: frontend/src/styles/Login.styles.ts
// ─────────────────────────────────────────────────────────────

import React from 'react';

export const loginCSS = `
  /* ── Page & Root ── */
  .lf-page {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 50%, rgba(120,0,0,0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(80,0,0,0.1) 0%, transparent 50%),
                #060609;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  .lf-root {
    width: 100%;
    max-width: 1100px;
    height: 640px;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    box-shadow:
      0 0 0 1px rgba(220,0,0,0.2),
      0 40px 120px rgba(0,0,0,0.8),
      0 0 80px rgba(220,0,0,0.05);
  }

  /* ── Panels ── */
  .lf-panel {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    transition: left 0.95s cubic-bezier(0.77,0,0.175,1),
                filter 0.5s ease,
                opacity 0.5s ease;
  }

  .lf-panel-brand { background: #0a0a0f; overflow: hidden; }
  .lf-panel-login { background: #0e0e16; }

  .lf-panel.swapping {
    filter: blur(6px);
    opacity: 0.5;
  }

  /* ── Brand image ── */
  .lf-brand-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    animation: hologram-flicker 8s infinite;
  }

  .lf-brand-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%);
    pointer-events: none;
  }

  /* Red neon edge on brand panel right side */
  .lf-brand-edge {
    position: absolute;
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
    background: linear-gradient(180deg, transparent, rgba(220,0,0,0.8), transparent);
    box-shadow: 0 0 16px rgba(220,0,0,0.6), 0 0 32px rgba(220,0,0,0.3);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  /* ── Login inner wrapper ── */
  .lf-login-inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 44px;
    position: relative;
    overflow: hidden;
  }

  /* Subtle grid in login panel */
  .lf-login-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(220,0,0,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(220,0,0,0.025) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  /* Ambient corner glow */
  .lf-login-inner::after {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(220,0,0,0.08) 0%, transparent 70%);
    pointer-events: none;
    animation: float-y 4s ease-in-out infinite;
  }

  /* ── Login form ── */
  .lf-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s ease both;
  }

  /* ── Heading ── */
  .lf-heading {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
  }

  .lf-heading-accent {
    color: #ff2b2b;
    text-shadow: 0 0 20px rgba(255,43,43,0.6), 0 0 40px rgba(255,43,43,0.3);
    animation: neon-breathe 3s ease-in-out infinite;
  }

  .lf-subtext {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    text-align: center;
    margin-bottom: 24px;
    letter-spacing: 0.2px;
  }

  /* ── Shield section ── */
  .lf-shield-wrap {
    width: 130px;
    height: 130px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 22px;
  }

  /* Orbit rings */
  .lf-orbit {
    position: absolute;
    top: 50%;
    left: 50%;
    border: 1px solid rgba(220,0,0,0.25);
    border-radius: 50%;
    pointer-events: none;
  }

  .lf-orbit-1 {
    width: 130px;
    height: 130px;
    border-top-color: rgba(220,0,0,0.6);
    animation: orbit-ring 3s linear infinite;
  }

  .lf-orbit-2 {
    width: 100px;
    height: 100px;
    border-right-color: rgba(220,0,0,0.5);
    animation: orbit-ring-rev 2s linear infinite;
  }

  .lf-orbit-3 {
    width: 76px;
    height: 76px;
    border-bottom-color: rgba(220,0,0,0.4);
    animation: orbit-ring 4s linear infinite;
  }

  /* Orbit dots */
  .lf-orbit-dot {
    position: absolute;
    width: 5px;
    height: 5px;
    background: #ff2b2b;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(255,43,43,0.9), 0 0 16px rgba(255,43,43,0.5);
    top: 50%;
    left: 50%;
  }

  .lf-shield-svg {
    position: relative;
    z-index: 2;
    animation: shield-glow 2.5s ease-in-out infinite;
  }

  .lf-shield-svg-green {
    position: relative;
    z-index: 2;
    animation: shield-glow-green 2.5s ease-in-out infinite;
  }

  /* ── Divider ── */
  .lf-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin-bottom: 18px;
  }

  .lf-div-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,0,0,0.3), transparent);
  }

  .lf-div-text {
    font-size: 10px;
    font-weight: 700;
    color: rgba(220,0,0,0.6);
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  /* ── Email input ── */
  .lf-input-wrap {
    width: 100%;
    position: relative;
    margin-bottom: 14px;
  }

  .lf-input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
  }

  .lf-input-right-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
  }

  .lf-email-input {
    width: 100%;
    padding: 14px 46px 14px 46px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
    font-family: 'Inter', sans-serif;
  }

  .lf-email-input::placeholder { color: rgba(255,255,255,0.25); }

  .lf-email-input:focus {
    border-color: rgba(220,0,0,0.6);
    background: rgba(220,0,0,0.04);
    box-shadow: 0 0 0 3px rgba(220,0,0,0.1), inset 0 0 20px rgba(220,0,0,0.03);
  }

  /* ── Error text ── */
  .lf-error {
    font-size: 12px;
    color: #ff4444;
    margin-bottom: 10px;
    align-self: flex-start;
    width: 100%;
  }

  /* ── SEND OTP Button ── */
  .lf-send-btn {
    width: 100%;
    padding: 15px 20px;
    background: linear-gradient(135deg, #ff2b2b 0%, #d40000 50%, #aa0000 100%);
    border: none;
    border-radius: 14px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 4px 24px rgba(220,0,0,0.4),
      0 0 0 1px rgba(255,255,255,0.05),
      inset 0 1px 0 rgba(255,255,255,0.1);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.3s ease;
    font-family: 'Inter', sans-serif;
  }

  /* Shine sweep */
  .lf-send-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    animation: btn-shine 2.5s ease-in-out infinite;
    border-radius: inherit;
  }

  /* Energy pulse ring */
  .lf-send-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ff2b2b, #ff6b6b, #d40000, #ff2b2b);
    background-size: 300% 300%;
    animation: border-shimmer 3s linear infinite;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .lf-send-btn:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 40px rgba(220,0,0,0.65),
      0 0 60px rgba(220,0,0,0.25),
      0 0 0 1px rgba(255,100,100,0.3),
      inset 0 1px 0 rgba(255,255,255,0.15);
  }

  .lf-send-btn:hover::after { opacity: 1; }

  .lf-send-btn:active {
    transform: scale(0.98) translateY(0);
    box-shadow: 0 2px 16px rgba(220,0,0,0.4);
  }

  .lf-send-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .lf-btn-icon-left { flex-shrink: 0; }
  .lf-btn-icon-right { flex-shrink: 0; margin-left: auto; }
  .lf-btn-text { flex: 1; text-align: center; }

  /* ── VERIFY button ── */
  .lf-verify-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #ff2b2b 0%, #d40000 50%, #aa0000 100%);
    border: none;
    border-radius: 14px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 4px 24px rgba(220,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.1);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
    font-family: 'Inter', sans-serif;
  }

  .lf-verify-btn::before {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    animation: btn-shine 2.5s ease-in-out infinite;
  }

  .lf-verify-btn:hover {
    transform: scale(1.03) translateY(-2px);
    box-shadow: 0 8px 40px rgba(220,0,0,0.65), 0 0 60px rgba(220,0,0,0.25);
  }

  .lf-verify-btn:active { transform: scale(0.98); }

  .lf-verify-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* ── Secure note ── */
  .lf-secure-note {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-top: 14px;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.3px;
  }

  .lf-copyright {
    margin-top: 16px;
    font-size: 10px;
    color: rgba(255,255,255,0.15);
    text-align: center;
    letter-spacing: 0.3px;
  }

  /* ── OTP boxes ── */
  .lf-otp-row {
    display: flex;
    gap: 14px;
    margin-bottom: 16px;
    width: 100%;
    justify-content: center;
  }

  .lf-otp-box {
    width: 62px;
    height: 68px;
    text-align: center;
    font-size: 26px;
    font-weight: 700;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #ffffff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    font-family: 'Inter', sans-serif;
    caret-color: #e00000;
  }

  .lf-otp-box:focus {
    border-color: #e00000;
    box-shadow: 0 0 0 3px rgba(220,0,0,0.2), 0 0 20px rgba(220,0,0,0.3);
    transform: scale(1.06);
    background: rgba(220,0,0,0.06);
  }

  .lf-otp-box.filled {
    border-color: rgba(220,0,0,0.7);
    box-shadow: 0 0 12px rgba(220,0,0,0.25);
  }

  /* ── Timer ── */
  .lf-timer {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
    width: 100%;
  }

  .lf-timer-val { color: #e00000; font-weight: 700; }
  .lf-timer-urgent { color: #ff4444 !important; }

  /* ── Back button ── */
  .lf-back-btn {
    margin-top: 12px;
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .lf-back-btn:hover { color: rgba(220,0,0,0.8); }

  /* ── Particles container ── */
  .lf-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
`;

export const loginStyles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  root: {
    width: '100%',
    maxWidth: 1100,
    height: 640,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  panel: {
    position: 'absolute',
    top: 0,
    width: '50%',
    height: '100%',
    transition: 'left 0.95s cubic-bezier(0.77,0,0.175,1), filter 0.5s ease, opacity 0.5s ease',
  },
  brandPanel: { background: '#0a0a0f', overflow: 'hidden' },
  loginPanel: { background: '#0e0e16' },
  brandImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  brandOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)',
    pointerEvents: 'none',
  },
  loginInner: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 44px',
    position: 'relative',
    overflow: 'hidden',
  },
  loginForm: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: 24,
  },
  shieldWrap: {
    width: 130,
    height: 130,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  divider: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginBottom: 18 },
  divLine: { flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(220,0,0,0.3), transparent)' },
  divText: { fontSize: 10, fontWeight: 700, color: 'rgba(220,0,0,0.6)', letterSpacing: 3 },
  inputWrap: { width: '100%', position: 'relative', marginBottom: 14 },
  inputIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 2 },
  emailInput: {
    width: '100%',
    padding: '14px 46px 14px 46px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 14,
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
  },
  errorText: { fontSize: 12, color: '#ff4444', marginBottom: 10, alignSelf: 'flex-start', width: '100%' },
  redBtn: {
    width: '100%',
    padding: '15px 20px',
    background: 'linear-gradient(135deg, #ff2b2b 0%, #d40000 50%, #aa0000 100%)',
    border: 'none',
    borderRadius: 14,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '2.5px',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(220,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
    fontFamily: "'Inter', sans-serif",
  },
  secureNote: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  copyright: { marginTop: 16, fontSize: 10, color: 'rgba(255,255,255,0.15)', textAlign: 'center' as const },
  otpRow: { display: 'flex', gap: 14, marginBottom: 16, width: '100%', justifyContent: 'center' },
  otpBox: {
    width: 62,
    height: 68,
    textAlign: 'center' as const,
    fontSize: 26,
    fontWeight: 700,
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#ffffff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
    fontFamily: "'Inter', sans-serif",
  },
  timer: { fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, width: '100%' },
  backBtn: { marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s' },
};