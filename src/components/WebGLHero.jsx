import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * WebGL Hero Component - ArtFolio
 * 
 * Features:
 * - Floating particles reacting to mouse movement
 * - Color-changing particles based on featured artist
 * - "ArtFolio" text with liquid distortion on scroll
 * - CSS fallback for mobile (no WebGL)
 * - 60fps performance optimized
 */

// ============================================
// CONFIGURATION
// ============================================

const PARTICLE_COUNT = 200;
const PARTICLE_SIZE = 0.08;

// Artist color palettes
const ARTIST_PALETTES = {
  marie: {
    primary: new THREE.Color('#00ffff'),    // Cyan
    secondary: new THREE.Color('#ff00ff'),  // Magenta
    accent: new THREE.Color('#9d4edd'),     // Purple
  },
  jean: {
    primary: new THREE.Color('#ff6b35'),    // Orange
    secondary: new THREE.Color('#f7c59f'),  // Peach
    accent: new THREE.Color('#2ec4b6'),     // Teal
  },
  sophie: {
    primary: new THREE.Color('#e63946'),    // Red
    secondary: new THREE.Color('#f1faee'),  // Cream
    accent: new THREE.Color('#457b9d'),     // Steel blue
  },
  lucas: {
    primary: new THREE.Color('#7209b7'),    // Deep purple
    secondary: new THREE.Color('#3a0ca3'),  // Indigo
    accent: new THREE.Color('#4cc9f0'),     // Light blue
  },
};

// ============================================
// PARTICLE SYSTEM
// ============================================

function Particles({ artistPalette = 'marie', mousePosition }) {
  const meshRef = useRef();
  const hoverRef = useRef(0);
  const { viewport } = useThree();
  
  const palette = ARTIST_PALETTES[artistPalette] || ARTIST_PALETTES.marie;

  // Generate particle positions and colors
  const { positions, colors, sizes, randoms } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const randoms = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Position in 3D space
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      // Random values for animation
      randoms[i * 3] = Math.random();
      randoms[i * 3 + 1] = Math.random();
      randoms[i * 3 + 2] = Math.random();

      // Initial colors (mixed palette)
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.4) color = palette.primary;
      else if (colorChoice < 0.7) color = palette.secondary;
      else color = palette.accent;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Varied sizes
      sizes[i] = PARTICLE_SIZE * (0.5 + Math.random() * 0.8);
    }

    return { positions, colors, sizes, randoms };
  }, [artistPalette]);

  // Update colors when palette changes
  useEffect(() => {
    if (!meshRef.current) return;
    
    const colorArray = meshRef.current.geometry.attributes.color.array;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const colorChoice = Math.random();
      let color;
      if (colorChoice < 0.4) color = palette.primary;
      else if (colorChoice < 0.7) color = palette.secondary;
      else color = palette.accent;

      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    }
    
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  }, [palette]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const positionAttribute = meshRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array;

    // Smooth hover interpolation
    hoverRef.current += (mousePosition.current.intensity - hoverRef.current) * 0.05;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const randomX = randoms[i3];
      const randomY = randoms[i3 + 1];
      const randomZ = randoms[i3 + 2];

      // Base floating motion
      const floatX = Math.sin(time * 0.5 + randomX * 10) * 0.3;
      const floatY = Math.cos(time * 0.3 + randomY * 10) * 0.2;
      const floatZ = Math.sin(time * 0.4 + randomZ * 10) * 0.15;

      // Mouse interaction - particles are repelled/attraced to mouse
      const mouseInfluence = hoverRef.current;
      const mouseX = mousePosition.current.x * viewport.width * 0.5;
      const mouseY = mousePosition.current.y * viewport.height * 0.5;
      
      const dx = posArray[i3] - mouseX;
      const dy = posArray[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const interactionRadius = 2;
      const interactionStrength = mouseInfluence * 0.5;
      
      if (dist < interactionRadius && dist > 0.01) {
        const force = (1 - dist / interactionRadius) * interactionStrength;
        posArray[i3] += (dx / dist) * force * 0.02;
        posArray[i3 + 1] += (dy / dist) * force * 0.02;
      }

      // Apply floating motion
      posArray[i3] = posArray[i3] * 0.99 + floatX * 0.01;
      posArray[i3 + 1] = posArray[i3 + 1] * 0.99 + floatY * 0.01;
      posArray[i3 + 2] = posArray[i3 + 2] * 0.99 + floatZ * 0.01;

      // Keep particles within bounds
      const boundX = 6;
      const boundY = 4;
      const boundZ = 3;
      
      if (Math.abs(posArray[i3]) > boundX) posArray[i3] *= 0.95;
      if (Math.abs(posArray[i3 + 1]) > boundY) posArray[i3 + 1] *= 0.95;
      if (Math.abs(posArray[i3 + 2]) > boundZ) posArray[i3 + 2] *= 0.95;
    }

    positionAttribute.needsUpdate = true;
    
    // Subtle rotation of entire system
    meshRef.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={PARTICLE_SIZE}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ============================================
