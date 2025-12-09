
import React, { useState, useRef, useEffect } from 'react';
import { useCursor, Text, Image } from '@react-three/drei';
import { Vector3, Group, MathUtils } from 'three';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../context/StoreContext';
import { ViewMode, BookData } from '../../types';

// Safe lerp function
const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

const FONT_URL = 'https://fonts.cdnfonts.com/s/8399/BLKCHCRY.woff';
const BLACKMOON_FONT_URL = 'https://fonts.cdnfonts.com/s/41758/Blackmoon%20Quest.woff';

// --- Sub-components ---

const PageVisuals: React.FC<{
  title: string;
  text: string;
  pageNumber: number | string;
  isCover?: boolean;
  color?: string;
  side: 'front' | 'back';
  titleOffset?: [number, number, number];
  fontSize?: number;
  lineHeight?: number;
  image?: string;
}> = ({ title, text, pageNumber, isCover, color = "#f0e6d2", side, titleOffset = [0, 0, 0], fontSize, lineHeight, image }) => {
  const isFront = side === 'front';

  // Dimensions
  const width = isCover ? 0.62 : 0.58;
  const height = isCover ? 0.86 : 0.78;
  const thickness = isCover ? 0.02 : 0.004;

  // Offset pages slightly from spine for realism
  const spineGap = isCover ? 0 : 0.01;
  const xPos = (width / 2) + spineGap;

  // Colors
  const paperColor = '#fdfbf7';
  const coverColor = color;
  const materialColor = isCover ? coverColor : paperColor;
  const roughness = isCover ? 0.4 : 0.8;

  // Text colors
  const titleColor = isCover ? "#d4af37" : "#5c4033";
  const bodyTextColor = isCover ? "#e8d8b0" : "#3a2510";

  // --- Rotation Logic ---
  // Front: [-90, 0, 0] -> Face Up, Top points Back (-Z), Right points Right (+X).
  // Back: [90, 0, 180] -> Face Down, Top points Back (-Z), Right points Left (-X).
  // When Back flips 180 Z: Faces Up, Top points Back (-Z), Right points Right (+X).
  // This ensures correct reading direction L->R.

  const textRotation = isFront
    ? [-Math.PI / 2, 0, 0]
    : [Math.PI / 2, 0, Math.PI];

  const groupScale = [1, 1, 1]; // No negative scale to avoid artifacts

  // Vertical offset for text (top or bottom face)
  const yOffset = isFront
    ? (thickness / 2 + 0.002)
    : -(thickness / 2 + 0.002);

  // Layout Logic
  // Back Page (Left Page): Local X maps to World -X.
  // We want Page Number at Outer Edge (World -width).
  // Local +width maps to World -width.
  // So position text at positive X.
  // Anchor 'left' aligns start of text to this edge, flowing Right (World +X, Inwards).

  const numberAnchor = isFront ? 'right' : 'left';
  const numberX = isFront ? 0.25 : 0.25;

  return (
    <group>
      {/* Main Slab */}
      <mesh receiveShadow castShadow position={[xPos, 0, 0]}>
        <boxGeometry args={[width, thickness, height]} />
        <meshStandardMaterial color={materialColor} roughness={roughness} />
      </mesh>

      {/* Decorative Binding Strip (Only on Front Cover Outside) */}
      {isCover && isFront && (
        <group>
          <mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[0.12, thickness + 0.001, height]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
          </mesh>
          <mesh position={[0.125, 0.001, 0]}>
            <boxGeometry args={[0.005, thickness + 0.002, height]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Text Content Group */}
      <group
        position={[xPos, yOffset, 0]}
        rotation={textRotation as any}
        scale={groupScale as any}
      >
        {isCover ? (
          <Text
            position={titleOffset}
            fontSize={isFront ? (fontSize || 0.12) : 0.04}
            color={titleColor}
            maxWidth={0.4}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            font={BLACKMOON_FONT_URL}
          >
            {isFront ? title.toUpperCase() : text}
          </Text>
        ) : (
          // Inside Page Content
          <>
            {/* Title - Only render if exists */}
            {title && (
              <Text
                position={[0, 0.3, 0]}
                fontSize={0.04}
                color={titleColor}
                maxWidth={0.5}
                textAlign="center"
                anchorY="top"
                font={FONT_URL}
              >
                {title}
              </Text>
            )}

            {/* Image - Only render if exists */}
            {image && (
              <Image
                url={image}
                position={[0, -0.02, 0]}
                scale={[0.5, 0.7]}
                transparent
                opacity={0.9}
                color={color} // Tint with paper color slightly
              />
            )}

            {/* Body Text - Adaptive Layout based on title existence */}
            <Text
              position={title ? [0, 0.15, 0] : [0, 0, 0]} // Center vertically if no title
              fontSize={fontSize || (title ? 0.02 : 0.035)} // Use custom fontSize or default
              color={bodyTextColor}
              maxWidth={0.48}
              textAlign={title ? "justify" : "center"} // Center align if quote
              anchorY={title ? "top" : "middle"} // Center vertical anchor if quote
              lineHeight={lineHeight || 1.4} // Use custom lineHeight or default
              font={FONT_URL}
            >
              {text}
            </Text>

            <Text
              position={[numberX, -0.35, 0]}
              fontSize={0.02}
              color="#888"
              anchorX={numberAnchor}
              font={FONT_URL}
            >
              {String(pageNumber)}
            </Text>
          </>
        )}
      </group>
    </group>
  );
};

interface BookLeafProps {
  index: number;
  totalLeaves: number;
  front: React.ReactNode;
  back: React.ReactNode;
  isOpen: boolean;
}

const BookLeaf: React.FC<BookLeafProps> = ({ index, totalLeaves, front, back, isOpen }) => {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // ROTATION
    let targetRotation = isOpen ? Math.PI - 0.05 : 0;

    if (isOpen) {
      targetRotation -= (index * 0.005);
    } else {
      targetRotation += (index * 0.002);
    }

    // STACKING
    const pageGap = 0.005;
    const coverThickness = 0.02;
    const pageThickness = 0.004;
    const verticalLift = 0.01;
    const baseStackHeight = 0.02;
    const coverToPageOffset = (coverThickness / 2) + (pageThickness / 2) + 0.001;

    let targetY = 0;

    if (isOpen) {
      if (index === 0) {
        targetY = verticalLift;
      } else {
        targetY = verticalLift + coverToPageOffset + (index - 1) * pageGap;
      }
    } else {
      const pagesBelow = totalLeaves - 1 - index;
      targetY = baseStackHeight + (pagesBelow * pageGap);
      if (index === 0) {
        targetY += coverToPageOffset;
      }
    }

    const easing = 4 * delta;
    groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, targetRotation, easing);
    groupRef.current.position.y = lerp(groupRef.current.position.y, targetY, easing);
  });

  return (
    <group ref={groupRef}>
      <group>{front}</group>
      <group>{back}</group>
    </group>
  );
};

