import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero/Hero.jsx';
import Magnetic from '../components/Magnetic.jsx';
import './Home.css';

/* ─── Hook scroll reveal ─────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Artwork Card ───────────────────────────────────────── */
function ArtworkCard({ artwork, delay = 0 }) {
  const [ref, visible] = useReveal();
  const price = artwork.price
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(artwork.price)
    : null;
  return (
    <Link
      to={`/oeuvre/${artwork.id}`}
      ref={ref}
      className={`artwork-card ${visible ? 'revealed' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <div className="artwork-card-img">
        <img src={artwork.image_url} alt={artwork.title} loading="lazy" />
        <div className="artwork-card-overlay">
          <span className="artwork-card-btn">Explorer →</span>
        </div>
        {artwork.available === 1 && <span className="artwork-card-badge">Disponible</span>}
      </div>
      <div className="artwork-card-info">
        <h3 className="artwork-card-title">{artwork.title}</h3>
        <p className="artwork-card-artist">{artwork.artist_name}</p>
        <div className="artwork-card-footer">
          {price && <span className="artwork-card-price">{price}</span>}
          {artwork.medium && <span className="tag">{artwork.medium}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ─── Artist Card ────────────────────────────────────────── */
function ArtistCard({ artist, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <Link
      to={`/artiste/${artist.id}`}
      ref={ref}
      className={`artist-card ${visible ? 'revealed' : ''}`}
      style={{ '--delay': `${delay}ms` }}
    >
      <div className="artist-card-avatar">
        {artist.avatar_url
          ? <img src={artist.avatar_url} alt={artist.name} />
          : <span>{artist.name.charAt(0)}</span>}
        <div className="artist-card-avatar-ring" />
      </div>
      <div className="artist-card-info">
        <h3 className="artist-card-name">{artist.name}</h3>
        {artist.location && <p className="artist-card-location">📍 {artist.location}</p>}
        <p className="artist-card-count">{artist.artwork_count || 0} œuvre{artist.artwork_count !== 1 ? 's' : ''}</p>
        {Array.isArray(artist.ai_style_tags) && artist.ai_style_tags.length > 0 && (
          <div className="artist-card-tags">
            {artist.ai_style_tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Step Card ──────────────────────────────────────────── */
function StepCard({ step, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`step-item ${visible ? 'revealed' : ''}`} style={{ '--delay': `${delay}ms` }}>
      <div className="step-num">{step.n}</div>
      <div className="step-emoji">{step.emoji}</div>
      <h3 className="step-title">{step.title}</h3>
      <p className="step-desc">{step.desc}</p>
    </div>
  );
}

/* ─── Testimonial Card ───────────────────────────────────── */
function TestimonialCard({ testimonial: t, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`testimonial-card ${visible ? 'revealed' : ''}`} style={{ '--delay': `${delay}ms` }}>
      <div className="testimonial-stars">{'★'.repeat(t.stars)}</div>
      <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{t.name.charAt(0)}</div>
        <div>
          <p className="testimonial-name">{t.name}</p>
          <p className="testimonial-role">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Pricing Card ───────────────────────────────────────── */
function PricingCard({ plan, delay = 0, onOpenAuth }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`pricing-card ${plan.featured ? 'pricing-featured' : ''} ${visible ? 'revealed' : ''}`} style={{ '--delay': `${delay}ms` }}>
      {plan.featured && <div className="pricing-badge">Populaire</div>}
      <div className="pricing-name">{plan.name}</div>
      <div className="pricing-price">{plan.price}</div>
      <div className="pricing-desc">{plan.desc}</div>
      <ul className="pricing-features">
        {plan.features.map(f => <li key={f}><span className="pricing-check">✓</span>{f}</li>)}
      </ul>
      <button
        className={`btn btn-lg ${plan.featured ? 'btn-gold' : 'btn-outline'}`}
        onClick={() => onOpenAuth('register')}
        style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
      >
        {plan.price === 'Gratuit' ? 'Commencer gratuitement' : 'Choisir ce plan'}
      </button>
    </div>
  );
}

/* ─── Counter animé ─────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    const n = parseInt(target.replace(/\D/g, '')) || 0;
    const dur = 1800;
    const step = 16;
    const inc = n / (dur / step);
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + inc, n);
      setCount(Math.round(cur));
      if (cur >= n) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ─── Marquee ────────────────────────────────────────────── */
function Marquee({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-val">{item.value}</span>
            <span className="marquee-label">{item.label}</span>
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────── */
export default function Home({ onOpenAuth }) {
  const [featured, setFeatured] = useState([]);
  const [artists, setArtists]   = useState([]);
  const [stats, setStats]       = useState(null);

  useEffect(() => {
    fetch('/api/gallery/featured').then(r => r.json()).then(d => {
      setFeatured(Array.isArray(d) ? d : (d.artworks ?? []));
    }).catch(console.error);
    fetch('/api/artists').then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : (d.artists ?? []);
      setArtists(list.slice(0, 6));
    }).catch(console.error);
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(console.error);
  }, []);

  /* ── Marquee data ── */
  const marqueeItems = stats ? [
    { value: `${stats.artists}+`,        label: 'Artistes' },
    { value: `${stats.artworks}+`,       label: 'Œuvres' },
    { value: `${stats.collectors?.toLocaleString('fr-FR') ?? '3 000'}+`, label: 'Collectionneurs' },
    { value: `${stats.countries ?? 28}`, label: 'Pays représentés' },
    { value: 'Gratuit',                  label: 'Portfolio de base' },
    { value: 'IA',                       label: 'Biographie générée' },
  ] : [];

  /* ── Étapes pour artistes ── */
  const steps = [
    { n: '01', emoji: '✦', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes — choisissez votre plan selon vos ambitions.' },
    { n: '02', emoji: '✨', title: 'Générez votre profil IA', desc: "Décrivez votre médium, laissez l'IA rédiger une bio professionnelle et percutante." },
    { n: '03', emoji: '🎨', title: 'Choisissez votre style', desc: '6 presets visuels Awwwards — votre page publique unique, prête à partager.' },
    { n: '04', emoji: '🌍', title: 'Exposez au monde', desc: 'Votre portfolio accessible aux collectionneurs et galeries du monde entier.' },
  ];

  /* ── Plans tarifaires ── */
  const plans = [
    { name: 'Starter', price: 'Gratuit', desc: 'Pour débuter', features: ['1 portfolio', 'Bio IA (500 tokens)', '10 œuvres', 'Lien public partageable'] },
    { name: 'Pro', price: '19€/mois', desc: 'Pour les artistes actifs', features: ['Portfolio illimité', 'Bio IA (5 000 tokens)', 'Œuvres illimitées', '6 presets exclusifs', 'Statistiques avancées'], featured: true },
    { name: 'Galerie', price: '49€/mois', desc: 'Pour les galeries', features: ['Multi-artistes', 'Bio IA (20 000 tokens)', 'Domaine personnalisé', 'Support prioritaire'] },
  ];

  /* ── Témoignages ── */
  const testimonials = [
    { name: 'Camille L.', role: 'Peintre — Paris', quote: "En 10 minutes, j'avais une bio plus belle que tout ce que j'avais écrit en 10 ans. ArtFolio est la meilleure décision que j'ai prise pour ma carrière.", stars: 5 },
    { name: 'Marc D.', role: 'Photographe — Lyon', quote: 'Le preset "Nuit" correspond exactement à mon univers cyberpunk. Mes clients sont bluffés par la qualité de ma page publique.', stars: 5 },
    { name: 'Sofia R.', role: 'Sculptrice — Marseille', quote: "L'IA a capturé mon essence artistique mieux que moi. Je recommande à tous les artistes qui veulent se professionnaliser.", stars: 5 },
  ];

  return (
    <div className="page">
      {/* ── HERO ── */}
      <Hero onOpenAuth={() => onOpenAuth('register')} />

      {/* ── MARQUEE STATS ── */}
      {marqueeItems.length > 0 && (
        <div className="home-marquee-section">
          <Marquee items={marqueeItems} />
        </div>
      )}

      {/* ── ŒUVRES À LA UNE ── */}
      <section className="home-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-label">Sélection</p>
              <h2 className="section-title">Œuvres à la une</h2>
            </div>
            <Link to="/galerie" className="section-cta-link">Voir toute la galerie →</Link>
          </div>
          <div className="artworks-masonry">
            {featured.length > 0
              ? featured.slice(0, 6).map((a, i) => <ArtworkCard key={a.id} artwork={a} delay={i * 80} />)
              : Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="artwork-card-skeleton" style={{ '--delay': `${i * 80}ms` }} />
                ))
            }
          </div>
        </div>
      </section>

      {/* ── POUR LES ARTISTES — Comment ça marche ── */}
      <section className="home-section home-section-dark">
        <div className="container">
          <div className="section-head centered">
            <p className="section-label">Pour les artistes</p>
            <h2 className="section-title">Votre portfolio, réinventé</h2>
            <p className="section-desc">De la création de compte à la page publique en quelques minutes. L'art de vous présenter, simplifié.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <StepCard key={s.n} step={s} delay={i * 120} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button className="btn btn-gold btn-lg" onClick={() => onOpenAuth('register')}>
              Créer mon portfolio gratuit →
            </button>
          </div>
        </div>
      </section>

      {/* ── ARTISTES EN VEDETTE ── */}
      {artists.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="section-label">Talent</p>
                <h2 className="section-title">Artistes en vedette</h2>
              </div>
              <Link to="/artistes" className="section-cta-link">Tous les artistes →</Link>
            </div>
            <div className="artists-grid">
              {artists.map((a, i) => <ArtistCard key={a.id} artist={a} delay={i * 80} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── TÉMOIGNAGES ── */}
      <section className="home-section home-section-alt">
        <div className="container">
          <div className="section-head centered">
            <p className="section-label">Témoignages</p>
            <h2 className="section-title">Ce qu'ils en disent</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS TEASER ── */}
      <section className="home-section home-section-dark">
        <div className="container">
          <div className="section-head centered">
            <p className="section-label">Tarifs</p>
            <h2 className="section-title">Commencez gratuitement</h2>
            <p className="section-desc">Pas besoin de carte bancaire pour démarrer. Évoluez quand vous êtes prêt.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} delay={i * 100} onOpenAuth={onOpenAuth} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="home-cta-final">
        <div className="home-cta-bg" />
        <div className="container home-cta-inner">
          <p className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Rejoignez la galerie</p>
          <h2 className="home-cta-title">Votre art mérite<br />une scène à sa hauteur.</h2>
          <p className="home-cta-desc">Plus de 500 artistes nous font déjà confiance. Créez votre portfolio en 5 minutes.</p>
          <div className="home-cta-actions">
            <Magnetic intensity={0.15}>
              <button className="btn btn-gold btn-xl" onClick={() => onOpenAuth('register')}>
                Créer mon portfolio →
              </button>
            </Magnetic>
            <Magnetic intensity={0.15}>
              <button className="btn btn-ghost-white btn-xl" onClick={() => onOpenAuth('login')}>
                J'ai déjà un compte
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <p className="footer-logo">✦ ArtFolio</p>
            <p className="footer-tagline">La galerie d'art premium en ligne</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-title">Galerie</p>
              <Link to="/galerie">Explorer les œuvres</Link>
              <Link to="/artistes">Découvrir les artistes</Link>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Artistes</p>
              <button onClick={() => onOpenAuth('register')} className="footer-link-btn">Créer un compte</button>
              <button onClick={() => onOpenAuth('login')} className="footer-link-btn">Se connecter</button>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Tarifs</p>
              <Link to="/tarifs">Voir les plans</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2026 ArtFolio — Galerie d'art premium. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
