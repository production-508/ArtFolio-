const express = require('express');
const { dbGet, dbRun, dbAll } = require('../db/database');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'artfolio_secret_key_2024';
const COMMISSION_RATE = 0.07; // 7% commission

// Middleware d'authentification
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// POST /api/orders/create — Créer une commande
router.post('/create', requireAuth, async (req, res) => {
  const { items, shipping_address } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Le panier est vide' });
  }
  
  const db = require('../db/database').openDb();
  
  try {
    // Calculer le total
    let subtotal = 0;
    const artworkDetails = [];
    
    for (const item of items) {
      const artwork = await dbGet(
        'SELECT id, title, price, available, artist_id FROM artworks WHERE id = ?',
        [item.artwork_id]
      );
      
      if (!artwork) {
        return res.status(400).json({ error: `Œuvre ${item.artwork_id} introuvable` });
      }
      
      if (!artwork.available) {
        return res.status(400).json({ error: `Œuvre "${artwork.title}" n'est plus disponible` });
      }
      
      subtotal += artwork.price;
      artworkDetails.push({
        ...artwork,
        price_at_time: item.price || artwork.price
      });
    }
    
    const shippingCost = 15; // Frais fixes
    const commission = subtotal * COMMISSION_RATE;
    const total = subtotal + shippingCost;
    
    // Créer la commande
    const orderResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (user_id, status, total, shipping_cost, commission, shipping_address, created_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          req.user.id,
          'pending',
          total,
          shippingCost,
          commission,
          shipping_address ? JSON.stringify(shipping_address) : null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    const orderId = orderResult.id;
    
    // Créer les items de commande
    for (const artwork of artworkDetails) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO order_items (order_id, artwork_id, price, commission, seller_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            artwork.id,
            artwork.price_at_time,
            artwork.price_at_time * COMMISSION_RATE,
            artwork.artist_id
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    // Créer le PaymentIntent Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // En centimes
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId.toString(),
        user_id: req.user.id.toString(),
        order_type: 'artwork_purchase'
      }
    });
    
    // Enregistrer le paiement
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO payments (order_id, stripe_payment_intent_id, amount, status, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [orderId, paymentIntent.id, total, 'pending'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({
      order: {
        id: orderId,
        status: 'pending',
        total,
        shipping_cost: shippingCost,
        commission
      },
      clientSecret: paymentIntent.client_secret
    });
    
  } catch (err) {
    console.error('Erreur création commande:', err);
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

// POST /api/orders/:id/payment — Confirmer le paiement (appelé après Stripe)
router.post('/:id/payment', requireAuth, async (req, res) => {
  const { payment_intent_id } = req.body;
  
  try {
    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await dbGet(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    
    // Vérifier le statut du paiement Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status === 'succeeded') {
      const db = require('../db/database').openDb();
      
      try {
        // Mettre à jour la commande
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE id = ?",
            [req.params.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        // Mettre à jour le paiement
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE payments SET status = 'succeeded', paid_at = datetime('now') WHERE stripe_payment_intent_id = ?",
            [payment_intent_id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        
        // Marquer les œuvres comme vendues et créer les transactions
        const orderItems = await dbAll(
          'SELECT * FROM order_items WHERE order_id = ?',
          [req.params.id]
        );
        
        for (const item of orderItems) {
          // Marquer l'œuvre comme non disponible
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE artworks SET available = 0 WHERE id = ?',
              [item.artwork_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          
          // Créer la transaction
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO transactions (artwork_id, buyer_id, seller_id, amount, commission, stripe_payment_intent_id, status, created_at, completed_at)
               VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'), datetime('now'))`,
              [item.artwork_id, req.user.id, item.seller_id, item.price, item.commission, payment_intent_id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
        
        res.json({
          success: true,
          order: {
            id: order.id,
            status: 'paid'
          }
        });
        
      } finally {
        db.close();
      }
    } else {
      res.status(400).json({
        error: 'Paiement non complété',
        status: paymentIntent.status
      });
    }
    
  } catch (err) {
    console.error('Erreur confirmation paiement:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — Détails d'une commande
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await dbGet(
      `SELECT o.*, u.name as buyer_name, u.email as buyer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );
    
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    
    // Récupérer les items
    const items = await dbAll(
      `SELECT oi.*, a.title, a.image_url, a.dimensions, a.medium,
        u.name as artist_name
       FROM order_items oi
       JOIN artworks a ON a.id = oi.artwork_id
       JOIN users u ON u.id = oi.seller_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    
    // Récupérer le paiement
    const payment = await dbGet(
      'SELECT * FROM payments WHERE order_id = ?',
      [req.params.id]
    );
    
    res.json({
      order: {
        ...order,
        shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
      },
      items,
      payment
    });
    
  } catch (err) {
    console.error('Erreur récupération commande:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — Liste des commandes de l'utilisateur
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await dbAll(
      `SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
        (SELECT image_url FROM artworks 
         JOIN order_items ON order_items.artwork_id = artworks.id 
         WHERE order_items.order_id = o.id LIMIT 1) as first_image
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ orders });
    
  } catch (err) {
    console.error('Erreur récupération commandes:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/webhook — Webhook Stripe pour les événements de paiement
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature invalide:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      default:
        console.log('Webhook non géré:', event.type);
    }
    
    res.json({ received: true });
    
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

// Gestionnaire: paiement réussi
async function handlePaymentSuccess(paymentIntent) {
  const { order_id } = paymentIntent.metadata;
  
  if (!order_id) {
    console.log('Paiement sans order_id, ignoré');
    return;
  }
  
  const db = require('../db/database').openDb();
  
  try {
    // Vérifier si déjà traité
    const existing = await dbGet(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = ? AND status = ?',
      [paymentIntent.id, 'succeeded']
    );
    
    if (existing) {
      console.log('Paiement déjà traité:', paymentIntent.id);
      return;
    }
    
    // Mettre à jour la commande
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE id = ?",
        [order_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Mettre à jour le paiement
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE payments SET status = 'succeeded', paid_at = datetime('now') WHERE stripe_payment_intent_id = ?",
        [paymentIntent.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Récupérer les items et traiter
    const orderItems = await dbAll(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order_id]
    );
    
    const order = await dbGet(
      'SELECT user_id FROM orders WHERE id = ?',
      [order_id]
    );
    
    for (const item of orderItems) {
      // Marquer l'œuvre comme vendue
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE artworks SET available = 0 WHERE id = ?',
          [item.artwork_id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Créer la transaction si pas existante
      const existingTx = await dbGet(
        'SELECT id FROM transactions WHERE stripe_payment_intent_id = ? AND artwork_id = ?',
        [paymentIntent.id, item.artwork_id]
      );
      
      if (!existingTx) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO transactions (artwork_id, buyer_id, seller_id, amount, commission, stripe_payment_intent_id, status, created_at, completed_at)
             VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'), datetime('now'))`,
            [item.artwork_id, order.user_id, item.seller_id, item.price, item.commission, paymentIntent.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }
    
    console.log('✅ Commande payée:', order_id);
    
  } finally {
    db.close();
  }
}

// Gestionnaire: paiement échoué
async function handlePaymentFailed(paymentIntent) {
  const { order_id } = paymentIntent.metadata;
  
  if (!order_id) return;
  
  const db = require('../db/database').openDb();
  
  try {
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE orders SET status = 'payment_failed' WHERE id = ?",
        [order_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE payments SET status = 'failed' WHERE stripe_payment_intent_id = ?",
        [paymentIntent.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('❌ Paiement échoué pour commande:', order_id);
    
  } finally {
    db.close();
  }
}

module.exports = router;
