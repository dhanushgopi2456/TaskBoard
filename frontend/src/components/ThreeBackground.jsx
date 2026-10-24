import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ darkMode }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Dynamic Geometry group
    const group = new THREE.Group();
    scene.add(group);

    // Floating 3D geometric shapes
    const shapes = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1.6, 0),
      new THREE.TorusGeometry(1.4, 0.45, 16, 32),
      new THREE.OctahedronGeometry(1.3, 0),
      new THREE.TetrahedronGeometry(1.5, 0),
      new THREE.DodecahedronGeometry(1.2, 0),
      new THREE.TorusKnotGeometry(0.9, 0.3, 64, 16),
    ];

    // Rich colors for dark and light
    const darkColors = [0x6366f1, 0x8b5cf6, 0xec4899, 0x3b82f6, 0x14b8a6, 0xf59e0b];
    const lightColors = [0x818cf8, 0xa78bfa, 0xf472b6, 0x60a5fa, 0x2dd4bf, 0xfbbf24];
    const colors = darkMode ? darkColors : lightColors;

    for (let i = 0; i < 20; i++) {
      const geom = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: darkMode ? 0.7 : 0.25,
        roughness: darkMode ? 0.15 : 0.35,
        wireframe: i % 2 === 0,
        transparent: true,
        opacity: darkMode ? (i % 2 === 0 ? 0.3 : 0.45) : (i % 2 === 0 ? 0.22 : 0.32),
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.x = (Math.random() - 0.5) * 50;
      mesh.position.y = (Math.random() - 0.5) * 38;
      mesh.position.z = (Math.random() - 0.5) * 22 - 6;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      const scale = 0.65 + Math.random() * 0.85;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        rotX: (Math.random() - 0.5) * 0.007,
        rotY: (Math.random() - 0.5) * 0.007,
        floatSpeed: 0.001 + Math.random() * 0.0018,
        floatOffset: Math.random() * Math.PI * 2,
        initialY: mesh.position.y,
      };

      shapes.push(mesh);
      group.add(mesh);
    }

    // Particle constellation with smooth depth
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 65;
      positions[i + 1] = (Math.random() - 0.5) * 55;
      positions[i + 2] = (Math.random() - 0.5) * 35;
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: darkMode ? 0xc7d2fe : 0x6366f1,
      size: 0.22,
      transparent: true,
      opacity: darkMode ? 0.65 : 0.45,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Multi-source cinematic lights
    const ambientLight = new THREE.AmbientLight(0xffffff, darkMode ? 0.9 : 1.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x818cf8, darkMode ? 2.8 : 2.2);
    dirLight1.position.set(20, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, darkMode ? 2.2 : 1.5);
    dirLight2.position.set(-20, -15, 15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, darkMode ? 2 : 1.2, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Mouse interaction tracking with gentle lerp
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / group parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.045;
      currentMouseY += (targetMouseY - currentMouseY) * 0.045;

      group.rotation.y = currentMouseX * 0.3 + elapsedTime * 0.015;
      group.rotation.x = currentMouseY * 0.2;

      particles.rotation.y = elapsedTime * 0.008;
      particles.rotation.x = elapsedTime * 0.004;

      // Animate 3D geometric meshes
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        shape.rotation.x += shape.userData.rotX;
        shape.rotation.y += shape.userData.rotY;
        shape.position.y =
          shape.userData.initialY +
          Math.sin(elapsedTime * 0.75 + shape.userData.floatOffset) * 1.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [darkMode]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
