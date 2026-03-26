"use client";

import { useState, useRef } from 'react';
import LoadingScreen from '@/components/UI/LoadingScreen';
import Title from '@/components/UI/Title';
import WebcamPreview from '@/components/UI/WebcamPreview';
import GestureLegend from '@/components/UI/GestureLegend';
import HandTracker from '@/components/HandTracker';
import SwordScene from '@/components/SwordScene';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [gesture, setGesture] = useState('idle');
  const [handData, setHandData] = useState(null); // {x, y, isVisible}
  const [loadProgress, setLoadProgress] = useState(0);
  
  const videoRef = useRef(null);

  // Called when MediaPipe + Three.js initialization is complete
  const handleReady = () => {
    setLoadProgress(100);
    setTimeout(() => setIsLoaded(true), 800);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {!isLoaded && <LoadingScreen progress={loadProgress} />}

      <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <SwordScene gesture={gesture} handData={handData} onReady={() => setLoadProgress(p => Math.max(p, 50))} />
      </div>

      <HandTracker 
        videoRef={videoRef}
        onGesture={setGesture} 
        onHandMove={setHandData}
        onReady={handleReady}
        onProgress={(p) => setLoadProgress(prev => Math.max(prev, p))}
      />

      {isLoaded && (
        <>
          <Title />
          <GestureLegend activeGesture={gesture} />

          <div className="fixed top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur border border-cyan-500/50 rounded-full flex items-center gap-2 z-40 transition-all">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-cyan-400 font-mono text-sm tracking-wider capitalize">{gesture}</span>
          </div>
          
          {/* Flash Overlay for Swipe */}
          {gesture === 'swipe' && (
            <div className="fixed inset-0 bg-white z-50 pointer-events-none animate-flash" />
          )}
        </>
      )}

      {/* Render WebcamPreview always so videoRef exists, but hide until loaded */}
      <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <WebcamPreview isTracking={handData?.isVisible} videoRef={videoRef} />
      </div>
    </main>
  );
}
