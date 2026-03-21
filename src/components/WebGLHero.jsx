import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * WebGL Hero Immersif - Particules réactives
 * Fallback CSS sur mobile
 */
export function WebGLHero({ artistPalette = ['#06b6d4', '#a855f7', '#ec4899'] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  if (isMobile) {
    return <CSSFallbackHero palette={artistPalette} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030303]">
      {/* Canvas WebGL */}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <ParticleField palette={artistPalette} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
      </Canvas>

      {/* Overlay Content */}
      <HeroContent />
    </div>
  );
}

/**
 * Champ de particules WebGL
 */
function ParticleField({ palette }) {
  const mesh = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const count = 200;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return [positions, colors];
  }, [palette]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Mouvement organique
      positions[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.02;
      
      // Réaction à la souris
      const dx = mouse.current.x * viewport.width * 0.5 - positions[i3];
      const dy = mouse.current.y * viewport.height * 0.5 - positions[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 15) {
        positions[i3] -= dx * 0.02;
        positions[i3 + 1] -= dy * 0.02;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Contenu textuel du Hero
 */
function HeroContent() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pointer-events-auto"
      >
        <span className="glass-panel px-4 py-2 rounded-full text-sm text-white/80 mb-6 inline-block">
          ✨ Profils générés par IA
        </span>
      </motion.div>

      {/* Titre */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-6 pointer-events-auto"
      >
        <span className="text-white">Art</span>
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Folio
        </span>
      </motion.h1>

      {/* Sous-titre */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-lg md:text-xl text-white/60 text-center max-w-2xl px-4 pointer-events-auto"
      >
        Votre galerie d'art auto-générée par intelligence artificielle.
        <br />
        Analyse, prix, SEO — tout est automatique.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-8 flex gap-4 pointer-events-auto"
      >
        <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
          Créer mon profil
        </button>
        <button className="px-8 py-4 rounded-xl glass-panel text-white font-semibold hover:bg-white/10 transition-all">
          Explorer
        </button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Fallback CSS pour mobile (pas de WebGL)
 */
function CSSFallbackHero({ palette }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030303]">
      {/* Particules CSS */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: palette[i % palette.length],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Orbes flottantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <HeroContent />
    </div>
  );
}
