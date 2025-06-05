// Define namespaces for the libraries we're using
const { React, useRef, useState, useEffect } = window;
const { motion, useScroll, useTransform } = window.framerMotion;
const { Canvas, useFrame, useThree } = window.ReactThreeFiber;
const { OrbitControls, Environment, PerspectiveCamera } = window.ReactThreeDrei;
const THREE = window.THREE;

// Enhanced Dumbbell component with better materials and animations
const Dumbbell = ({ position, scrollProgress, side }) => {
  const meshRef = useRef();
  const leftWeightRef = useRef();
  const rightWeightRef = useRef();
  const barRef = useRef();
  
  // Calculate the target position based on scroll progress
  const targetX = side === 'left' ? -8 * scrollProgress : 8 * scrollProgress;
  const rotationFactor = scrollProgress * Math.PI * 0.5;
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Smoothly animate to the target position with easing
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x, 
        targetX, 
        0.1
      );
      
      // Add rotation effect with easing
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        rotationFactor,
        0.1
      );
      
      // Add subtle bounce effect to weights
      if (leftWeightRef.current && rightWeightRef.current) {
        const bounce = Math.sin(clock.getElapsedTime() * 2) * 0.05 * scrollProgress;
        leftWeightRef.current.position.y = bounce;
        rightWeightRef.current.position.y = bounce;
      }
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Bar */}
      <mesh ref={barRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 2.5, 32]} />
        <meshStandardMaterial 
          color="#777777" 
          metalness={0.8} 
          roughness={0.3}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Left weight */}
      <mesh ref={leftWeightRef} position={[-1.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
        <meshStandardMaterial 
          color="#ff5e14" 
          metalness={0.7} 
          roughness={0.3}
          emissive="#ff5e14"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Right weight */}
      <mesh ref={rightWeightRef} position={[1.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 32]} />
        <meshStandardMaterial 
          color="#ff5e14" 
          metalness={0.7} 
          roughness={0.3}
          emissive="#ff5e14"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
};

// Scene component that contains all 3D elements
const Scene = ({ scrollProgress }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.5} color="#ffffff" />
      
      {/* Directional light for shadows */}
      <directionalLight
        position={[5, 10, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Additional fill light */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={0.5}
        color="#ff9955"
      />
      
      {/* Left dumbbell */}
      <Dumbbell 
        position={[-2, 0, 0]} 
        scrollProgress={scrollProgress}
        side="left"
      />
      
      {/* Right dumbbell */}
      <Dumbbell 
        position={[2, 0, 0]} 
        scrollProgress={scrollProgress}
        side="right"
      />
      
      {/* Floor/ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Environment for reflections */}
      <Environment preset="city" />
    </>
  );
};

// Main App component
const App = () => {
  const containerRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Calculate scroll progress (0 to 1) based on scroll position
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      setScrollY(scrollPercentage);
    }
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container" ref={containerRef}>
      {/* Intro section */}
      <section className="intro-section">
        <h1>IRON-FORGE</h1>
        <p>Scroll down to witness the power of transformation</p>
        
        <div className="scroll-indicator">
          <span>Scroll to animate</span>
          <div className="arrow"></div>
        </div>
      </section>
      
      {/* Canvas container for 3D animation */}
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
          <Scene scrollProgress={scrollY} />
        </Canvas>
      </div>
      
      {/* Content section below the animation */}
      <section className="content-section">
        <h2>Build Your Strength</h2>
        <p>
          At IRON-FORGE, we believe in the power of transformation. Just as these dumbbells move apart to reveal new possibilities, 
          your fitness journey opens up new pathways for growth and strength.
        </p>
        <p>
          Our state-of-the-art facility is designed to help you forge your perfect physique, 
          with expert trainers guiding you every step of the way.
        </p>
        
        <div className="stats-container">
          <div className="stat-card">
            <h3>50+</h3>
            <p>Professional Trainers</p>
          </div>
          <div className="stat-card">
            <h3>100+</h3>
            <p>Workout Stations</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Open Access</p>
          </div>
        </div>
        
        <p>
          From beginners to advanced athletes, we have the equipment, community, and expertise 
          to help you achieve your fitness goals.
        </p>
        
        <a href="#contact" className="cta-button">Join Now</a>
      </section>
      
      <footer>
        <p>© 2023 IRON-FORGE. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));