
import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { useStore } from '../context/StoreContext';
import { ViewMode } from '../types';

export const CameraManager: React.FC = () => {
  const { camera } = useThree();
  const { viewMode, focusTarget, setViewMode } = useStore();

  // We keep a mutable reference to the target lookAt point
  const targetRef = useRef(new Vector3(0, 1.5, 0));

  // Handle Animations based on ViewMode
  useEffect(() => {
    const timeline = gsap.timeline({ defaults: { duration: 1.5, ease: 'power3.inOut' } });

    if (viewMode === ViewMode.WALL || viewMode === ViewMode.WALL_NO_TITLE) {
      // Wall View: Wide shot facing the paintings
      // Kept at 10 (Static/Fixed as requested)
      timeline.to(camera.position, {
        x: 0,
        y: 1.6,
        z: 10,
      });
      timeline.to(targetRef.current, {
        x: 0,
        y: 1.6,
        z: 0, // Looking at the wall
      }, "<");
    } else if (viewMode === ViewMode.DESK) {
      // Desk View: Front angle
      // MOVED CLOSER: z from 9 -> 6.5, y from 7.5 -> 6.0
      timeline.to(camera.position, {
        x: 0,
        y: 6.0,
        z: 6.5,
      });
      timeline.to(targetRef.current, {
        x: 0,
        y: 1.48, // Look at desk items
        z: 0.4, // Center view on the book cluster
      }, "<");
    } else if (viewMode === ViewMode.FOCUS && focusTarget) {
      // Focus View: Close up on specific object
      timeline.to(camera.position, {
        x: focusTarget.position.x + focusTarget.offset.x,
        y: focusTarget.position.y + focusTarget.offset.y - 1.3, // Reverted: Restore magic number
        z: focusTarget.position.z + focusTarget.offset.z,
        duration: 1.2
      });
      timeline.to(targetRef.current, {
        x: focusTarget.target.x,
        y: focusTarget.target.y - 1, // Reverted: Restore magic number
        z: focusTarget.target.z,
        duration: 1.2
      }, "<");
    }

    return () => {
      timeline.kill();
    };
  }, [viewMode, focusTarget, camera]);

  // Update camera to look at the animated target every frame
  useFrame(() => {
    camera.lookAt(targetRef.current);
  });

  return null;
};
