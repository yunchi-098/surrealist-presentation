
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Vector3, AdditiveBlending, DoubleSide, NormalBlending } from 'three';
import { useCursor, useGLTF, Text, Image, Billboard, Clone, Outlines } from '@react-three/drei';
import { useStore } from '../../context/StoreContext';
import { ViewMode } from '../../types';
import { InteractiveBook } from './InteractiveBook';
import { useFrame } from '@react-three/fiber';

// --- Constants ---
// Black Chancery Font
const FONT_URL = 'https://fonts.cdnfonts.com/s/8399/BLKCHCRY.woff';
// Blackmoon Quest Font
const BLACKMOON_FONT_URL = 'https://fonts.cdnfonts.com/s/41758/Blackmoon%20Quest.woff';

// --- Types & Helper Components ---

const InteractableItem: React.FC<{
  position: [number, number, number];
  name: string;
  color: string;
  geometryType: 'box' | 'cylinder' | 'complex';
  scale?: [number, number, number];
  focusOffset?: [number, number, number];
}> = ({ position, name, color, geometryType, scale = [1, 1, 1], focusOffset = [0, 1, 2] }) => {
  const { viewMode, setViewMode, setFocusTarget, setFocusedItemName } = useStore();
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && viewMode === ViewMode.DESK);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (viewMode === ViewMode.DESK) {
      const objPos = new Vector3(...position);
      // Adjust target position by adding parent group offset (1.48) for correct camera focus
      // Since these are local positions, we need to approximate the world pos
      const worldPos = objPos.clone().add(new Vector3(0, 1.48, 0));

      setFocusTarget({
        position: worldPos,
        offset: new Vector3(...focusOffset),
        target: worldPos,
      });
      setFocusedItemName(name);
      setViewMode(ViewMode.FOCUS);
    }
  };

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow scale={scale}>
        {geometryType === 'box' && <boxGeometry args={[0.5, 0.5, 0.5]} />}
        {geometryType === 'cylinder' && <cylinderGeometry args={[0.3, 0.3, 0.5, 32]} />}
        {geometryType === 'complex' && <dodecahedronGeometry args={[0.3]} />}
        <meshStandardMaterial
          color={hovered && viewMode === ViewMode.DESK ? '#ffecd1' : color}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

// --- Custom Components ---

const CAMERA_PHOTOS = [
  { url: "/hologram_star.jpg", title: "", width: 0.45, height: 0.65 },
  { url: "/hologram_bulb.jpg", title: "", width: 0.45, height: 0.65 },
  { url: "/hologram_web.jpg", title: "", width: 0.45, height: 0.65 },
];

const FILM_PHOTOS = [
  { url: "/stalker.jpg", title: "", width: 0.45, height: 0.65 },
  { url: "/holy_motors.jpg", title: "", width: 0.45, height: 0.65 },
  { url: "/eraserhead.jpg", title: "", width: 0.45, height: 0.65 },
];

const GRAMOPHONE_PHOTOS = [
  { url: "/gaye_su_akyol.jpg", title: "", width: 0.5, height: 0.5 },
  { url: "/sgt_peppers.jpg", title: "", width: 0.5, height: 0.5 },
  { url: "/pink_floyd_wall.jpg", title: "", width: 0.5, height: 0.5 },
];

interface HologramGalleryProps {
  photos: { url: string; title: string }[];
  position?: [number, number, number];
  scale?: number;
}

const HologramGallery: React.FC<HologramGalleryProps> = ({ photos, position = [0, 0, 0], scale = 1 }) => {
  const [index, setIndex] = useState(0);

  const nextPhoto = (e: any) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: any) => {
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[index] as any;
  const width = currentPhoto.width || 0.6;
  const height = currentPhoto.height || 0.45;

  return (
    // Positioned relative to the parent item
    <group position={position} scale={scale}>
      {/* Billboard ensures photos always face the camera */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Floating Photo Plane - More compact scale as requested */}
        <group position={[0, 0.3, 0]}>
          <Image
            url={currentPhoto.url}
            scale={[width, height]}
            transparent
            opacity={0.95}
          />
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[width + 0.02, height + 0.02]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        </group>

        {/* Title Text */}
        <Text
          position={[0, 0.0, 0.01]}
          fontSize={0.08}
          color="#e0f7fa"
          anchorX="center"
          anchorY="middle"
          font={BLACKMOON_FONT_URL}
        >
          {currentPhoto.title.toLowerCase()}
        </Text>

        {/* Navigation Arrows */}
        <group position={[0, 0.0, 0]}>
          <Text
            position={[0.4, 0, 0]}
            fontSize={0.1}
            color="#ffffff"
            onClick={nextPhoto}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
            font={FONT_URL}
          >
            {">"}
          </Text>
          <Text
            position={[-0.4, 0, 0]}
            fontSize={0.1}
            color="#ffffff"
            onClick={prevPhoto}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
            font={FONT_URL}
          >
            {"<"}
          </Text>
        </group>
      </Billboard>
    </group>
  );
};

