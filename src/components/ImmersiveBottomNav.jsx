import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Sparkles, User, ShoppingBag } from 'lucide-react';

/**
 * Bottom Navigation immersive inspirée de Blue Cinis
 * Se cache au scroll down, réapparaît au scroll up
 */
export function ImmersiveBottomNav({ cartCount = 0 }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - prevScroll;
    // Hide on scroll down (>10px), Show on scroll up (<-5px)
    if (diff > 10 && !hidden && latest > 100) {
      setHidden(true);
    } else if (diff < -5 && hidden) {
      setHidden(false);
    }
    setPrevScroll(latest);
  });

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/', icon: Home, label: 'Galerie' },
    { to: '/search', icon: Search, label: 'Recherche' },
    { to: '/analyze', icon: Sparkles, label: 'Analyser', highlight: true },
    { to: '/dashboard', icon: ShoppingBag, label: 'Panier', badge: cartCount },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <AnimatePresence>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "200%", opacity: 0 },
        }}
        initial="visible"
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-4 right-4 z-50 md:hidden"
      >
        <div className="
          flex items-center justify-around
          h-16 px-2
          rounded-2xl
          backdrop-blur-xl
          bg-black/40
          border border-white/10
          shadow-lg shadow-black/20
        ">
          {navItems.map((item) => (
            <NavItem 
              key={item.to}
              {...item}
              isActive={isActive(item.to)}
            />
          ))}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}

function NavItem({ to, icon: Icon, label, isActive, highlight, badge }) {
  if (highlight) {
    return (
      <Link
        to={to}
        className="relative -mt-6 flex flex-col items-center"
      >
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center
          ${isActive 
            ? 'bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/30' 
            : 'bg-gradient-to-br from-cyan-500/80 to-purple-500/80'
          }
        `}>
          <Icon size={24} className="text-white" strokeWidth={1.5} />
        </div>
        <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-cyan-400' : 'text-white/50'}`}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`relative p-2 flex flex-col items-center gap-0.5 transition hover:scale-110 ${
        isActive ? 'text-cyan-400' : 'text-white/70'
      }`}
    >
      <div className="relative">
        <Icon size={22} strokeWidth={1.5} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export default ImmersiveBottomNav;
