'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from 'postprocessing';

import { MutableRefObject } from 'react';

interface CarObject {
  mesh: THREE.Mesh;
  speed: number;
}

interface EffectOptions {
  onSpeedUp: () => void;
  onSlowDown: () => void;
  distortion: string;
  length: number;
  roadWidth: number;
  islandWidth: number;
  lanesPerRoad: number;
  fov: number;
  fovSpeedUp: number;
  speedUp: number;
  carLightsFade: number;
  totalSideLightSticks: number;
  lightPairsPerRoadWay: number;
  shoulderLinesWidthPercentage: number;
  brokenLinesWidthPercentage: number;
  brokenLinesLengthPercentage: number;
  lightStickWidth: [number, number];
  lightStickHeight: [number, number];
  movingAwaySpeed: [number, number];
  movingCloserSpeed: [number, number];
  carLightsLength: [number, number];
  carLightsRadius: [number, number];
  carWidthPercentage: [number, number];
  carShiftX: [number, number];
  carFloorSeparation: [number, number];
  colors: {
    roadColor: number;
    islandColor: number;
    background: number;
    shoulderLines: number;
    brokenLines: number;
    leftCars: number[];
    rightCars: number[];
    sticks: number;
  };
}

const Hyperspeed = ({
  effectOptions = {
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
      rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
      sticks: 0x03b3c3
    }
  }
}: { effectOptions?: EffectOptions }) => {
  const hyperspeed = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('Hyperspeed component mounted');
    if (!hyperspeed.current) {
      console.error('hyperspeed ref is null');
      return;
    }
    console.log('hyperspeed ref found, initializing Three.js');

    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      effectOptions.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    console.log('Setting renderer size:', window.innerWidth, 'x', window.innerHeight);
    if (hyperspeed.current) {
      hyperspeed.current.appendChild(renderer.domElement);
      console.log('Successfully appended renderer DOM element to container');
    } else {
      console.error('hyperspeed.current is null, cannot append renderer');
    }

    // Set background color
    scene.background = new THREE.Color(effectOptions.colors.background);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // Create roads and cars
    const roads: THREE.Mesh[] = [];
    const cars: CarObject[] = [];

    // Road geometry
    const roadGeometry = new THREE.PlaneGeometry(effectOptions.roadWidth, effectOptions.length);
    const roadMaterial = new THREE.MeshBasicMaterial({
      color: effectOptions.colors.roadColor,
      side: THREE.DoubleSide
    });

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = Math.PI / 2;
    road.position.y = -1;
    scene.add(road);
    roads.push(road);

    // Island geometry (middle strip)
    if (effectOptions.islandWidth > 0) {
      const islandGeometry = new THREE.PlaneGeometry(effectOptions.islandWidth, effectOptions.length);
      const islandMaterial = new THREE.MeshBasicMaterial({
        color: effectOptions.colors.islandColor,
        side: THREE.DoubleSide
      });

      const island = new THREE.Mesh(islandGeometry, islandMaterial);
      island.rotation.x = Math.PI / 2;
      island.position.y = -0.9;
      scene.add(island);
    }

    // Create lane markings
    for (let i = 0; i < effectOptions.lanesPerRoad; i++) {
      const lanePosition = ((i + 0.5) / effectOptions.lanesPerRoad - 0.5) * effectOptions.roadWidth;
      
      // Shoulder lines
      const shoulderGeometry = new THREE.PlaneGeometry(
        effectOptions.roadWidth * effectOptions.shoulderLinesWidthPercentage,
        effectOptions.length
      );
      const shoulderMaterial = new THREE.MeshBasicMaterial({
        color: effectOptions.colors.shoulderLines,
        side: THREE.DoubleSide
      });

      const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      leftShoulder.rotation.x = Math.PI / 2;
      leftShoulder.position.x = -effectOptions.roadWidth / 2 + effectOptions.roadWidth * effectOptions.shoulderLinesWidthPercentage / 2;
      leftShoulder.position.y = -0.95;
      scene.add(leftShoulder);

      const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      rightShoulder.rotation.x = Math.PI / 2;
      rightShoulder.position.x = effectOptions.roadWidth / 2 - effectOptions.roadWidth * effectOptions.shoulderLinesWidthPercentage / 2;
      rightShoulder.position.y = -0.95;
      scene.add(rightShoulder);

      // Broken lane lines
      if (i > 0) {
        const laneLineCount = Math.floor(effectOptions.length / (1 / effectOptions.brokenLinesLengthPercentage));
        const lineWidth = effectOptions.roadWidth * effectOptions.brokenLinesWidthPercentage;
        
        for (let j = 0; j < laneLineCount; j++) {
          const lineGeometry = new THREE.PlaneGeometry(lineWidth, 0.5);
          const lineMaterial = new THREE.MeshBasicMaterial({
            color: effectOptions.colors.brokenLines,
            side: THREE.DoubleSide
          });

          const laneLine = new THREE.Mesh(lineGeometry, lineMaterial);
          laneLine.rotation.x = Math.PI / 2;
          laneLine.position.x = lanePosition;
          laneLine.position.z = -effectOptions.length / 2 + j * (1 / effectOptions.brokenLinesLengthPercentage) + 0.25;
          laneLine.position.y = -0.98;
          scene.add(laneLine);
        }
      }
    }

    // Position camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Set up post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Add bloom effect
    const bloomEffect = new BloomEffect({
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.9,
      intensity: 1.5
    });
    composer.addPass(new EffectPass(camera, bloomEffect));

    // Animation variables
    let time = 0;
    let progress = 0;

    // Animation loop
    const animate = () => {
      if (!hyperspeed.current) {
        console.warn('Animation loop: hyperspeed ref is null');
        return;
      }
      
      time += 0.01;
      progress += 0.005;
      
      console.log(`Animation frame: time=${time.toFixed(2)}, progress=${progress.toFixed(2)}`);
      
      // Move camera forward to simulate movement
      camera.position.z -= 0.5;
      if (camera.position.z < -effectOptions.length / 2) {
        camera.position.z = effectOptions.length / 2;
      }
      
      // Rotate camera slightly for dynamic effect
      camera.position.x = Math.sin(time * 0.5) * 0.5;
      camera.lookAt(camera.position.x, 0, camera.position.z - 5);
      
      // Update any moving elements here
      // For example, create and move car lights
      if (cars.length < 20 && Math.random() > 0.95) {
        console.log('Creating new car');
        // Create a car light
        const carGeometry = new THREE.SphereGeometry(
          Math.random() * (effectOptions.carLightsRadius[1] - effectOptions.carLightsRadius[0]) + effectOptions.carLightsRadius[0],
          8,
          8
        );
        
        // Randomly choose left or right side
        const isLeft = Math.random() > 0.5;
        const colorArray = isLeft ? effectOptions.colors.leftCars : effectOptions.colors.rightCars;
        const color = new THREE.Color(colorArray[Math.floor(Math.random() * colorArray.length)]);
        
        const carMaterial = new THREE.MeshBasicMaterial({ color });
        const car = new THREE.Mesh(carGeometry, carMaterial);
        
        // Position on road
        const lanePosition = ((Math.random() * effectOptions.lanesPerRoad) / effectOptions.lanesPerRoad - 0.5) * effectOptions.roadWidth;
        car.position.x = lanePosition + (isLeft ? -effectOptions.roadWidth/4 : effectOptions.roadWidth/4);
        car.position.y = -0.5;
        car.position.z = Math.random() * effectOptions.length - effectOptions.length/2;
        
        scene.add(car);
        cars.push({ mesh: car, speed: isLeft ? 0.8 : -0.8 });
      }

      // Move existing cars
      for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        car.mesh.position.z += car.speed;
        
        // Remove cars that are out of view
        if (Math.abs(car.mesh.position.z) > effectOptions.length / 2) {
          scene.remove(car.mesh);
          cars.splice(i, 1);
        }
      }
      
      // Render the scene
      composer.render();
      
      // Continue animation loop
      requestAnimationFrame(animate);
    };

    console.log('Preparing to start animation loop');
    
    // Delay animation start to ensure browser has painted the scene
    setTimeout(() => {
      console.log('Starting animation loop after timeout');
      // Start animation
      animate();
      
      // Set loaded state after a small delay to ensure everything is initialized
      setTimeout(() => {
        setIsLoaded(true);
        console.log('Hyperspeed scene loaded and ready');
      }, 100);
    }, 0);

    // Handle window resize
    const handleResize = () => {
      console.log('Window resize event triggered');
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      console.log('Cleaning up Hyperspeed component');
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
        console.log('Renderer disposed');
      }
      if (composer) {
        composer.passes.forEach(pass => {
          if (pass.dispose) pass.dispose();
        });
        console.log('Composer disposed');
      }
      // Clean up scene objects
      scene.traverse((object: THREE.Object3D) => {
        if ('geometry' in object && (object as THREE.Mesh).geometry) {
          (object as THREE.Mesh).geometry.dispose();
        }
        if ('material' in object && (object as THREE.Mesh).material) {
          const material = (object as THREE.Mesh).material;
          if (Array.isArray(material)) {
            material.forEach((mat: THREE.Material) => mat.dispose());
          } else {
            (material as THREE.Material).dispose();
          }
        }
      });
      console.log('Scene objects cleaned up');
    };
  }, []);

  return (
    <>
      <div ref={hyperspeed} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1, pointerEvents: 'none' }} />
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#0a0a0a',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#00f3ff',
          fontSize: '1.2rem',
          fontWeight: 'bold'
        }}>
          Loading HyperSpeed...
        </div>
      )}
    </>
  );
};

export default Hyperspeed;