const CameraModel = () => {
  const { scene } = useGLTF('https://yunchi-098.github.io/3d-assets/cam.glb');
  const { viewMode, setViewMode, setFocusTarget, setFocusedItemName, focusedItemName } = useStore();
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && viewMode === ViewMode.DESK);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.5;
          child.material.metalness = 0.5;
        }
      }
    });
  }, [scene]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (viewMode === ViewMode.DESK) {
      // Local pos: [-1.45, 0.35, 0.2], Parent Group Y: 1.48
      const worldPos = new Vector3(-1.45, 1.83, 0.2);

      setFocusTarget({
        position: worldPos,
        // Low angle view: Offset Y -0.35 puts view at desk level
        offset: new Vector3(0, -0.35, 6.0),
        target: worldPos.clone().add(new Vector3(0, 0.6, 0)), // Look up at the hologram
      });
      setFocusedItemName("Vintage Camera");
      setViewMode(ViewMode.FOCUS);
    }
  };

  const isFocused = viewMode === ViewMode.FOCUS && focusedItemName === "Vintage Camera";

  return (
    <group
      position={[-1.25, 0.2, 0.5]}
      rotation={[0, 1.5, 0]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Clone
        object={scene}
        scale={1.5}
        inject={<Outlines thickness={0.02} color="#fffcf0" />}
      />

      {/* Show Gallery when focused */}
      {isFocused && <HologramGallery photos={CAMERA_PHOTOS} position={[0, 0.35, 0]} />}
    </group>
  );
};

const FilmReelsModel = () => {
  const { scene } = useGLTF('https://yunchi-098.github.io/3d-assets/film_reel.glb');
  const { viewMode, setViewMode, setFocusTarget, setFocusedItemName, focusedItemName } = useStore();
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && viewMode === ViewMode.DESK);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.4;
          child.material.metalness = 0.6;
        }
      }
    });
  }, [scene]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (viewMode === ViewMode.DESK) {
      // Local pos: [-1.1, 0.05, -0.3], Parent Group Y: 1.48
      const worldPos = new Vector3(-1.1, 1.48, 0.1);

      setFocusTarget({
        position: worldPos,
        // Shift camera slightly right to see the hologram on the right
        offset: new Vector3(0.5, 0.5, 5.0),
        // Look up and right at the hologram
        target: worldPos.clone().add(new Vector3(0.2, 0.4, 0)),
      });
      setFocusedItemName("Film Rolls");
      setViewMode(ViewMode.FOCUS);
    }
  };

  const isFocused = viewMode === ViewMode.FOCUS && focusedItemName === "Film Rolls";

  return (
    <group
      position={[-0.9, 0.05, -0.3]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* First Reel */}
      <Clone
        object={scene}
        scale={0.5}
        position={[0, 0, 0.1]}
        rotation={[Math.PI / 2, 0, 0.8]}
        inject={<Outlines thickness={0.05} color="#fffcf0" />}
      />
      {/* Second Reel - Stacked with different rotation */}
      <Clone
        object={scene}
        scale={0.5}
        position={[0, 0.1, 0]}
        rotation={[Math.PI / 2, 0, 3.5]}
        inject={<Outlines thickness={0.05} color="#fffcf0" />}
      />

      {/* Top Right Corner Hologram */}
      {isFocused && (
        <HologramGallery
          photos={FILM_PHOTOS}
          position={[0, 0.5, 0]} // Top Right
          scale={0.8}
        />
      )}
    </group>
  );
}

