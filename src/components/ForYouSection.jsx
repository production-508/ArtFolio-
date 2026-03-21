import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ForYouSection.css';

/**
 * Hook pour tracker les interactions
 */
function useArtworkTracking(artworkId) {
  const startTimeRef = useRef(Date.now());
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    return () => {
      if (!hasTrackedRef.current && artworkId) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        trackView(artworkId, duration);
      }
    };
  }, [artworkId]);

  const trackView = async (id, duration) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/tracking/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkId: id, duration })
      });
    } catch (err) {
      console.error('Erreur tracking:', err);
    }
  };

  const trackInteraction = async (type, duration = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/tracking/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkId, type, duration })
      });
    } catch (err) {
      console.error('Erreur tracking interaction:', err);
    }
  };

  return { trackView, trackInteraction };
}

/**
 * Carte d'œuvre avec tracking
 */
function ForYouArtworkCard({ artwork, index, onHover }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hoverStartRef = useRef(null);
  const { trackInteraction } = useArtworkTracking(artwork.id);

  const price = artwork.price
    ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(artwork.price)
    : null;

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverStartRef.current = Date.now();
    trackInteraction('hover', 0);
    if (onHover) onHover(artwork);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverStartRef.current) {
      const duration = Math.round((Date.now() - hoverStartRef.current) / 1000);
      trackInteraction('hover', duration);
      hoverStartRef.current = null;
    }
  };

  const handleClick = () => {
    trackInteraction('click', 0);
  };

  return (
    <Link
      to={`/oeuvre/${artwork.id}`}
      className={`foryou-card ${isHovered ? 'hovered' : ''} ${imageLoaded ? 'loaded' : ''}`}
      style={{ '--delay': `${index * 100}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="foryou-card-image">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="foryou-card-overlay">
          <span className="foryou-card-cta">Découvrir →</span>
        </div>
        {artwork.available === 1 && <span className="foryou-card-badge">Disponible</span>}
        {artwork.reasons && artwork.reasons.length > 0 && (
          <div className="foryou-card-reason">
            {artwork.reasons[0]}
          </div>
        )}
      </div>
      <div className="foryou-card-info">
        <h3 className="foryou-card-title">{artwork.title}</h3>
        <p className="foryou-card-artist">{artwork.artist_name}</p>
        <div className="foryou-card-footer">
          {price && <span className="foryou-card-price">{price}</span>}
          {artwork.medium && <span className="foryou-card-tag">{artwork.medium}</span>}
        </div>
      </div>
    </Link>
  );
}

/**
 * Collection thématique
 */
function ThematicCollection({ collection, index }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
  }, []);

  if (!collection.artworks || collection.artworks.length === 0) return null;

  return (
    <div className="foryou-collection" style={{ '--delay': `${index * 150}ms` }}>
      <div className="foryou-collection-header">
        <div className="foryou-collection-title-group">
          <h3 className="foryou-collection-title">{collection.title}</h3>
          {collection.subtitle && (
            <p className="foryou-collection-subtitle">{collection.subtitle}</p>
          )}
        </div>
        <div className="foryou-collection-nav">
          <button
            className={`foryou-nav-btn ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            ←
          </button>
          <button
            className={`foryou-nav-btn ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            →
          </button>
        </div>
      </div>
      <div 
        className="foryou-collection-scroll" 
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {collection.artworks.map((artwork, i) => (
          <ForYouArtworkCard 
            key={artwork.id} 
            artwork={artwork} 
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Section "Pour Vous" principale
 */
export default function ForYouSection() {
  const [recommendations, setRecommendations] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchFallbackData();
    } else {
      fetchPersonalizedData();
    }
  }, [isAuthenticated]);

  const fetchFallbackData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recommendations/trending?limit=10');
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.artworks.map(a => ({
          ...a,
          reasons: ['Populaire sur ArtFolio'],
          isFallback: true
        })));
      }
    } catch (err) {
      setError('Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Récupérer les recommandations "Pour Vous"
      const recsResponse = await fetch('/api/recommendations/for-you?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recsData = await recsResponse.json();

      // Récupérer les collections thématiques
      const collsResponse = await fetch('/api/recommendations/collections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const collsData = await collsResponse.json();

      if (recsData.success) {
        setRecommendations(recsData.recommendations);
      }

      if (collsData.success) {
        setCollections(collsData.collections);
      }
    } catch (err) {
      setError('Erreur lors du chargement des recommandations');
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="foryou-section">
        <div className="container">
          <div className="foryou-header">
            <h2 className="foryou-title">
              <span className="foryou-icon">✦</span>
              {isAuthenticated ? 'Pour vous' : 'Tendances'}
            </h2>
          </div>
          <div className="foryou-carousel">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="foryou-card-skeleton" style={{ '--delay': `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="foryou-section">
        <div className="container">
          <p className="foryou-error">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="foryou-section">
      <div className="container">
        {/* Section "Pour Vous" principale */}
        <div className="foryou-main">
          <div className="foryou-header">
            <div className="foryou-title-group">
              <h2 className="foryou-title">
                <span className="foryou-icon">✦</span>
                {isAuthenticated ? 'Selon vos goûts' : 'Tendances'}
              </h2>
              {isAuthenticated && (
                <p className="foryou-subtitle">
                  Des œuvres sélectionnées pour vous
                </p>
              )}
            </div>
            <div className="foryou-nav">
              <button
                className={`foryou-nav-btn ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                ←
              </button>
              <button
                className={`foryou-nav-btn ${!canScrollRight ? 'disabled' : ''}`}
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                →
              </button>
            </div>
          </div>

          <div 
            className="foryou-carousel" 
            ref={scrollRef}
            onScroll={checkScroll}
          >
            {recommendations.map((artwork, i) => (
              <ForYouArtworkCard 
                key={artwork.id} 
                artwork={artwork} 
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Collections thématiques */}
        {collections.length > 0 && (
          <div className="foryou-collections">
            {collections.map((collection, i) => (
              <ThematicCollection 
                key={collection.id} 
                collection={collection}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
