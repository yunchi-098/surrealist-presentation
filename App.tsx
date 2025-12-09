import React, { Suspense, useContext } from 'react';
import { Canvas } from '@react-three/fiber';
import { StoreProvider, useStore, StoreContext } from './context/StoreContext';
import { Experience } from './components/Experience';
import { ViewMode } from './types';

const UIOverlay = () => {
  const { viewMode, setViewMode, focusedItemName, setFocusTarget, setFocusedItemName, lookOffset, setLookOffset } = useStore();

  const handleBack = () => {
    if (viewMode === ViewMode.FOCUS) {
      setViewMode(ViewMode.DESK);
      setFocusTarget(null);
      setFocusedItemName(null);
    } else if (viewMode === ViewMode.DESK) {
      setViewMode(ViewMode.WALL);
    }
  };

  const handleScreenClick = () => {
    if (viewMode === ViewMode.WALL) {
      setViewMode(ViewMode.WALL_NO_TITLE);
    } else if (viewMode === ViewMode.WALL_NO_TITLE) {
      setViewMode(ViewMode.DESK);
    }
  };

  const showTitle = viewMode === ViewMode.WALL;
  const showFooter = viewMode === ViewMode.DESK || viewMode === ViewMode.FOCUS;
  const isTransitionMode = viewMode === ViewMode.WALL || viewMode === ViewMode.WALL_NO_TITLE;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-8">

      {/* Click Handler Layer for Wall Modes */}
      {isTransitionMode && (
        <div
          className="absolute inset-0 z-30 pointer-events-auto cursor-pointer"
          onClick={handleScreenClick}
        />
      )}

      {/* Central Presentation Title - Only visible in Wall View */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${showTitle ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="text-center bg-black/30 p-6 md:p-12 rounded-3xl backdrop-blur-sm border border-white/5 mx-4">
          <h1 className="text-4xl md:text-9xl text-amber-50 font-serif tracking-tighter mix-blend-difference opacity-90 mb-4">
            The Madness of Humanity
          </h1>
          <h2 className="text-lg md:text-4xl text-amber-200/80 font-serif italic">
            Introduction to Surrealism
          </h2>
          <div className="mt-8 text-amber-100/60 font-sans text-xs md:text-sm animate-pulse">
            Click to Enter
          </div>
        </div>
      </div>

      {/* Header - Empty placeholder to keep structure if needed, or removed */}
      <header className="flex justify-between items-start pointer-events-auto">
        {/* Mobile Back Button - Top Left */}
        {viewMode !== ViewMode.WALL && viewMode !== ViewMode.WALL_NO_TITLE && (
          <button
            onClick={handleBack}
            className="md:hidden px-4 py-2 text-sm border border-amber-100/30 text-amber-50 rounded-full backdrop-blur-sm hover:bg-amber-100/10 transition-all font-serif flex items-center gap-2"
          >
            ← Back
          </button>
        )}

        {/* Mobile Look Controls - Top Right */}
        <div className="md:hidden flex gap-2">
          {viewMode !== ViewMode.WALL && viewMode !== ViewMode.WALL_NO_TITLE && (
            <>
              <button
                onClick={() => setLookOffset(lookOffset - 0.5)}
                className="px-3 py-2 text-sm border border-amber-100/30 text-amber-50 rounded-full backdrop-blur-sm hover:bg-amber-100/10 transition-all font-serif"
              >
                ← Look
              </button>
              <button
                onClick={() => setLookOffset(lookOffset + 0.5)}
                className="px-3 py-2 text-sm border border-amber-100/30 text-amber-50 rounded-full backdrop-blur-sm hover:bg-amber-100/10 transition-all font-serif"
              >
                Look →
              </button>
            </>
          )}
        </div>
      </header>

      {/* Footer / Controls */}
      <footer className={`flex justify-between items-end pointer-events-auto transition-opacity duration-500 ${showFooter ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex gap-4">
          {viewMode !== ViewMode.WALL && viewMode !== ViewMode.WALL_NO_TITLE && (
            <button
              onClick={handleBack}
              className="px-4 py-2 md:px-6 md:py-2 text-sm md:text-base border border-amber-100/30 text-amber-50 rounded-full backdrop-blur-sm hover:bg-amber-100/10 transition-all font-serif"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="text-right text-amber-100/50 text-xs md:text-sm font-sans max-w-[200px] md:max-w-xs">
          {viewMode === ViewMode.DESK && <p>Select an object or book to examine closely.</p>}
          {viewMode === ViewMode.FOCUS && <p>Click back to return to the desk.</p>}
        </div>
      </footer>
    </div>
  );
};

// Component to Bridge the context into the Canvas
const SceneContent = () => {
  // We grab the store from the parent (DOM) tree
  const store = useContext(StoreContext);

  if (!store) return null;

  return (
    // And provide it to the children (Canvas) tree
    <StoreContext.Provider value={store}>
      <Experience />
    </StoreContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <div className="relative w-full h-screen bg-[#050505] overflow-hidden">

        {/* CSS Post-Processing Overlays */}

        {/* Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.6) 100%)'
          }}
        />

        {/* Film Grain */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        <UIOverlay />

        <Canvas
          shadows
          dpr={[1, 2]}
          // Decreased FOV to 20 for extreme cinematic/telephoto look
          camera={{ position: [0, 1.5, 9], fov: 20 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true
          }}
        >
          <Suspense fallback={null}>
            <SceneContent />
          </Suspense>
        </Canvas>
      </div>
    </StoreProvider>
  );
};

export default App;