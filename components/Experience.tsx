import React, { useRef } from 'react';
import { Environment, ContactShadows, SpotLight as DreiSpotLight } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SpotLight, Object3D } from 'three';
import { CameraManager } from './CameraManager';
import { Room } from './World/Room';
import { Desk } from './World/Desk';
import { Paintings } from './World/Paintings';

const MovingLight = () => {
  const lightRef = useRef<SpotLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.elapsedTime;
      // Gently sway the light position
      lightRef.current.position.x = 5 + Math.sin(t * 0.5) * 2;
      lightRef.current.position.z = 5 + Math.cos(t * 0.3) * 1.5;

      // Subtle "breathing" intensity to make the room feel alive/dreamlike
      lightRef.current.intensity = 15 + Math.sin(t * 2) * 5;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      position={[5, 8, 5]}
      angle={0.4}
      penumbra={0.6}
      intensity={20}
      castShadow
      color="#ffedd5"
      shadow-bias={-0.0001}
      shadow-mapSize={[1024, 1024]}
    />
  );
};

export const Experience: React.FC = () => {
  const deskTarget = useRef<Object3D>(null);

  return (
    <>
      <color attach="background" args={['#050505']} />

      {/* Exponential fog for that deep, infinite room feel */}
      <fog attach="fog" args={['#050505', 4, 16]} />

      <CameraManager />

      {/* Lighting */}
      <Environment preset="city" environmentIntensity={0.2} />
      <ambientLight intensity={0.4} color="#4a4060" /> {/* Very dim cool ambient */}
      <pointLight position={[-3, 4, 4]} intensity={0.5} color="#b85c38" distance={8} /> {/* Warm fill */}

      {/* Main Table Spotlight - High contrast, focused */}
      <spotLight
        position={[0, 6, 2]}
        target-position={[0, 0, 0]}
        angle={0.3}
        penumbra={0.4}
        intensity={60}
        castShadow
        color="#fff5e6"
        shadow-bias={-0.0001}
      />

      <MovingLight />

      {/* World Objects */}
      <group position={[0, -1, 0]}>
        <Room />
        <Paintings />
        <Desk />
      </group>

      {/* Ground Shadows */}
      <ContactShadows
        resolution={1024}
        scale={20}
        blur={2.5}
        opacity={0.5}
        far={10}
        color="#000000"
      />
    </>
  );
};