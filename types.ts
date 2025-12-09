import { Vector3 } from 'three';

export enum ViewMode {
  WALL = 'WALL',
  WALL_NO_TITLE = 'WALL_NO_TITLE',
  DESK = 'DESK',
  FOCUS = 'FOCUS',
}

export interface CameraState {
  position: Vector3;
  target: Vector3;
}

export interface FocusTarget {
  position: Vector3; // World position of the object
  offset: Vector3;   // Camera offset relative to object
  target: Vector3;   // Where the camera looks at (usually center of object)
}

export interface BookPage {
  title: string;
  text: string;
  fontSize?: number;
  lineHeight?: number;
  image?: string;
  backTitle?: string;
  backText?: string;
  backFontSize?: number;
  backLineHeight?: number;
  backImage?: string;
}

export interface BookData {
  id: string;
  title: string;
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  pages: BookPage[];
}

// Augment the global JSX namespace to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}