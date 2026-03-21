import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Composant de paiement Stripe
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Charger Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * CheckoutPage — Page de paiement
 * Style institutionnel épuré
 */
export default function CheckoutPage() {
  const { items, total, subtotal, shipping, hasItems, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Rediriger si panier vide
  useEffect(() => {
    if (!hasItems && !loading) {
      navigate('/gallery');
    }
  }, [hasItems, navigate, loading]);

  // Créer la commande et obtenir le clientSecret
  useEffect(() => {
    const createOrder = async () => {
      if (!hasItems || clientSecret) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('artfolio_token');
        
        // Créer la commande
        const orderRes = await fetch(`${API_BASE}/orders/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: items.map(item => ({
              artwork_id: item.id,
              price: item.price
            }))
          })
        });
        
        if (!orderRes.ok) {
          const err = await orderRes.json();
          throw new Error(err.error || 'Erreur création commande');
        }
        
        const orderData = await orderRes.json();
        setClientSecret(orderData.clientSecret);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      createOrder();
    }
  }, [hasItems, items, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
          <h1 
            className="text-2xl text-white/90 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Connexion requise
          </h1>
          <p className="text-white/50 text-sm mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Veuillez vous connecter pour finaliser votre achat
          </p>
          <a
            href="/login?redirect=/checkout"
            className="inline-block px-6 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h1 
            className="text-2xl md:text-3xl text-white/90"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Finaliser votre commande
          </h1>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-white/40 animate-spin" strokeWidth={1.5} />
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                <CheckoutForm 
                  items={items}
                  total={total}
                  onSuccess={() => {
                    clearCart();
                    navigate('/checkout/success');
                  }}
                />
              </Elements>
            ) : null}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <CheckoutSummary 
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Formulaire de paiement Stripe
function CheckoutForm({ items, total, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Adresse de livraison
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    // Validation
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        elements.getElement(CardElement),
        {
          payment_method_data: {
            billing_details: {
              name: shippingAddress.fullName,
            }
          }
        }
      );
      
      if (error) {
        setErrorMessage(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('Une erreur est survenue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Adresse de livraison */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          <h2 
            className="text-lg text-white/90"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Adresse de livraison
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Nom complet *
            </label>
            <input
              type="text"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Adresse ligne 1 *
            </label>
            <input
              type="text"
              value={shippingAddress.addressLine1}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Adresse ligne 2
            </label>
            <input
              type="text"
              value={shippingAddress.addressLine2}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
              placeholder="Appartement, suite, etc. (optionnel)"
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Ville *
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </div>
          
          <div>
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Code postal *
            </label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-white/60 text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Téléphone
            </label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white/90 text-sm focus:border-white/30 focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        </div>
      </section>

      {/* Paiement */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-white/60" strokeWidth={1.5} />
          <h2 
            className="text-lg text-white/90"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Paiement sécurisé
          </h2>
        </div>
        
        <div className="p-4 bg-white/5 border border-white/10">
          <CardElement 
            options={cardElementOptions}
            className="py-2"
          />
        </div>
        
        <p className="text-white/40 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
          Vos données de paiement sont sécurisées par Stripe. Nous ne stockons pas vos informations bancaires.
        </p>
      </section>

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 bg-white text-black font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
            Traitement en cours...
          </>
        ) : (
          <>
            Payer {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}
          </>
        )}
      </button>
    </form>
  );
}

// Résumé de commande
function CheckoutSummary({ items, subtotal, shipping, total }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 space-y-6 sticky top-6">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-white/60" strokeWidth={1.5} />
        <h2 
          className="text-lg text-white/90"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Résumé
        </h2>
      </div>
      
      {/* Liste des œuvres */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-white/20" strokeWidth={1} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 
                className="text-white/90 text-sm truncate"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {item.title}
              </h3>
              <p className="text-white/50 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.artist_name}
              </p>
              <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {formatPrice(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <hr className="border-white/10" />
      
      {/* Totaux */}
      <div className="space-y-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="flex justify-between text-white/60">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-white/60">
          <span>Livraison</span>
          <span>{formatPrice(shipping)}</span>
        </div>
      </div>
      
      <hr className="border-white/10" />
      
      <div className="flex justify-between items-center">
        <span 
          className="text-white/90 text-lg"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Total
        </span>
        <span 
          className="text-white text-xl"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {formatPrice(total)}
        </span>
      </div>
      
      <p className="text-white/30 text-xs text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        TVA incluse le cas échéant
      </p>
    </div>
  );
}

// Options Stripe
const stripeAppearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#ffffff',
    colorBackground: '#0a0a0a',
    colorText: '#ffffff',
    colorDanger: '#ef4444',
    borderRadius: '0px',
  },
  rules: {
    '.Input': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderColor: 'rgba(255,255,255,0.1)',
      color: '#ffffff',
    },
    '.Input:focus': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
  }
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#ffffff',
      '::placeholder': {
        color: 'rgba(255,255,255,0.4)',
      },
    },
  },
};
