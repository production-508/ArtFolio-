import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

/**
 * CheckoutSuccessPage — Page de confirmation après paiement
 * Style institutionnel épuré
 */
export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Scroll en haut
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>
          
          <h1 
            className="text-3xl text-white/90 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Commande confirmée
          </h1>
          
          <p className="text-white/50 text-sm mb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
            Merci pour votre achat. Un email de confirmation vous a été envoyé avec les détails de votre commande.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="/profile/purchases"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            Voir mes achats
          </a>
          
          <a
            href="/gallery"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-colors text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Continuer la découverte
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/30 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
            Une question ? Contactez-nous à{' '}
            <a href="mailto:support@artfolio.app" className="text-white/50 hover:text-white/70 transition-colors">
              support@artfolio.app
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
