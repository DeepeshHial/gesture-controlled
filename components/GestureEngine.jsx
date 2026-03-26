// Pure function to classify gestures from Mediapipe landmarks
export function getGesture(landmarks, prevHist = []) {
  if (!landmarks || landmarks.length !== 21) return 'idle';

  // Landmarks: 8=Index tip, 12=Middle tip, 16=Ring tip, 20=Pinky tip
  // 5=Index MCP, 9=Middle MCP, 13=Ring MCP, 17=Pinky MCP
  
  const isFingerExtended = (tip, mcp) => landmarks[tip].y < landmarks[mcp].y;
  
  const indexUp = isFingerExtended(8, 5);
  const middleUp = isFingerExtended(12, 9);
  const ringUp = isFingerExtended(16, 13);
  const pinkyUp = isFingerExtended(20, 17);

  // Swipe detection (uses wrist X position history)
  // wrist is landmark 0
  const currentWristX = landmarks[0].x;
  let isSwiping = false;

  if (prevHist.length > 0) {
    const oldestWristX = prevHist[0].x;
    if (Math.abs(currentWristX - oldestWristX) > 0.18) {
      isSwiping = true;
    }
  }

  if (isSwiping) return 'swipe';

  // ✋ FIVE - all 4 fingers extended (thumb can be tricky so just check these 4)
  if (indexUp && middleUp && ringUp && pinkyUp) {
    return 'five';
  }

  // ✊ FIST - no fingers extended
  if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'fist';
  }

  // ✌️ TWO - index and middle extended only
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return 'two';
  }

  // ☝️ POINT - only index extended
  if (indexUp && !middleUp && !ringUp && !pinkyUp) {
    return 'point';
  }

  return 'idle';
}
