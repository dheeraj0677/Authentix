import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground3D({ theme = 'dark' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera & Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 32;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color definitions based on theme
    const isDark = theme === 'dark';
    const primaryColor = isDark ? 0x10b981 : 0x059669; // Emerald
    const secondaryColor = isDark ? 0x06b6d4 : 0x0284c7; // Cyan
    const accentColor = isDark ? 0xa855f7 : 0x7c3aed; // Purple
    const goldColor = isDark ? 0xf59e0b : 0xd97706; // Amber

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(isDark ? 0x1e293b : 0xe2e8f0, isDark ? 1.2 : 2.0);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(primaryColor, isDark ? 3.5 : 2.2, 80);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondaryColor, isDark ? 3.0 : 2.0, 80);
    pointLight2.position.set(-20, -15, 15);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(accentColor, isDark ? 2.5 : 1.8, 80);
    pointLight3.position.set(0, -20, 25);
    scene.add(pointLight3);

    // Group for all floating objects
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Floating objects metadata
    const floatingObjects = [];

    // Helper to create wireframe & solid hybrid floating objects
    const createFloatingObject = (geometry, color, wireColor, initialPos, scale = 1, isWireframeOnly = false) => {
      const objGroup = new THREE.Group();

      if (!isWireframeOnly) {
        // Inner translucent solid mesh
        const solidMaterial = new THREE.MeshPhysicalMaterial({
          color: color,
          transparent: true,
          opacity: isDark ? 0.22 : 0.15,
          roughness: 0.2,
          metalness: 0.1,
          transmission: 0.6,
          ior: 1.4,
        });
        const solidMesh = new THREE.Mesh(geometry, solidMaterial);
        objGroup.add(solidMesh);
      }

      // Outer glowing wireframe mesh
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: wireColor,
        wireframe: true,
        transparent: true,
        opacity: isDark ? 0.65 : 0.45,
      });
      const wireMesh = new THREE.Mesh(geometry, wireMaterial);
      objGroup.add(wireMesh);

      objGroup.position.set(initialPos.x, initialPos.y, initialPos.z);
      objGroup.scale.set(scale, scale, scale);

      objectsGroup.add(objGroup);

      floatingObjects.push({
        group: objGroup,
        basePos: { ...initialPos },
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.012,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.01,
        },
        floatSpeed: 0.001 + Math.random() * 0.0015,
        floatDistance: 1.5 + Math.random() * 2.5,
        floatPhase: Math.random() * Math.PI * 2,
      });

      return objGroup;
    };

    // Geometries
    const icosahedronGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const detailIcosahedronGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const boxGeo = new THREE.BoxGeometry(2.6, 2.6, 2.6);
    const smallBoxGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const octahedronGeo = new THREE.OctahedronGeometry(2.2, 0);
    const torusGeo = new THREE.TorusGeometry(2.2, 0.6, 12, 28);
    const tetrahedronGeo = new THREE.TetrahedronGeometry(2.0, 0);

    // Spawn 3D Flying Objects across depth
    // 1. Neural Icosahedrons (Top Left & Bottom Right)
    createFloatingObject(icosahedronGeo, primaryColor, primaryColor, { x: -22, y: 12, z: -5 }, 1.3);
    createFloatingObject(detailIcosahedronGeo, secondaryColor, secondaryColor, { x: 24, y: -10, z: -8 }, 1.4);

    // 2. Cryptographic Blockchain Cubes
    createFloatingObject(boxGeo, secondaryColor, secondaryColor, { x: 20, y: 14, z: -10 }, 1.2);
    createFloatingObject(smallBoxGeo, primaryColor, primaryColor, { x: -18, y: -12, z: -2 }, 1.1);
    createFloatingObject(boxGeo, accentColor, accentColor, { x: -28, y: -2, z: -15 }, 1.5);

    // 3. Cyber Octahedrons & Diamonds
    createFloatingObject(octahedronGeo, goldColor, goldColor, { x: 14, y: -16, z: 2 }, 1.0);
    createFloatingObject(octahedronGeo, primaryColor, primaryColor, { x: -12, y: 18, z: -12 }, 1.2);

    // 4. Toruses (Rotating rings)
    createFloatingObject(torusGeo, accentColor, accentColor, { x: -6, y: -18, z: -10 }, 1.1);
    createFloatingObject(torusGeo, secondaryColor, secondaryColor, { x: 26, y: 2, z: -6 }, 1.2);

    // 5. Tetrahedrons (Floating prisms)
    createFloatingObject(tetrahedronGeo, primaryColor, primaryColor, { x: 8, y: 18, z: -8 }, 1.1);
    createFloatingObject(tetrahedronGeo, goldColor, goldColor, { x: -25, y: -18, z: -8 }, 1.2);

    // 6. Deep background faint objects
    createFloatingObject(icosahedronGeo, secondaryColor, secondaryColor, { x: 0, y: 22, z: -25 }, 2.0, true);
    createFloatingObject(boxGeo, accentColor, accentColor, { x: -15, y: -25, z: -22 }, 1.8, true);

    // Starfield / Cyber Dust Particle Field
    const particleCount = isDark ? 280 : 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const pColor1 = new THREE.Color(primaryColor);
    const pColor2 = new THREE.Color(secondaryColor);
    const pColor3 = new THREE.Color(accentColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 90;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 60;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 50;

      const choice = Math.random();
      const chosenColor = choice < 0.45 ? pColor1 : choice < 0.8 ? pColor2 : pColor3;
      particleColors[i3] = chosenColor.r;
      particleColors[i3 + 1] = chosenColor.g;
      particleColors[i3 + 2] = chosenColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle Material
    const particleMaterial = new THREE.PointsMaterial({
      size: isDark ? 0.4 : 0.35,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.75 : 0.5,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Parallax & Gyro tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const handleMouseMove = (event) => {
      mouse.targetX = (event.clientX - windowHalfX) * 0.0008;
      mouse.targetY = (event.clientY - windowHalfY) * 0.0008;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    // Render / Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Subtle camera parallax tilt
      camera.position.x = mouse.x * 12;
      camera.position.y = -mouse.y * 12;
      camera.lookAt(0, 0, 0);

      // Animate floating 3D objects
      for (let i = 0; i < floatingObjects.length; i++) {
        const obj = floatingObjects[i];
        
        // Multi-axis rotation
        obj.group.rotation.x += obj.rotSpeed.x;
        obj.group.rotation.y += obj.rotSpeed.y;
        obj.group.rotation.z += obj.rotSpeed.z;

        // Floating sinusoidal wave in Y and X
        const wave = Math.sin(elapsedTime * 0.8 + obj.floatPhase);
        const waveCos = Math.cos(elapsedTime * 0.6 + obj.floatPhase);
        obj.group.position.y = obj.basePos.y + wave * obj.floatDistance;
        obj.group.position.x = obj.basePos.x + waveCos * (obj.floatDistance * 0.35);
      }

      // Rotate particle dust field slowly
      particles.rotation.y = elapsedTime * 0.025;
      particles.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount or theme change
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js resources
      icosahedronGeo.dispose();
      detailIcosahedronGeo.dispose();
      boxGeo.dispose();
      smallBoxGeo.dispose();
      octahedronGeo.dispose();
      torusGeo.dispose();
      tetrahedronGeo.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
