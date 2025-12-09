
import React from 'react';
import { Image, Text } from '@react-three/drei';

const FONT_URL = 'https://fonts.cdnfonts.com/s/8399/BLKCHCRY.woff';
const BLACKMOON_FONT_URL = 'https://fonts.cdnfonts.com/s/41758/Blackmoon%20Quest.woff';

const PaintingFrame: React.FC<{
  position: [number, number, number];
  url: string;
  scale?: number;
  title?: string;
}> = ({ position, url, scale = 1, title }) => (
  <group position={position}>
    {/* Frame */}
    <mesh position={[0, 0, -0.05]}>
      <boxGeometry args={[scale * 1.1, scale * 1.4, 0.1]} />
      <meshStandardMaterial color="#2a1f16" metalness={0.4} roughness={0.6} />
    </mesh>
    {/* Canvas - Offset by 0.01 to prevent z-fighting with frame backing */}
    <group position={[0, 0, 0.01]}>
      <Image
        url={url}
        scale={[scale, scale * 1.3]}
        color="#555555"
      />
    </group>
    {title && (
      <Text
        position={[0, -scale * 0.8, 0.02]}
        fontSize={0.15}
        color="#8a7356"
        font={BLACKMOON_FONT_URL}
      >
        {title}
      </Text>
    )}
  </group>
);

export const Paintings: React.FC = () => {
  return (
    // Moved to -3.6 to create a small gap from the wall (which is at -3.75)
    <group position={[0, 2.5, -3.6]} name="WallPaintings">
      <PaintingFrame position={[0, 0, 0]} url="/magritte.jpg" scale={2} title="The Son of Man" />
      <PaintingFrame position={[-2.5, 0.5, 0]} url="/ernst.jpg" scale={1.5} title="Europe After the Rain" />
      <PaintingFrame position={[2.0, -0.2, 0]} url="/carrington.jpg" scale={1.2} title="Self-Portrait" />
      <PaintingFrame position={[3.8, 1.2, 0]} url="/miro.jpg" scale={1.4} title="Harlequin's Carnival" />
    </group>
  );
};