// --- Main Component ---

type InteractiveBookProps = Omit<BookData, 'id'> & { id: string, scale?: number, titleOffset?: [number, number, number], coverFontSize?: number };

export const InteractiveBook: React.FC<InteractiveBookProps> = ({
  id, title, color, position, rotation, pages, scale = 1, titleOffset = [0, 0, 0], coverFontSize
}) => {
  const { viewMode, setViewMode, setFocusTarget, setFocusedItemName, focusedItemName } = useStore();
  const [hovered, setHovered] = useState(false);
  const [flippedCount, setFlippedCount] = useState(0);

  const isFocused = viewMode === ViewMode.FOCUS && focusedItemName === title;
  const safePages = pages || [];
  const totalLeaves = safePages.length + 1;
  const totalStackHeight = 0.02 + (safePages.length * 0.005) + 0.02;

  useCursor(hovered && (viewMode === ViewMode.DESK || isFocused));

  useEffect(() => {
    if (!isFocused) {
      const timer = setTimeout(() => setFlippedCount(0), 500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const handleBookClick = (e: any) => {
    e.stopPropagation();
    if (viewMode === ViewMode.DESK) {
      const objPos = new Vector3(...position);
      setFocusedItemName(title);
      setFocusTarget({
        position: objPos,
        // Zero Z offset for strictly top-down view, Y 3.5 for close reading
        offset: new Vector3(0, 3.5, 0),
        target: objPos,
      });
      setViewMode(ViewMode.FOCUS);
      return;
    }
  };

  const nextPage = () => {
    if (flippedCount < totalLeaves) {
      setFlippedCount(c => c + 1);
    }
  };

  const prevPage = () => {
    if (flippedCount > 0) {
      setFlippedCount(c => c - 1);
    }
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleBookClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {isFocused && (
        <>
          <mesh position={[0.35, 0.1, 0]} onClick={(e) => { e.stopPropagation(); nextPage(); }}>
            <boxGeometry args={[0.6, 0.4, 0.9]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          <mesh position={[-0.35, 0.1, 0]} onClick={(e) => { e.stopPropagation(); prevPage(); }}>
            <boxGeometry args={[0.6, 0.4, 0.9]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </>
      )}

      {/* Back Cover */}
      <mesh position={[0.31, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.02, 0.86]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>

      {/* Spine */}
      <group position={[0, totalStackHeight / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.04, totalStackHeight, 0.86]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </group>

      {/* Leaves */}
      <BookLeaf
        index={0}
        totalLeaves={totalLeaves}
        isOpen={flippedCount > 0}
        front={
          <PageVisuals
            side="front"
            title={title}
            text=""
            pageNumber=""
            isCover={true}
            color={color}
            titleOffset={titleOffset}
            fontSize={coverFontSize}
          />
        }
        back={
          <PageVisuals
            side="back"
            title=""
            text="Ex Libris"
            pageNumber=""
            isCover={true}
            color={color}
          />
        }
      />

      {safePages.map((page, i) => (
        <BookLeaf
          key={i}
          index={i + 1}
          totalLeaves={totalLeaves}
          isOpen={flippedCount > (i + 1)}
          front={
            <PageVisuals
              side="front"
              title={page.title}
              text={page.text}
              pageNumber={(i * 2 + 1)}
              fontSize={page.fontSize}
              lineHeight={page.lineHeight}
              image={page.image}
            />
          }
          back={
            <PageVisuals
              side="back"
              title={page.backTitle || ""}
              text={page.backText ?? "The dream continues..."}
              pageNumber={(i * 2 + 2)}
              fontSize={page.backFontSize || 0.04}
              lineHeight={page.backLineHeight || 1.5}
              image={page.backImage}
            />
          }
        />
      ))}
    </group>
  );
};
