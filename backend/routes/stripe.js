const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripeService = require('../services/stripeService');
const { dbGet, dbRun } = require('../db/database');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth requise' });
  try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token invalide' }); }
}

// GET /api/stripe/config — Config publique Stripe
router.get('/config', async (req, res) => {
  try {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      subscriptionPrice: 5, // 5€
      commissionRate: 7, // 7%
      currency: 'eur'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/subscription/create — Créer un abonnement
router.post('/subscription/create', requireAuth, async (req, res) => {
  try {
    const result = await stripeService.createSubscription(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('Erreur création abonnement:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stripe/subscription/status — Statut de l'abonnement
router.get('/subscription/status', requireAuth, async (req, res) => {
  try {
    const status = await stripeService.getSubscriptionStatus(req.user.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/subscription/cancel — Annuler l'abonnement
router.post('/subscription/cancel', requireAuth, async (req, res) => {
  try {
    const result = await stripeService.cancelSubscription(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/payment/create — Créer un paiement pour achat d'œuvre
router.post('/payment/create', requireAuth, async (req, res) => {
  try {
    const { artworkId, sellerId } = req.body;
    
    if (!artworkId || !sellerId) {
      return res.status(400).json({ error: 'artworkId et sellerId requis' });
    }

    const result = await stripeService.createPaymentIntent(
      artworkId,
      req.user.id,
      sellerId
    );
    
    res.json(result);
  } catch (err) {
    console.error('Erreur création paiement:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stripe/payment/methods — Méthodes de paiement sauvegardées
router.get('/payment/methods', requireAuth, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT stripe_customer_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user?.stripe_customer_id) {
      return res.json({ methods: [] });
    }

    const methods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card'
    });

    res.json({ methods: methods.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stripe/transactions — Historique des transactions
router.get('/transactions', requireAuth, async (req, res) => {
  try {
    const { type } = req.query; // 'purchases' ou 'sales'
    
    let sql = `
      SELECT t.*, 
        a.title as artwork_title, a.image_url as artwork_image,
        buyer.name as buyer_name,
        seller.name as seller_name
      FROM transactions t
      JOIN artworks a ON a.id = t.artwork_id
      JOIN users buyer ON buyer.id = t.buyer_id
      JOIN users seller ON seller.id = t.seller_id
      WHERE 1=1
    `;
    
    if (type === 'purchases') {
      sql += ' AND t.buyer_id = ?';
    } else if (type === 'sales') {
      sql += ' AND t.seller_id = ?';
    } else {
      sql += ' AND (t.buyer_id = ? OR t.seller_id = ?)';
    }
    
    sql += ' ORDER BY t.created_at DESC';

    const params = type === 'sales' || type === 'purchases' 
      ? [req.user.id] 
      : [req.user.id, req.user.id];
    
    const transactions = await new Promise((resolve, reject) => {
      const db = require('../db/database').openDb();
      db.all(sql, params, (err, rows) => {
        db.close();
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/webhook — Webhook Stripe (pas besoin d'auth)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/setup-intent — Créer un setup intent pour sauvegarder carte
router.post('/setup-intent', requireAuth, async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id.toString() }
      });
      customerId = customer.id;
      await dbRun('UPDATE users SET stripe_customer_id = ? WHERE id = ?', [customerId, user.id]);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session'
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
