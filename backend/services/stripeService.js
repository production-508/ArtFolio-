const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { dbGet, dbRun } = require('../db/database');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.commissionRate = 0.07; // 7% commission
    this.subscriptionPrice = 500; // 5€ en centimes
  }

  // Créer un client Stripe
  async createCustomer(userId, email, name) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId: userId.toString() }
      });

      await dbRun(
        'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
        [customer.id, userId]
      );

      return customer;
    } catch (error) {
      console.error('Erreur création client Stripe:', error);
      throw error;
    }
  }

  // Créer un abonnement à 5€/mois
  async createSubscription(userId) {
    try {
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) throw new Error('Utilisateur non trouvé');

      // Créer le client si pas existant
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await this.createCustomer(userId, user.email, user.name);
        customerId = customer.id;
      }

      // Créer le prix de l'abonnement (ou le récupérer)
      const price = await this.getOrCreateSubscriptionPrice();

      // Créer l'abonnement
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await dbRun(
        `UPDATE users SET 
          stripe_subscription_id = ?,
          subscription_status = 'incomplete',
          subscription_price_id = ?
         WHERE id = ?`,
        [subscription.id, price.id, userId]
      );

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      console.error('Erreur création abonnement:', error);
      throw error;
    }
  }

  // Créer ou récupérer le prix de l'abonnement
  async getOrCreateSubscriptionPrice() {
    try {
      // Chercher un prix existant
      const prices = await this.stripe.prices.list({
        lookup_keys: ['artfolio_pro_monthly'],
        limit: 1
      });

      if (prices.data.length > 0) {
        return prices.data[0];
      }

      // Créer le produit
      const product = await this.stripe.products.create({
        name: 'ArtFolio Pro',
        description: 'Abonnement mensuel ArtFolio - 5€/mois',
        metadata: { plan: 'pro' }
      });

      // Créer le prix
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: this.subscriptionPrice,
        currency: 'eur',
        recurring: { interval: 'month' },
        lookup_key: 'artfolio_pro_monthly'
      });

      return price;
    } catch (error) {
      console.error('Erreur création prix:', error);
      throw error;
    }
  }

  // Créer une intention de paiement pour achat d'œuvre
  async createPaymentIntent(artworkId, buyerId, sellerId) {
    try {
      const artwork = await dbGet('SELECT * FROM artworks WHERE id = ?', [artworkId]);
      if (!artwork) throw new Error('Œuvre non trouvée');
      if (!artwork.available) throw new Error('Œuvre non disponible');

      const buyer = await dbGet('SELECT * FROM users WHERE id = ?', [buyerId]);
      const seller = await dbGet('SELECT * FROM users WHERE id = ?', [sellerId]);

      if (!buyer || !seller) throw new Error('Acheteur ou vendeur non trouvé');

      const amount = Math.round(artwork.price * 100); // Convertir en centimes
      const commission = Math.round(amount * this.commissionRate);
      const sellerAmount = amount - commission;

      // Créer le payment intent avec application_fee pour la commission
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'eur',
        automatic_payment_methods: { enabled: true },
        metadata: {
          artworkId: artworkId.toString(),
          buyerId: buyerId.toString(),
          sellerId: sellerId.toString(),
          commission: commission.toString(),
          sellerAmount: sellerAmount.toString()
        },
        application_fee_amount: commission,
        transfer_data: {
          destination: seller.stripe_account_id || undefined // Si le vendeur a un compte connecté
        }
      });

      // Enregistrer la transaction en attente
      await dbRun(
        `INSERT INTO transactions (
          artwork_id, buyer_id, seller_id, amount, commission, 
          stripe_payment_intent_id, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [artworkId, buyerId, sellerId, amount / 100, commission / 100, paymentIntent.id, 'pending']
      );

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount / 100,
        commission: commission / 100,
        sellerAmount: sellerAmount / 100
      };
    } catch (error) {
      console.error('Erreur création paiement:', error);
      throw error;
    }
  }

  // Gérer les webhooks Stripe
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleSubscriptionPaymentFailed(event.data.object);
          break;
        
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;

        default:
          console.log('Webhook non géré:', event.type);
      }
    } catch (error) {
      console.error('Erreur webhook:', error);
      throw error;
    }
  }

  // Abonnement payé avec succès
  async handleSubscriptionPaymentSucceeded(invoice) {
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    await dbRun(
      `UPDATE users SET 
        subscription_status = 'active',
        subscription_current_period_start = ?,
        subscription_current_period_end = ?
       WHERE stripe_subscription_id = ?`,
      [
        new Date(invoice.period_start * 1000).toISOString(),
        new Date(invoice.period_end * 1000).toISOString(),
        subscriptionId
      ]
    );

    console.log('✅ Abonnement activé:', subscriptionId);
  }

  // Échec paiement abonnement
  async handleSubscriptionPaymentFailed(invoice) {
    const subscriptionId = invoice.subscription;

    await dbRun(
      "UPDATE users SET subscription_status = 'past_due' WHERE stripe_subscription_id = ?",
      [subscriptionId]
    );

    console.log('⚠️ Paiement abonnement échoué:', subscriptionId);
  }

  // Paiement œuvre réussi
  async handlePaymentSuccess(paymentIntent) {
    const { artworkId, buyerId, sellerId } = paymentIntent.metadata;

    // Mettre à jour la transaction
    await dbRun(
      "UPDATE transactions SET status = 'completed', completed_at = datetime('now') WHERE stripe_payment_intent_id = ?",
      [paymentIntent.id]
    );

    // Marquer l'œuvre comme vendue
    await dbRun(
      'UPDATE artworks SET available = 0 WHERE id = ?',
      [artworkId]
    );

    console.log('✅ Paiement œuvre réussi:', paymentIntent.id);
  }

  // Paiement échoué
  async handlePaymentFailed(paymentIntent) {
    await dbRun(
      "UPDATE transactions SET status = 'failed' WHERE stripe_payment_intent_id = ?",
      [paymentIntent.id]
    );

    console.log('❌ Paiement échoué:', paymentIntent.id);
  }

  // Annulation abonnement
  async handleSubscriptionCanceled(subscription) {
    await dbRun(
      "UPDATE users SET subscription_status = 'canceled' WHERE stripe_subscription_id = ?",
      [subscription.id]
    );

    console.log('🚫 Abonnement annulé:', subscription.id);
  }

  // Annuler un abonnement
  async cancelSubscription(userId) {
    try {
      const user = await dbGet(
        'SELECT stripe_subscription_id FROM users WHERE id = ?',
        [userId]
      );

      if (!user?.stripe_subscription_id) {
        throw new Error('Aucun abonnement actif');
      }

      await this.stripe.subscriptions.cancel(user.stripe_subscription_id);

      return { canceled: true };
    } catch (error) {
      console.error('Erreur annulation abonnement:', error);
      throw error;
    }
  }

  // Obtenir le statut de l'abonnement
  async getSubscriptionStatus(userId) {
    try {
      const user = await dbGet(
        'SELECT stripe_subscription_id, subscription_status, subscription_current_period_end FROM users WHERE id = ?',
        [userId]
      );

      if (!user?.stripe_subscription_id) {
        return { status: 'none', active: false };
      }

      // Vérifier auprès de Stripe
      const subscription = await this.stripe.subscriptions.retrieve(
        user.stripe_subscription_id
      );

      return {
        status: subscription.status,
        active: subscription.status === 'active',
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Erreur récupération statut:', error);
      return { status: 'error', active: false };
    }
  }
}

module.exports = new StripeService();
