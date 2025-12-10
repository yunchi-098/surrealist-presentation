import React, { useRef } from 'react';
import { Environment, ContactShadows, SpotLight as DreiSpotLight } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { SpotLight, Object3D } from 'three';
import { CameraManager } from './CameraManager';
import { Room } from './World/Room';
import { Desk } from './World/Desk';
import { Paintings } from './World/Paintings';

const MovingLight = () => {
  const lightRef = useRef<SpotLight>(null);
  const { viewport } = useThree();
  const isPortrait = viewport.width < viewport.height;

  // Base intensity increased for mobile
  const baseIntensity = isPortrait ? 80 : 20;

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.elapsedTime;
      // Gently sway the light position
      lightRef.current.position.x = 5 + Math.sin(t * 0.5) * 2;
      lightRef.current.position.z = 5 + Math.cos(t * 0.3) * 1.5;

      // Subtle "breathing" intensity
      lightRef.current.intensity = (baseIntensity - 5) + Math.sin(t * 2) * 5;
    }
  });

  return (
    <spotLight
      ref={lightRef}
      position={[5, 8, 5]}
      angle={0.4}
      penumbra={0.6}
      intensity={baseIntensity}
      color="#ffedd5"
    />
  );
};

export const Experience: React.FC = () => {
  const { viewport } = useThree();
  const isPortrait = viewport.width < viewport.height;

  // Lighting multipliers for mobile readabilitytam
  const envIntensity = isPortrait ? 1.0 : 0.2;
  const ambientIntensity = isPortrait ? 2.0 : 0.4;
  const fillIntensity = isPortrait ? 3.0 : 0.5;
  const mainSpotIntensity = isPortrait ? 200 : 60;

  return (
    <>
      <color attach="background" args={['#050505']} />

      {/* Exponential fog for that deep, infinite room feel */}
      <fog attach="fog" args={['#050505', 4, 16]} />

      <CameraManager />

      {/* Lighting */}
      <Environment preset="city" environmentIntensity={envIntensity} />
      <ambientLight intensity={ambientIntensity} color="#4a4060" /> {/* Very dim cool ambient */}
      <pointLight position={[-3, 4, 4]} intensity={fillIntensity} color="#b85c38" distance={8} /> {/* Warm fill */}

      {/* Main Table Spotlight - High contrast, focused */}
      <spotLight
        position={[0, 6, 2]}
        target-position={[0, 0, 0]}
        angle={0.3}
        penumbra={0.4}
        intensity={mainSpotIntensity}
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

      {/* Ground Shadows - Baked once for performance */}
      <ContactShadows
        frames={1}
        resolution={512}
        scale={20}
        blur={2.5}
        opacity={0.5}
        far={10}
        color="#000000"
      />
    </>
  );
};