// LIQUID TEXT EFFECT
// ============================================

function LiquidText({ scrollProgress }) {
  const textRef = useRef();
  const materialRef = useRef();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor1: { value: new THREE.Color('#00ffff') },
    uColor2: { value: new THREE.Color('#ff00ff') },
    uColor3: { value: new THREE.Color('#9d4edd') },
  }), []);

  const vertexShader = `
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uMouse;
    
    varying vec2 vUv;
    varying float vDistortion;
    
    void main() {
      vUv = uv;
      
      vec3 pos = position;
      
      // Liquid distortion based on scroll
      float distortion = sin(pos.x * 3.0 + uTime * 2.0) * 0.1;
      distortion += sin(pos.y * 4.0 - uTime * 1.5) * 0.08;
      distortion *= uScroll * 0.5;
      
      // Mouse influence
      float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
      float mouseEffect = smoothstep(0.5, 0.0, mouseDist) * 0.3;
      distortion += mouseEffect * sin(uTime * 3.0);
      
      pos.z += distortion;
      vDistortion = distortion;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    
    varying vec2 vUv;
    varying float vDistortion;
    
    void main() {
      // Gradient based on UV and distortion
      float t = vUv.x + sin(uTime * 0.5) * 0.2;
      t += vDistortion * 2.0;
      
      vec3 color = mix(uColor1, uColor2, smoothstep(0.0, 0.5, t));
      color = mix(color, uColor3, smoothstep(0.5, 1.0, t));
      
      // Add glow
      float glow = 1.0 + vDistortion * 3.0;
      color *= glow;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = scrollProgress.current;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Back glow */}
      <mesh position={[0, 0, -0.1]} scale={[4.5, 1.5, 1]}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Main text with liquid shader */}
      <Text
        ref={textRef}
        fontSize={1.2}
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff2"
        letterSpacing={-0.05}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
      >
        ArtFolio
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
        />
      </Text>
      
      {/* Subtitle */}
      <Text
        fontSize={0.18}
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTcviYwY.woff2"
        letterSpacing={0.1}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.9, 0]}
        color="rgba(255,255,255,0.6)"
      >
        DECOUVREZ L'ART NUMERIQUE
      </Text>
    </group>
  );
}

// ============================================
// AMBIENT FLOATING SHAPES
// ============================================

function FloatingShapes() {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Floating ring */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-3, 1.5, -2]}>
          <torusGeometry args={[0.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
        </mesh>
      </Float>
      
      {/* Floating sphere */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.7}>
        <mesh position={[3.5, -1, -1]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
        </mesh>
      </Float>
      
      {/* Floating cube */}
      <Float speed={2.5} rotationIntensity={1} floatIntensity={0.4}>
        <mesh position={[-2.5, -2, -3]} rotation={[0.5, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#9d4edd" transparent opacity={0.3} wireframe />
        </mesh>
      </Float>
      
      {/* Floating octahedron */}
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.6}>
        <mesh position={[2.5, 2, -2.5]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.25} />
        </mesh>
      </Float>
    </group>
  );
}

// ============================================
// SCENE COMPOSITION
// ============================================

function Scene({ artistPalette, mousePosition, scrollProgress }) {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />
      
      {/* Particles */}
      <Particles artistPalette={artistPalette} mousePosition={mousePosition} />
      
      {/* Floating shapes */}
      <FloatingShapes />
      
      {/* Main text */}
      <LiquidText scrollProgress={scrollProgress} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#030303', 5, 15]} />
    </>
  );
}

// ============================================
// CSS FALLBACK COMPONENT
// ============================================

function CSSFallbackHero({ artistName, artworkTitle }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030303] via-[#0a0a1a] to-[#030303]">
        {/* Floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'float 8s ease-in-out infinite 1s'
          }}
        />
        <div 
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #9d4edd 0%, transparent 70%)',
            filter: 'blur(35px)',
            animation: 'float 7s ease-in-out infinite 0.5s'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Glow behind text */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] opacity-30"
          style={{
            background: 'linear-gradient(90deg, #00ffff, #ff00ff, #9d4edd)',
            filter: 'blur(60px)',
            borderRadius: '50%'
          }}
        />
        
        {/* Main title */}
        <h1 
          className="relative text-6xl md:text-8xl font-bold mb-4"
          style={{
            background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #9d4edd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(0,255,255,0.3)'
          }}
        >
          ArtFolio
        </h1>
        
        {/* Subtitle */}
        <p className="text-white/60 text-sm md:text-base tracking-[0.3em] uppercase">
          Decouvrez l'art numerique
        </p>
        
        {/* Featured artist info */}
        {artistName && (
          <div className="mt-8 glass-panel inline-block px-6 py-3 rounded-full">
            <p className="text-white/80 text-sm">
              <span className="text-cyan-400">En vedette:</span> {artistName}
            </p>
            {artworkTitle && (
              <p className="text-white/50 text-xs mt-1">"{artworkTitle}"</p>
            )}
          </div>
        )}
      </div>
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function WebGLHero({ 
  artistPalette = 'marie',
  artistName = 'Marie Dubois',
  artworkTitle = 'Ether Flottant',
  className = ''
}) {
  const containerRef = useRef();
  const mousePosition = useRef({ x: 0, y: 0, intensity: 0 });
  const scrollProgress = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Detect mobile and WebGL support
  useEffect(() => {
    const checkSupport = () => {
      // Check mobile
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
      setIsMobile(mobile);

      // Check WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setIsWebGLSupported(!!gl);
      } catch {
        setIsWebGLSupported(false);
      }
    };

    checkSupport();
    window.addEventListener('resize', checkSupport);
    return () => window.removeEventListener('resize', checkSupport);
  }, []);

  // Mouse tracking
  useEffect(() => {
    if (isMobile) return;

    let rafId;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Calculate intensity based on movement speed
        const dx = x - lastX;
        const dy = y - lastY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        mousePosition.current = {
          x,
          y,
          intensity: Math.min(speed * 10, 1)
        };
        
        lastX = x;
        lastY = y;
      });
    };

    const handleMouseLeave = () => {
      mousePosition.current.intensity = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  // Scroll tracking for liquid effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.5;
      scrollProgress.current = Math.min(scrollY / maxScroll, 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show CSS fallback on mobile or no WebGL
  const showFallback = isMobile || !isWebGLSupported;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen bg-[#030303] overflow-hidden ${className}`}
    >
      {/* WebGL Canvas */}
      {!showFallback && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          dpr={[1, 2]} // Responsive pixel ratio
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          style={{ background: '#030303' }}
        >
          <Scene 
            artistPalette={artistPalette}
            mousePosition={mousePosition}
            scrollProgress={scrollProgress}
          />
        </Canvas>
      )}

      {/* CSS Fallback */}
      {showFallback && (
        <CSSFallbackHero 
          artistName={artistName}
          artworkTitle={artworkTitle}
        />
      )}

      {/* Glassmorphism overlay elements */}
      <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-80">
        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-cyan-400 text-xs font-medium tracking-wider uppercase mb-2">
            Artiste en vedette
          </p>
          <h3 className="text-white font-semibold text-lg mb-1">{artistName}</h3>
          <p className="text-white/50 text-sm mb-4">"{artworkTitle}"</p>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
              Voir l'oeuvre
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-cyan-500 to-transparent" />
      </div>
    </div>
  );
}

export default WebGLHero;
