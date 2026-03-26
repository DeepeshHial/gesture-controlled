"use client";

import { useEffect, useRef, useState } from 'react';
import { getGesture } from './GestureEngine';

export default function HandTracker({ videoRef, onGesture, onHandMove, onReady, onProgress }) {
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
  
  const historyRef = useRef([]);
  const gestureHistory = useRef([]);

  useEffect(() => {
    let checkCount = 0;
    const checkMediaPipe = setInterval(() => {
      checkCount++;
      if (onProgress) onProgress(Math.min(checkCount * 5, 40));
      
      if (window.Hands && window.Camera) {
        clearInterval(checkMediaPipe);
        setIsMediaPipeLoaded(true);
      } else if (checkCount > 50) {
        // Fallback or warning if it's taking too long
        console.warn("MediaPipe scripts are taking longer than expected to load.");
      }
    }, 200);
    return () => clearInterval(checkMediaPipe);
  }, []);

  useEffect(() => {
    if (!isMediaPipeLoaded || !videoRef.current) return;

    const hands = new window.Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.8,
      minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        const handData = {
          x: 1 - landmarks[9].x,
          y: landmarks[9].y,
          isVisible: true
        };
        if (onHandMove) onHandMove(handData);

        historyRef.current.push({ x: landmarks[0].x, time: Date.now() });
        if (historyRef.current.length > 6) {
          historyRef.current.shift();
        }

        const rawGesture = getGesture(landmarks, historyRef.current);
        
        gestureHistory.current.push(rawGesture);
        if (gestureHistory.current.length > 4) {
          gestureHistory.current.shift();
        }
        
        if (gestureHistory.current.every(g => g === rawGesture)) {
          if (onGesture) onGesture(rawGesture);
        }
      } else {
        if (onHandMove) onHandMove(null);
        historyRef.current = [];
        
        gestureHistory.current.push('idle');
        if (gestureHistory.current.length > 4) gestureHistory.current.shift();
        if (gestureHistory.current.every(g => g === 'idle')) {
          if (onGesture) onGesture('idle');
        }
      }
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current.videoWidth > 0) {
           await hands.send({image: videoRef.current});
        }
      },
      width: 640,
      height: 480
    });

    if (onProgress) onProgress(60);
    
    camera.start().then(() => {
        if (onReady) onReady();
    });

    return () => {
      camera.stop();
      hands.close();
    };
  }, [isMediaPipeLoaded]);

  return <></>;
}
