
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { useStore } from '../context/StoreContext';
import { ViewMode } from '../types';

export const CameraManager: React.FC = () => {
  const { camera, viewport } = useThree();
  const { width, height } = viewport;
  const isPortrait = width < height;

  const { viewMode, focusTarget, setViewMode, lookOffset, setLookOffset } = useStore();

  // We keep a mutable reference to the target lookAt point
  const targetRef = useRef(new Vector3(0, 1.5, 0));

  // Handle Animations based on ViewMode
  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { duration: 1.5, ease: 'power3.inOut' } });

    // Reset look offset when changing views
    setLookOffset(0);

    if (viewMode === ViewMode.WALL || viewMode === ViewMode.WALL_NO_TITLE) {
      // Wall View
      timeline.to(camera.position, {
        x: 0,
        y: 1.6,
        z: isPortrait ? 16 : 10, // Move back on mobile to see more
      });
      timeline.to(targetRef.current, {
        x: 0,
        y: 1.6,
        z: 0,
      }, "<");
    } else if (viewMode === ViewMode.DESK) {
      // Desk View
      timeline.to(camera.position, {
        x: 0,
        y: isPortrait ? 8.0 : 6.0, // Higher and further back on mobile
        z: isPortrait ? 10.0 : 6.5,
      });
      timeline.to(targetRef.current, {
        x: 0,
        y: 1.48,
        z: 0.4,
      }, "<");
    } else if (viewMode === ViewMode.FOCUS && focusTarget) {
      // Focus View
      const mobileOffsetMultiplier = isPortrait ? 1.5 : 1;

      timeline.to(camera.position, {
        x: focusTarget.position.x + focusTarget.offset.x * mobileOffsetMultiplier,
        y: focusTarget.position.y + focusTarget.offset.y * mobileOffsetMultiplier - 1.3,
        z: focusTarget.position.z + focusTarget.offset.z * mobileOffsetMultiplier,
        duration: 1.2
      });
      timeline.to(targetRef.current, {
        x: focusTarget.target.x,
        y: focusTarget.target.y - 1,
        z: focusTarget.target.z,
        duration: 1.2
      }, "<");
    }

    return () => {
      timeline.kill();
    };
  }, [viewMode, focusTarget, camera, isPortrait, setLookOffset]);

  // Update camera to look at the animated target every frame
  useFrame(() => {
    // Apply the offset to the current animated target
    const targetWithOffset = targetRef.current.clone();
    targetWithOffset.x += lookOffset;
    camera.lookAt(targetWithOffset);
  });

  return null;
};