const GramophoneModel = () => {
  const { scene } = useGLTF('https://yunchi-098.github.io/3d-assets/gram.glb?v=4');
  const { viewMode, setViewMode, setFocusTarget, setFocusedItemName, focusedItemName } = useStore();
  const [hovered, setHovered] = useState(false);

  useCursor(hovered && viewMode === ViewMode.DESK);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.5;
          child.material.metalness = 0.5;
        }
      }
    });
  }, [scene]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (viewMode === ViewMode.DESK) {
      // Local pos: [1.1, 0, -0.2], Parent Group Y: 1.48
      const worldPos = new Vector3(1.1, 1.48, -0.2);

      setFocusTarget({
        position: worldPos,
        // Look frontal/up to see the top-right hologram clearly
        offset: new Vector3(0, 0, 5.0),
        target: worldPos.clone().add(new Vector3(0.15, 0.7, 0)),
      });
      setFocusedItemName("Gramophone");
      setViewMode(ViewMode.FOCUS);
    }
  };

  const isFocused = viewMode === ViewMode.FOCUS && focusedItemName === "Gramophone";

  return (
    <group
      position={[1.1, 0, -0.2]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={scene} scale={0.3} />

      {/* Hologram on the TOP RIGHT side of the Gramophone */}
      {isFocused && (
        <HologramGallery
          photos={GRAMOPHONE_PHOTOS}
          position={[0.3, 0.7, 0]}
          scale={0.8}
        />
      )}
    </group>
  );
};

// --- Desk Implementations ---

const DeskModel = () => {
  const { scene } = useGLTF('https://yunchi-098.github.io/3d-assets/desk.glb');

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.6;
          child.material.metalness = 0.3;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={1.8} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
}

export const Desk: React.FC = () => {
  return (
    <group position={[0, 0, 0]} name="DeskGroup">

      <DeskModel />

      {/* Items raised to 1.48 to ensure they sit ON TOP of the desk surface (scale 1.8) */}
      <group position={[0, 1.48, 0]}>

        {/* Far Left - Vintage Camera - GLB Model */}
        <CameraModel />

        {/* Far Right - Gramophone - GLB REPLACEMENT */}
        <GramophoneModel />

        {/* Film Rolls - Stacked GLB Models */}
        <FilmReelsModel />

        {/* --- Books (Scaled down to 0.6) --- */}
        {/* Spacing increased to +/- 0.8 to prevent touching */}

        {/* Book 1: Left - The Eye - Moved Forward */}
        <InteractiveBook
          id="book1"
          title="Preview"
          coverFontSize={0.1}
          color="#004225"
          position={[-0.6, -0.02, 0.6]}
          rotation={[0, 0.25, 0]}
          scale={0.6}
          pages={[
            {
              title: "",
              text: "I paint what cannot be photographed, something from the imagination...  I photograph the things I don't want to paint, things that are already in existence.   ~Man Ray",
              backText: `Surreality
Reality
Irreality`,
              backFontSize: 0.05,
              backLineHeight: 1.8
            },
            {
              title: "",
              text: "",
              image: "/dadaism.jpg",
              backText: "The imaginary is what tends to become real.\n~André Breton",
              backFontSize: 0.04,
              backLineHeight: 1.4
            }
          ]}
        />

        {/* Book 2: Center - Manifesto - Centered and set back */}
        <InteractiveBook
          id="book2"
          title="In Literature"
          color="#8b0000"
          position={[0.1, -0.02, 0.4]}
          rotation={[0, 0.08, 0]}
          scale={0.6}
          titleOffset={[0.05, 0, 0]}
          coverFontSize={0.09}
          pages={[
            {
              title: "", text: `• Automatic Writing
• Free Association
• Dream Imagery
• Illogical Imagery`, fontSize: 0.035, lineHeight: 1.6, backImage: "/rimbaud.jpg", backText: ""
            },
            {
              title: "",
              text: "Free Verse / Prose Poetry",
              fontSize: 0.04,
              backText: "I have forced myself to contradict myself in order to avoid conforming to my own taste.\n― Marcel Duchamp",
              backFontSize: 0.035
            }
          ]}
        />

        {/* Book 3: Right - Dreams - Moved Forward */}
        <InteractiveBook
          id="book3"
          title="Suggestions"
          coverFontSize={0.08}
          color="#191970"
          position={[0.8, -0.02, 0.6]}
          rotation={[0, -0.25, 0]}
          scale={0.6}
          titleOffset={[0.05, 0, 0]}
          pages={[
            { title: "", text: "", image: "/aragon.jpg", backImage: "/edgu.jpg", backText: "" },
            { title: "", text: "", image: "/rimbaud_season.jpg", backImage: "/breton_manifesto.jpg", backText: "" },
            { title: "", text: "", image: "/karasu.png" }
          ]}
        />
      </group>
    </group>
  );
};


