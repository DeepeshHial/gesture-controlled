"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const LERP_POS = 0.05;
const LERP_HAND = 0.12;
const LERP_ROT = 0.08;
const LERP_SCALE = 0.1;

export default function SwordScene({ gesture, handData, onReady }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const swordsRef = useRef([]);
  const trailsRef = useRef([]);
  const animationsRef = useRef({ time: 0, dashTimer: 0, slashTimer: 0, selectedSwordIdx: -1 });
  const formationsRef = useRef({ type: 'idle' });

  const handDataRef = useRef(handData);

  useEffect(() => {
    handDataRef.current = handData;
  }, [handData]);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Initial Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000011, 0.045);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 7;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111133, 1.2);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight.position.set(5, 5, 0);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffd700, 0.5);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Background Particles
    const bgGeometry = new THREE.BufferGeometry();
    const bgCount = 300;
    const bgPositions = new Float32Array(bgCount * 3);
    for(let i=0; i<bgCount*3; i+=3) {
      bgPositions[i] = (Math.random() - 0.5) * 20;
      bgPositions[i+1] = (Math.random() - 0.5) * 20;
      bgPositions[i+2] = (Math.random() - 0.5) * 10 - 5;
    }
    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    const bgMaterial = new THREE.PointsMaterial({ color: 0x1a1a4e, size: 0.015 });
    const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(bgParticles);

    // Build Swords
    const bladeGeo = new THREE.BoxGeometry(0.08, 1.4, 0.03);
    const guardGeo = new THREE.BoxGeometry(0.35, 0.06, 0.05);
    const handleGeo = new THREE.BoxGeometry(0.05, 0.35, 0.04);
    
    const bladeMat = new THREE.MeshStandardMaterial({ 
      color: 0xaaeeff, emissive: 0x00f0ff, emissiveIntensity: 2.5 
    });
    const goldMat = new THREE.MeshStandardMaterial({ 
      emissive: 0xffd700, emissiveIntensity: 1.5 
    });

    const swords = [];
    const trails = [];

    for (let i = 0; i < 8; i++) {
      const swordGroup = new THREE.Group();
      
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.y = 0.7; // shift up
      swordGroup.add(blade);
      
      const guard = new THREE.Mesh(guardGeo, goldMat);
      // guard is at origin of group
      swordGroup.add(guard);
      
      const handle = new THREE.Mesh(handleGeo, goldMat);
      handle.position.y = -0.175; // shift down
      swordGroup.add(handle);

      const localLight = new THREE.PointLight(0x00f0ff, 0.6, 2.5);
      swordGroup.add(localLight);

      // Add trail
      const trailGeo = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(20 * 3); // 20 segments
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.PointsMaterial({
        color: 0x00f0ff, size: 0.04, transparent: true, opacity: 0.6
      });
      const trail = new THREE.Points(trailGeo, trailMat);
      scene.add(trail);

      // Random initial position
      swordGroup.position.set(
        (Math.random() - 0.5) * 8, 
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 2
      );

      // Custom properties for animation state
      swordGroup.userData = {
        targetPos: new THREE.Vector3().copy(swordGroup.position),
        targetRot: new THREE.Euler(),
        targetScale: 1.0,
        baseScale: 1.0,
        history: Array(20).fill(new THREE.Vector3().copy(swordGroup.position)),
        staggerOffset: i * 40 // ms stagger
      };
      
      swords.push(swordGroup);
      trails.push(trail);
      scene.add(swordGroup);
    }
    swordsRef.current = swords;
    trailsRef.current = trails;

    // Auras
    const torusAuraGeo = new THREE.TorusGeometry(2.2, 0.03, 16, 100);
    const torusAuraMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0 });
    const torusAura = new THREE.Mesh(torusAuraGeo, torusAuraMat);
    scene.add(torusAura);
    
    const sphereAuraGeo = new THREE.SphereGeometry(2.0, 16, 16);
    const sphereAuraMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0 });
    const sphereAura = new THREE.Mesh(sphereAuraGeo, sphereAuraMat);
    scene.add(sphereAura);

    // Animation Loop
    let reqId;
    let lastTime = performance.now();
    
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      const t = animationsRef.current.time += 0.016; // approx time

      bgParticles.position.y += 0.005;
      if (bgParticles.position.y > 10) bgParticles.position.y = 0;

      // Update gesture state internally
      const g = formationsRef.current.type;
      const currentHand = handDataRef.current;
      
      // Update Auras
      torusAura.material.opacity = THREE.MathUtils.lerp(torusAura.material.opacity, g === 'fist' ? 0.3 : 0, 0.1);
      torusAura.rotation.y += 0.008;
      
      sphereAura.material.opacity = THREE.MathUtils.lerp(sphereAura.material.opacity, g === 'five' ? 0.15 : 0, 0.1);
      if (g === 'five') {
        const pulse = 0.15 + (Math.sin(t * 2) * 0.05);
        sphereAura.material.opacity = Math.max(0, pulse);
        sphereAura.rotation.y += 0.005;
      }

      // Calculate Targets based on gesture
      if (g === 'idle') {
        swords.forEach((s, i) => {
          s.userData.targetRot.y += 0.01;
          s.userData.targetPos.y += Math.sin(t + i) * 0.002;
          s.userData.targetScale = 1.0;
        });
      }
      else if (g === 'fist') {
        swords.forEach((s, i) => {
          const angle = (i / 8) * Math.PI * 2 + (t * 0.5); // global spin
          s.userData.targetPos.set(Math.cos(angle) * 2.2, 0, Math.sin(angle) * 2.2);
          
          // Face tangent
          const targetQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
          s.userData.targetRot.setFromQuaternion(targetQ);
          s.userData.targetRot.z += 0.05; // local spin
          s.userData.targetScale = 1.0;
        });
      }
      else if (g === 'two') {
         // Snake Movement Logic
         let headTarget = new THREE.Vector3();
         const aspect = window.innerWidth / window.innerHeight;
         const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(30)) * 8; // At dist 8
         const viewWidth = viewHeight * aspect;

         if (currentHand && currentHand.isVisible) {
           // Map hand 0-1 to view dimensions (slightly padded)
           headTarget.set(
             (currentHand.x - 0.5) * (viewWidth * 0.9), 
             -(currentHand.y - 0.5) * (viewHeight * 0.9), 
             -1
           );
         } else {
           headTarget.set(0, 0, -1);
         }

         // Mark sword 0 as the lead for faster lerping
         animationsRef.current.selectedSwordIdx = 0;

         swords.forEach((s, i) => {
           if (i === 0) {
              s.userData.targetPos.copy(headTarget);
              s.userData.targetRot.set(Math.PI/4, t*3, 0);
              s.userData.targetScale = 1.3;
              s.children[0].material.emissiveIntensity = 4.5;
           } else {
              const prevSword = swords[i-1];
              const history = prevSword.userData.history;
              const followIdx = Math.min(6, history.length - 1);
              const followPos = history[followIdx] || prevSword.position;
              
              s.userData.targetPos.copy(followPos);
              
              const lookTarget = prevSword.position;
              s.lookAt(lookTarget);
              s.rotateX(Math.PI / 2);
              s.userData.targetRot.copy(s.rotation);
              
              s.userData.targetScale = 1.0 - (i * 0.05);
              s.children[0].material.emissiveIntensity = 2.5 + (1 / (i + 1));
           }
         });
      }
      else if (g === 'five') {
        const golden = Math.PI * (3 - Math.sqrt(5));
        swords.forEach((s, i) => {
          const y = 1 - (i / 7) * 2;
          const r = Math.sqrt(1 - y*y);
          const theta = golden * i + (t * 0.5); // global orbit
          
          s.userData.targetPos.set(
            Math.cos(theta) * r * 2.0,
            y * 2.0,
            Math.sin(theta) * r * 2.0
          );
          
          // look outward
          const lookPos = new THREE.Vector3().copy(s.userData.targetPos).multiplyScalar(2);
          s.lookAt(lookPos);
          s.rotateX(Math.PI / 2); // point tip out
          s.userData.targetRot.copy(s.rotation); // sync target to manual rotation
          s.userData.targetScale = 1.0;
        });
      }

      // Handle Animations & Lerping
      const isDashing = animationsRef.current.dashTimer > 0;
      const isSlashing = animationsRef.current.slashTimer > 0;
      
      if (isDashing) {
        animationsRef.current.dashTimer--;
        camera.position.x += (Math.random() - 0.5) * 0.04;
        
        if (animationsRef.current.selectedSwordIdx !== -1) {
           swords[animationsRef.current.selectedSwordIdx].userData.targetPos.z = -5;
        }
      } else {
        camera.position.set(0, 0, 7); // reset
      }

      if (isSlashing) {
        animationsRef.current.slashTimer--;
        swords.forEach(s => {
          s.userData.targetRot.z += 0.5; // rapid spin
        });
      }

      swords.forEach((s, i) => {
        // Only start moving if enough time passed since state change
        const timeSinceChange = performance.now() - animationsRef.current.stateChangeTime || 0;
        if (timeSinceChange < s.userData.staggerOffset) return;

        // Reset emissive if not TWO
        if (g !== 'two') s.children[0].material.emissiveIntensity = 2.5;

        // LERP Position
        const pFac = (g === 'two' && i === animationsRef.current.selectedSwordIdx) ? LERP_HAND : LERP_POS;
        s.position.lerp(s.userData.targetPos, pFac);
        
        // LERP Rotation (if not manually set like FIVE)
        if (g !== 'five') {
          // simple euler lerp approximation for smooth effect
          s.rotation.x = THREE.MathUtils.lerp(s.rotation.x, s.userData.targetRot.x, LERP_ROT);
          s.rotation.y = THREE.MathUtils.lerp(s.rotation.y, s.userData.targetRot.y, LERP_ROT);
          s.rotation.z = THREE.MathUtils.lerp(s.rotation.z, s.userData.targetRot.z, LERP_ROT);
        }

        // LERP Scale
        const currentScale = s.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, s.userData.targetScale, LERP_SCALE);
        s.scale.set(newScale, newScale, newScale);

        // Update Trails
        s.userData.history.unshift(new THREE.Vector3().copy(s.position));
        s.userData.history.pop();
        
        const positions = trails[i].geometry.attributes.position.array;
        s.userData.history.forEach((pos, idx) => {
          positions[idx*3] = pos.x;
          positions[idx*3+1] = pos.y;
          positions[idx*3+2] = pos.z;
        });
        trails[i].geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    if (onReady) onReady();
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Handle Gesture Changes
  useEffect(() => {
    if (formationsRef.current.type !== gesture) {
       formationsRef.current.type = gesture;
       animationsRef.current.stateChangeTime = performance.now();

       // Triggers
       if (gesture === 'point') {
          // Dash Attack
          animationsRef.current.dashTimer = 18;
          // select closest if not already
          if (animationsRef.current.selectedSwordIdx === -1) {
            let closest = 0; let m = Infinity;
            swordsRef.current.forEach((s, i) => { 
                const d = s.position.z; if(d < m){m=d; closest=i;} 
            });
            animationsRef.current.selectedSwordIdx = closest;
          }
       }
       if (gesture === 'swipe') {
          // Slash
          animationsRef.current.slashTimer = 12;
       }
       
       if (gesture === 'two') {
          // Scatter swords initially
          swordsRef.current.forEach(s => {
             s.userData.targetPos.set(
               (Math.random() - 0.5) * 8, 
               (Math.random() - 0.5) * 6,
               (Math.random() - 0.5) * 2
             );
          });
       }
    }
  }, [gesture]);

  return <div ref={mountRef} className="w-full h-full" />;
}
