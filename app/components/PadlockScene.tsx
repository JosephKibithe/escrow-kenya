"use client";

import { useMemo, useEffect, useRef, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF, Environment, useCursor } from '@react-three/drei';

/* ---------------------------------------------------------------
 *  3D Padlock Scene
 *  Loads a GLB model ('/padlock.glb') with a metallic gold finish
 *  and a programmatic environment map for shiny reflections.
 * --------------------------------------------------------------- */

/** Component that sets the scene environment for metallic reflections */
function SceneEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileCubemapShader();

    // Create a bright warm "studio" scene for gold reflections
    const envScene = new THREE.Scene();

    // Warm bright ambient background
    envScene.background = new THREE.Color('#b89860');

    // Large bright top softbox (main key light)
    const topLight = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ color: '#fffaf0', side: THREE.DoubleSide })
    );
    topLight.position.set(0, 5, 0);
    topLight.rotation.x = Math.PI / 2;
    envScene.add(topLight);

    // Front fill light (bright warm)
    const frontLight = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 8),
      new THREE.MeshBasicMaterial({ color: '#fff0d0', side: THREE.DoubleSide })
    );
    frontLight.position.set(0, 2, 6);
    frontLight.lookAt(0, 0, 0);
    envScene.add(frontLight);

    // Right side warm fill
    const rightLight = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: '#ffe0a0', side: THREE.DoubleSide })
    );
    rightLight.position.set(6, 2, 0);
    rightLight.rotation.y = -Math.PI / 2;
    envScene.add(rightLight);

    // Left side warm fill
    const leftLight = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: '#ffd890', side: THREE.DoubleSide })
    );
    leftLight.position.set(-6, 2, 0);
    leftLight.rotation.y = Math.PI / 2;
    envScene.add(leftLight);

    // Back warm accent
    const backLight = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 6),
      new THREE.MeshBasicMaterial({ color: '#ffe8b0', side: THREE.DoubleSide })
    );
    backLight.position.set(0, 3, -6);
    backLight.lookAt(0, 0, 0);
    envScene.add(backLight);

    // Warm floor (not too dark — reflects warm gold upward)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: '#8a7040', side: THREE.DoubleSide })
    );
    floor.position.set(0, -5, 0);
    floor.rotation.x = -Math.PI / 2;
    envScene.add(floor);

    const envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    scene.environment = envMap;

    // Cleanup env scene geometries & materials
    pmremGenerator.dispose();
    envScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });

    return () => {
      envMap.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  return null;
}

function PadlockModel() {
  const { scene } = useGLTF('/padlock.glb');
  const groupRef = useRef<THREE.Group>(null);
  
  // Interaction state
  const [hovered, setHover] = useState(false);
  // Change cursor to pointer when hovered
  useCursor(hovered);

  // Refs for smooth animation transitions
  const currentSpeed = useRef(0.35);
  const currentScale = useRef(0.71);

  // Clone scene to avoid mutation issues if reused
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smoothly interpolate rotation speed
      // Normal: 0.35, Hover: 2.0
      const targetSpeed = hovered ? 2.0 : 0.35;
      currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.1);
      
      groupRef.current.rotation.y += delta * currentSpeed.current;

      // Idle floating bob
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.06;

      // Smoothly interpolate base scale
      // Normal: 0.71, Hover: 0.82
      const targetScaleBase = hovered ? 0.82 : 0.71;
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScaleBase, 0.1);

      // Add subtle pulse ("breathing") to the smoothed base scale
      const s = currentScale.current + Math.sin(t * 0.8) * 0.012;
      groupRef.current.scale.setScalar(s);
    }
  });
  
  // Output mesh names for debugging
  useEffect(() => {
    console.log("Scene objects:", clonedScene);
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
         console.log("Mesh found:", child.name);
         const mesh = child as THREE.Mesh;
         
         // Define custom materials
         const goldMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#FFD700'),
            metalness: 1.0,
            roughness: 0.15,
            clearcoat: 0.1,
            envMapIntensity: 1.5,
         });

         const silverMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#C0C0C0'),
            metalness: 1.0,
            roughness: 0.2,
            clearcoat: 0.1,
            envMapIntensity: 1.5,
         });

         // Apply materials based on mesh names found in inspection
         // Guessing: 001 is Body (Gold), 002 is Shackle (Silver)
         if (mesh.name === 'Torus_Material001_0') {
             mesh.material = goldMaterial;
         } else if (mesh.name === 'Torus_Material002_0') {
             mesh.material = silverMaterial;
         }
      }
    });
  }, [clonedScene]);

  return (
    <primitive 
      object={clonedScene} 
      ref={groupRef} 
      position={[0, -0.5, 0]} 
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    />
  );
}

// Preload the model
useGLTF.preload('/padlock.glb');

/* ---------------------------------------------------------------
 *  Main Scene wrapper
 * --------------------------------------------------------------- */

export default function PadlockScene({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 4.5], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
            {/* Programmatic environment map for metallic reflections */}
            <SceneEnvironment />

            {/* Lighting */}
            <ambientLight intensity={0.25} />
            <directionalLight position={[4, 6, 5]} intensity={1.5} color="#FACC15" />
            <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#FDE68A" />
            <pointLight position={[0, -2, 4]} intensity={0.6} color="#ffffff" />
            
            {/* Back rim light for depth separation */}
            <pointLight position={[0, 1, -4]} intensity={0.4} color="#FFD700" />
            <spotLight
            position={[2, 4, 3]}
            angle={0.4}
            penumbra={0.5}
            intensity={0.8}
            color="#FFD700"
            />
            <hemisphereLight color="#FACC15" groundColor="#1a1a1a" intensity={0.35} />

            <PadlockModel />
        </Suspense>
      </Canvas>
    </div>
  );
}
