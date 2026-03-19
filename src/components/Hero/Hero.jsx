import { useState, useEffect, useCallback, useRef } from 'react';
import './Hero.css';

const AUTOPLAY  = 6500;
const COLORS    = ['#c9a96e','#e8c99e','#a07840','#d4b07d','#b8935a','#e0c08a'];

// ─── Kinetic title words ──────────────────────────────────────────────────
function KineticTitle({ text }) {
  if (!text) return null;
  const words = text.split(' ');
  return (
    <h1 className="hero-title" aria-label={text}>
      {words.map((word, wi) => (
        <span
          key={wi}
          className="hero-word hero-word-anim"
          style={{ animationDelay: `${wi * 110}ms` }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

// ─── Canvas Particles ─────────────────────────────────────────────────────
function ParticleCanvas({ color }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf, W, H;
    const particles = [];
    const N = 48;

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      particles.push({
        x: Math.random() * 1,
        y: Math.random() * 1,
        size: Math.random() * 1.8 + 0.4,
        speed: Math.random() * 0.0002 + 0.00008,
        dx: (Math.random() - 0.5) * 0.0003,
        dy: -(Math.random() * 0.0004 + 0.00008),
        opacity: Math.random() * 0.35 + 0.05,
      });
    }

    let frame = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        if (p.x < 0 || p.x > 1) p.dx *= -1;
        const px = p.x * W, py = p.y * H;
        const pulseMag = Math.sin(frame * 0.02 + p.opacity * 12) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(px, py, p.size * pulseMag, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color]);
  return <canvas ref={ref} className="hero-canvas" />;
}

// ─── Main Hero ────────────────────────────────────────────────────────────
export default function Hero({ onOpenAuth }) {
  const [artworks, setArtworks] = useState([]);
  const [idx, setIdx]           = useState(0);
  const [phase, setPhase]       = useState('visible'); // 'visible' | 'exit' | 'enter'
  const timerRef                = useRef(null);
  const thumbsRef               = useRef(null);
  const imgRef                  = useRef(null);
  const heroRef                 = useRef(null);

  // Fetch
  useEffect(() => {
    fetch('/api/gallery/featured')
      .then(r => r.json())
      .then(d => setArtworks(Array.isArray(d) ? d : (d.artworks ?? [])))
      .catch(console.error);
  }, []);

  // ── 3D magnetic tilt ────────────────────────────────────────────────────
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left) / width  - 0.5;
      const y = (e.clientY - top)  / height - 0.5;
      hero.style.setProperty('--tilt-x', `${(-y * 7).toFixed(2)}deg`);
      hero.style.setProperty('--tilt-y', `${( x * 7).toFixed(2)}deg`);
    };
    const onLeave = () => {
      hero.style.setProperty('--tilt-x', '0deg');
      hero.style.setProperty('--tilt-y', '0deg');
    };
    hero.addEventListener('mousemove', onMove);
    hero.addEventListener('mouseleave', onLeave);
    return () => { hero.removeEventListener('mousemove', onMove); hero.removeEventListener('mouseleave', onLeave); };
  }, []);

  // ── Transition ──────────────────────────────────────────────────────────
  const goTo = useCallback((nextIdx) => {
    setPhase('exit');
    setTimeout(() => {
      setIdx(nextIdx);
      setPhase('enter');
      setTimeout(() => setPhase('visible'), 50);
    }, 700);
  }, []);

  const next = useCallback(() => goTo((idx + 1) % Math.max(artworks.length, 1)), [idx, artworks.length, goTo]);
  const prev = useCallback(() => goTo((idx - 1 + artworks.length) % Math.max(artworks.length, 1)), [idx, artworks.length, goTo]);

  // Autoplay
  useEffect(() => {
    if (!artworks.length) return;
    timerRef.current = setInterval(next, AUTOPLAY);
    return () => clearInterval(timerRef.current);
  }, [next, artworks.length]);

  // Thumb scroll
  useEffect(() => {
    if (!thumbsRef.current || !artworks.length) return;
    const el = thumbsRef.current.children[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [idx, artworks.length]);

  const art   = artworks[idx];
  const color = COLORS[idx % COLORS.length];
  const price = art?.price
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(art.price)
    : null;

  if (!artworks.length) {
    return (
      <section className="hero hero-loading">
        <div className="hero-loader">
          <div className="hero-loader-ring" />
          <span>Chargement de la galerie…</span>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" ref={heroRef} style={{ '--accent': color }}>
      {/* ── Canvas particles ── */}
      <ParticleCanvas color={color} />

      {/* ── Image plein écran ── */}
      <div className={`hero-bg-wrap ${phase}`}>
        {art?.image_url && (
          <img
            ref={imgRef}
            key={`img-${idx}`}
            src={art.image_url}
            alt={art.title}
            className="hero-bg-img"
          />
        )}
        <div className="hero-grain" />
        <div className="hero-vignette" />
        <div className="hero-color-overlay" style={{ background: `radial-gradient(ellipse at 70% 50%, ${color}18 0%, transparent 60%)` }} />
      </div>

      {/* ── Contenu principal — centré / brutalist ── */}
      <div className="hero-main">
        {/* Méta-données */}
        <div key={`meta-${idx}`} className="hero-meta-row">
          {art?.artist_name && <span className="hero-meta-item">{art.artist_name}</span>}
          {art?.medium      && <><span className="hero-meta-sep">·</span><span className="hero-meta-item">{art.medium}</span></>}
          {art?.year        && <><span className="hero-meta-sep">·</span><span className="hero-meta-item">{art.year}</span></>}
        </div>

        {/* Titre kinétique */}
        <div key={`title-${idx}`} className="hero-title-wrap">
          <KineticTitle text={art?.title} />
        </div>

        {/* Description */}
        <p key={`desc-${idx}`} className="hero-desc">
          {art?.description || `Une œuvre exclusive de ${art?.artist_name}.`}
        </p>

        {/* CTA Minimalist */}
        <div key={`cta-${idx}`} className="hero-actions">
          <button className="hero-btn-brutal" onClick={() => { clearInterval(timerRef.current); next(); }}>
            Passer l'œuvre — {String(idx + 1).padStart(2, '0')}/{String(artworks.length).padStart(2, '0')}
          </button>
        </div>
      </div>
    </section>
  );
}
