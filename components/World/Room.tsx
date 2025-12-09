import React from 'react';

export const Room: React.FC = () => {
  // In a real app, useGLTF would be here. We are block-meshing for this code solution.
  return (
    <group name="RoomGeometry">
      {/* Floor - Extended slightly to ensure coverage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 30]} />
        <meshStandardMaterial color="#3d342b" roughness={0.8} />
      </mesh>

      {/* Back Wall (The Painting Wall - Behind Desk) */}
      <mesh position={[0, 5, -4]} receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="#5e5448" />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-6, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#5e5448" />
      </mesh>
      <mesh position={[6, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#5e5448" />
      </mesh>
    </group>
  );
};