"use client";

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ---------------------------------------------------------------
 *  Procedural 3D Padlock – metallic gold finish with a
 *  programmatic environment map for shiny reflections.
 *  No external HDR downloads – everything is self-contained.
 * --------------------------------------------------------------- */

/** Creates a simple gradient cubemap texture for metallic reflections */
function useEnvMap() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Warm studio-like gradient for gold reflections
    const faces: THREE.Texture[] = [];
    const colors = [
      ['#3a3020', '#6b5a30', '#f5e6c8'], // +x warm right
      ['#2a2018', '#5a4a28', '#e8d4b0'], // -x warm left
      ['#f5e6c8', '#ffe8a0', '#fff5dc'], // +y bright top (sky/lights)
      ['#1a1510', '#2a2018', '#3a2a18'], // -y dark bottom (floor)
      ['#3a3020', '#8a7a50', '#f0dca0'], // +z warm front
      ['#2a2018', '#5a4a28', '#d8c490'], // -z warm back
    ];

    for (const [c1, c2, c3] of colors) {
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, c3);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c1);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Add some bright spots to simulate studio lights
      ctx.fillStyle = 'rgba(255, 240, 200, 0.3)';
      ctx.beginPath();
      ctx.arc(size * 0.3, size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.7, size * 0.4, size * 0.1, 0, Math.PI * 2);
      ctx.fill();

      const tex = new THREE.CanvasTexture(canvas);
      faces.push(tex);
    }

    // Create a CubeTexture from the 6 canvas faces
    const cubeRT = new THREE.WebGLCubeRenderTarget(size);
    // Use a simpler approach: set scene environment via PMREMGenerator
    return { faces, size };
  }, []);
}

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

    // Cleanup
    pmremGenerator.dispose();

    return () => {
      envMap.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  return null;
}

function PadlockBody() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.6, h = 1.4, r = 0.25;
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const extrudeSettings = {
      depth: 0.65,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.08,
      bevelThickness: 0.05,
    };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.computeVertexNormals();
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#F5B800'),
        metalness: 1.0,
        roughness: 0.15,
        envMapIntensity: 1.8,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
      }),
    []
  );

  return <mesh geometry={geometry} material={material} position={[0, -0.2, 0]} />;
}

function PadlockShackle() {
  const geometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.4, 0, 0),
      new THREE.Vector3(-0.4, 0.7, 0),
      new THREE.Vector3(-0.3, 1.05, 0),
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(0.3, 1.05, 0),
      new THREE.Vector3(0.4, 0.7, 0),
      new THREE.Vector3(0.4, 0, 0),
    ]);
    return new THREE.TubeGeometry(path, 24, 0.11, 12, false);
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#C8C8CC'),
        metalness: 1.0,
        roughness: 0.08,
        envMapIntensity: 2.0,
        clearcoat: 0.5,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0,
      }),
    []
  );

  return <mesh geometry={geometry} material={material} position={[0, 0.5, 0]} />;
}

function Keyhole() {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#1a1a1a'),
        metalness: 0.6,
        roughness: 0.4,
        envMapIntensity: 0.8,
      }),
    []
  );

  return (
    <group position={[0, -0.3, 0.38]}>
      <mesh material={material}>
        <circleGeometry args={[0.13, 24]} />
      </mesh>
      <mesh position={[0, -0.15, 0]} material={material}>
        <planeGeometry args={[0.1, 0.22]} />
      </mesh>
    </group>
  );
}

function GoldKey() {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#F5B800'),
        metalness: 1.0,
        roughness: 0.18,
        envMapIntensity: 1.6,
        clearcoat: 0.25,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
      }),
    []
  );

  return (
    <group position={[0.9, -0.75, 0.25]} rotation={[0, 0, -0.6]}>
      <mesh material={material}>
        <torusGeometry args={[0.18, 0.04, 12, 24]} />
      </mesh>
      <mesh position={[0, -0.4, 0]} material={material}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
      </mesh>
      <mesh position={[0.06, -0.6, 0]} material={material}>
        <boxGeometry args={[0.1, 0.06, 0.04]} />
      </mesh>
      <mesh position={[0.05, -0.52, 0]} material={material}>
        <boxGeometry args={[0.08, 0.05, 0.04]} />
      </mesh>
    </group>
  );
}

function PadlockGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <PadlockBody />
      <PadlockShackle />
      <Keyhole />
      <GoldKey />
    </group>
  );
}

/* ---------------------------------------------------------------
 *  Main Scene wrapper
 * --------------------------------------------------------------- */

export default function PadlockScene({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.3, 3.8], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        {/* Programmatic environment map for metallic reflections */}
        <SceneEnvironment />

        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} color="#FACC15" />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#FDE68A" />
        <pointLight position={[0, -2, 4]} intensity={0.6} color="#ffffff" />
        <spotLight
          position={[2, 4, 3]}
          angle={0.4}
          penumbra={0.5}
          intensity={0.8}
          color="#FFD700"
        />
        <hemisphereLight color="#FACC15" groundColor="#1a1a1a" intensity={0.35} />

        <PadlockGroup />
      </Canvas>
    </div>
  );
}
