// ─────────────────────────────────────────────────────────────
// shared.styles.ts
// Place: frontend/src/styles/shared.styles.ts
// Global CSS variables injection — import once in index.tsx or App.tsx
// ─────────────────────────────────────────────────────────────

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root[data-theme='dark'] {
    --bg-primary:    #0a0a0f;
    --bg-secondary:  #111118;
    --bg-card:       #16161f;
    --bg-hover:      rgba(255,255,255,0.05);
    --text-primary:  #ffffff;
    --text-secondary:rgba(255,255,255,0.6);
    --text-muted:    rgba(255,255,255,0.3);
    --border-color:  rgba(255,255,255,0.08);
    --border-hover:  rgba(220,0,0,0.4);
    --accent:        #e00000;
    --accent-glow:   rgba(220,0,0,0.3);
    --sidebar-bg:    #0d0d12;
    --input-bg:      rgba(255,255,255,0.05);
    --input-border:  rgba(255,255,255,0.1);
  }

  :root[data-theme='light'] {
    --bg-primary:    #f5f5f7;
    --bg-secondary:  #ffffff;
    --bg-card:       #ffffff;
    --bg-hover:      rgba(0,0,0,0.04);
    --text-primary:  #111111;
    --text-secondary:#555555;
    --text-muted:    #999999;
    --border-color:  rgba(0,0,0,0.1);
    --border-hover:  rgba(220,0,0,0.4);
    --accent:        #d40000;
    --accent-glow:   rgba(212,0,0,0.2);
    --sidebar-bg:    #1a1a22;
    --input-bg:      #f0f0f0;
    --input-border:  rgba(0,0,0,0.12);
  }

  html, body, #root {
    height: 100%;
    font-family: 'Inter', sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    transition: background 0.3s, color 0.3s;
  }

  button { font-family: 'Inter', sans-serif; }
  input, select, textarea { font-family: 'Inter', sans-serif; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(220,0,0,0.3); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(220,0,0,0.6); }

  /* Global keyframes */
  @keyframes spin           { to { transform: rotate(360deg); } }
  @keyframes fadeUp         { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn         { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse-glow     { 0%,100% { box-shadow:0 0 20px rgba(220,0,0,0.4); } 50% { box-shadow:0 0 40px rgba(220,0,0,0.8),0 0 80px rgba(220,0,0,0.3); } }
  @keyframes neon-breathe   { 0%,100% { text-shadow:0 0 20px rgba(220,0,0,0.4),0 0 40px rgba(220,0,0,0.2); } 50% { text-shadow:0 0 40px rgba(220,0,0,0.9),0 0 80px rgba(220,0,0,0.4),0 0 120px rgba(220,0,0,0.2); } }
  @keyframes ring-pulse     { 0%,100% { transform:scale(1); opacity:0.35; } 50% { transform:scale(1.1); opacity:0.9; } }
  @keyframes shield-glow    { 0%,100% { filter:drop-shadow(0 0 10px rgba(220,0,0,0.5)); } 50% { filter:drop-shadow(0 0 28px rgba(220,0,0,1)) drop-shadow(0 0 60px rgba(220,0,0,0.4)); } }
  @keyframes shield-glow-green { 0%,100% { filter:drop-shadow(0 0 10px rgba(0,200,100,0.5)); } 50% { filter:drop-shadow(0 0 28px rgba(0,200,100,1)) drop-shadow(0 0 60px rgba(0,200,100,0.4)); } }
  @keyframes orbit-ring     { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(360deg); } }
  @keyframes orbit-ring-rev { from { transform:translate(-50%,-50%) rotate(0deg); } to { transform:translate(-50%,-50%) rotate(-360deg); } }
  @keyframes particle-float { 0% { opacity:0; transform:translateY(0) scale(0); } 20% { opacity:0.8; } 80% { opacity:0.3; } 100% { opacity:0; transform:translateY(-120px) translateX(var(--dx,0px)) scale(0.5); } }
  @keyframes streak-slide   { 0% { opacity:0; transform:translateY(-60px) rotate(var(--angle,0deg)); } 30% { opacity:0.9; } 70% { opacity:0.4; } 100% { opacity:0; transform:translateY(700px) rotate(var(--angle,0deg)); } }
  @keyframes btn-shine      { 0% { left:-100%; } 100% { left:200%; } }
  @keyframes border-shimmer { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes float-y        { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  @keyframes card-sweep     { 0% { left:-100%; opacity:0; } 40% { opacity:0.6; } 100% { left:200%; opacity:0; } }
  @keyframes hologram-flicker { 0%,96%,98%,100% { opacity:1; } 97%,99% { opacity:0.6; } }
  @keyframes energy-spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
`;