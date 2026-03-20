import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Formulaire de carte pour abonnement
function SubscriptionForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Créer l'abonnement au chargement
    api.post('/stripe/subscription/create')
      .then(res => setClientSecret(res.data.clientSecret))
      .catch(err => setError(err.response?.data?.error || 'Erreur lors de la création'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (confirmError) {
      setError(confirmError.message);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
              invalid: { color: '#9e2146' },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Traitement...' : 'Activer l\'abonnement 5€/mois'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-gray-600 hover:text-gray-800"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// Modal de paiement pour achat d'œuvre
function PaymentForm({ artwork, sellerId, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    api.post('/stripe/payment/create', {
      artworkId: artwork.id,
      sellerId: sellerId
    })
      .then(res => {
        setClientSecret(res.data.clientSecret);
        setPaymentDetails(res.data);
      })
      .catch(err => setError(err.response?.data?.error || 'Erreur'));
  }, [artwork.id, sellerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (confirmError) {
      setError(confirmError.message);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }

    setLoading(false);
  };

  if (!paymentDetails) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">{artwork.title}</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Prix :</span>
            <span>{paymentDetails.amount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>Commission ArtFolio (7%) :</span>
            <span>{paymentDetails.commission.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total :</span>
            <span>{paymentDetails.amount.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#424770' },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Traitement...' : `Payer ${paymentDetails.amount.toFixed(2)} €`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 text-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// Widget d'abonnement
export function SubscriptionWidget() {
  const [status, setStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.get('/stripe/subscription/status');
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => setShowForm(true);
  
  const handleCancel = async () => {
    if (!confirm('Voulez-vous vraiment annuler votre abonnement ?')) return;
    try {
      await api.post('/stripe/subscription/cancel');
      loadStatus();
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    }
  };

  if (loading) return <div>Chargement...</div>;

  // Abonnement actif
  if (status?.active) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <span className="text-xl">✓</span>
          <span className="font-semibold">Abonnement Pro actif</span>
        </div>
        <p className="text-sm text-green-700">
          Renouvellement le {new Date(status.currentPeriodEnd).toLocaleDateString('fr-FR')}
        </p>
        <button
          onClick={handleCancel}
          className="mt-3 text-sm text-red-600 hover:text-red-800"
        >
          Annuler l'abonnement
        </button>
      </div>
    );
  }

  // Pas d'abonnement
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <h3 className="font-semibold text-purple-900 mb-2">Passez à Pro</h3>
      <ul className="text-sm text-purple-800 space-y-1 mb-4">
        <li>• Analyses IA illimitées</li>
        <li>• Priorité dans les recherches</li>
        <li>• Badge Pro sur votre profil</li>
        <li>• Support prioritaire</li>
      </ul>
      
      {showForm ? (
        <Elements stripe={stripePromise}>
          <SubscriptionForm 
            onSuccess={() => { setShowForm(false); loadStatus(); }}
            onCancel={() => setShowForm(false)}
          />
        </Elements>
      ) : (
        <button
          onClick={handleSubscribe}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
        >
          S'abonner pour 5€/mois
        </button>
      )}
    </div>
  );
}

// Bouton d'achat
export function BuyButton({ artwork, sellerId, onSuccess }) {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPayment(true)}
        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
      >
        Acheter {artwork.price} €
      </button>

      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Finaliser l'achat</h3>
            <Elements stripe={stripePromise}>
              <PaymentForm
                artwork={artwork}
                sellerId={sellerId}
                onSuccess={() => { setShowPayment(false); onSuccess?.(); }}
                onCancel={() => setShowPayment(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </>
  );
}

// Page historique transactions
export function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, purchases, sales
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const res = await api.get(`/stripe/transactions${params}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Historique des transactions</h2>
      
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'Tout' },
          { key: 'purchases', label: 'Achats' },
          { key: 'sales', label: 'Ventes' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg ${
              filter === key 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          Aucune transaction pour le moment
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(t => (
            <div key={t.id} className="border rounded-lg p-4 flex gap-4">
              <img 
                src={t.artwork_image} 
                alt={t.artwork_title}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{t.artwork_title}</h4>
                    <p className="text-sm text-gray-600">
                      {t.buyer_id === user?.id ? (
                        <>
                          Acheté à <span className="font-medium">{t.seller_name}</span>
                        </>
                      ) : (
                        <>
                          Vendu à <span className="font-medium">{t.buyer_name}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{t.amount.toFixed(2)} €</div>
                    {t.buyer_id !== user?.id && (
                      <div className="text-xs text-gray-500">
                        -{t.commission.toFixed(2)} € commission
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    t.status === 'completed' ? 'bg-green-100 text-green-800' :
                    t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t.status === 'completed' ? 'Terminé' :
                     t.status === 'pending' ? 'En attente' : 'Échoué'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(t.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
