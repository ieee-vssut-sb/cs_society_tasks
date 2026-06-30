import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const get3DCoords = (lat, lon, r) => {
  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  const x = r * Math.cos(latRad) * Math.cos(lonRad);
  const y = r * Math.sin(latRad);
  const z = -r * Math.cos(latRad) * Math.sin(lonRad);

  return new THREE.Vector3(x, y, z);
};

export default function Globe3D({ friend1, friend2 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const globeRef = useRef(null);
  const animationFrameRef = useRef(null);

  const markersRef = useRef([]);
  const arcRef = useRef(null);
  const beamRef = useRef(null);
  const beamProgressRef = useRef(0);
  const curvePointsRef = useRef([]);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0, y: 0.5 });

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 12.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    globeRef.current = globeGroup;
    scene.add(globeGroup);

    const globeRadius = 5.0;

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

    const sphereGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 10,
    });
    const solidGlobe = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(solidGlobe);

    const wireframeGeo = new THREE.SphereGeometry(globeRadius + 0.02, 24, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const wireframeGlobe = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeGlobe);

    const ringGeo = new THREE.RingGeometry(globeRadius + 0.05, globeRadius + 0.08, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff6b00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.1,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    globeGroup.add(ring1);

    const glowGeo = new THREE.SphereGeometry(globeRadius + 0.3, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    const glowShell = new THREE.Mesh(glowGeo, glowMat);
    globeGroup.add(glowShell);

    const continents = [
      { name: 'ASIA', lat: 35, lon: 95 },
      { name: 'AFRICA', lat: 5, lon: 20 },
      { name: 'EUROPE', lat: 50, lon: 15 },
      { name: 'N. AMERICA', lat: 40, lon: -100 },
      { name: 'S. AMERICA', lat: -15, lon: -60 },
      { name: 'AUSTRALIA', lat: -25, lon: 135 },
      { name: 'ANTARCTICA', lat: -80, lon: 0 }
    ];

    const createTextSprite = (text) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 256, 64);
      
      ctx.font = 'Bold 28px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
      ctx.fillText(text, 128, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.4, 0.6, 1);
      return sprite;
    };

    continents.forEach((c) => {
      const p = get3DCoords(c.lat, c.lon, globeRadius + 0.1);
      const sprite = createTextSprite(c.name);
      sprite.position.copy(p);
      globeGroup.add(sprite);
    });

    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const r = globeRadius + 5 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 1] = r * Math.cos(phi);
      starPositions[i + 2] = r * Math.sin(phi) * Math.cos(theta);

      const mix = Math.random();
      starColors[i] = 1.0;
      starColors[i + 1] = mix * 0.4 + 0.5;
      starColors[i + 2] = mix * 0.1;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      map: pTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    const animate = () => {
      if (!isDraggingRef.current) {
        globeGroup.rotation.y += 0.003;
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotationRef.current.x, 0.05);
      } else {
        globeGroup.rotation.y = THREE.MathUtils.lerp(globeGroup.rotation.y, targetRotationRef.current.y, 0.15);
        globeGroup.rotation.x = THREE.MathUtils.lerp(globeGroup.rotation.x, targetRotationRef.current.x, 0.15);
      }

      starfield.rotation.y -= 0.0005;

      if (beamRef.current && curvePointsRef.current.length > 0) {
        beamProgressRef.current += 0.015;
        if (beamProgressRef.current > 1.0) {
          beamProgressRef.current = 0;
        }

        const pointIndex = Math.floor(beamProgressRef.current * (curvePointsRef.current.length - 1));
        const currentPos = curvePointsRef.current[pointIndex];
        if (currentPos) {
          beamRef.current.position.copy(currentPos);
        }
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y = globeGroup.rotation.y + deltaX * 0.007;
      targetRotationRef.current.x = THREE.MathUtils.clamp(
        globeGroup.rotation.x + deltaY * 0.007,
        -Math.PI / 3,
        Math.PI / 3
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomAmount = e.deltaY * 0.01;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + zoomAmount, 7, 20);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      if (earthTexture) earthTexture.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    const globeGroup = globeRef.current;
    if (!scene || !globeGroup) return;

    markersRef.current.forEach((obj) => globeGroup.remove(obj));
    markersRef.current = [];

    if (arcRef.current) {
      globeGroup.remove(arcRef.current);
      arcRef.current = null;
    }
    if (beamRef.current) {
      globeGroup.remove(beamRef.current);
      beamRef.current = null;
    }
    curvePointsRef.current = [];

    const globeRadius = 5.0;

    let p1 = null;
    if (friend1 && friend1.lat !== undefined && friend1.lon !== undefined) {
      p1 = get3DCoords(friend1.lat, friend1.lon, globeRadius);

      const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        transparent: false,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(p1);
      globeGroup.add(marker);
      markersRef.current.push(marker);

      const ringGeo = new THREE.RingGeometry(0.1, 0.35, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6b00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(p1);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.position.addScaledVector(p1.clone().normalize(), 0.05);
      globeGroup.add(ring);
      markersRef.current.push(ring);
    }

    let p2 = null;
    if (friend2 && friend2.lat !== undefined && friend2.lon !== undefined) {
      p2 = get3DCoords(friend2.lat, friend2.lon, globeRadius);

      const markerGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: false,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(p2);
      globeGroup.add(marker);
      markersRef.current.push(marker);

      const ringGeo = new THREE.RingGeometry(0.1, 0.35, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(p2);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.position.addScaledVector(p2.clone().normalize(), 0.05);
      globeGroup.add(ring);
      markersRef.current.push(ring);
    }

    if (p1 && p2) {
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const pullFactor = 1.0 + distance * 0.25;
      midPoint.normalize().multiplyScalar(globeRadius * pullFactor);

      const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
      const curvePoints = curve.getPoints(50);
      curvePointsRef.current = curvePoints;

      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.6,
        linewidth: 1.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);
      arcRef.current = line;

      const beamGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: false,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.copy(p1);
      globeGroup.add(beam);
      beamRef.current = beam;
      beamProgressRef.current = 0;

      const focusTarget = new THREE.Vector3().addVectors(p1, p2).normalize();
      const targetAngleY = Math.atan2(focusTarget.x, focusTarget.z);
      globeGroup.rotation.y = targetAngleY;
      
      const targetAngleX = -Math.asin(focusTarget.y);
      globeGroup.rotation.x = THREE.MathUtils.clamp(targetAngleX, -Math.PI / 4, Math.PI / 4);
    }
  }, [friend1, friend2]);

  return (
    <div className="w-full h-full relative select-none">
      <div 
        ref={containerRef} 
        className="w-full h-full canvas-container absolute inset-0 cursor-grab active:cursor-grabbing"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none text-xs text-orange-400 bg-orange-950/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-500/20">
        <svg className="w-3.5 h-3.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        Drag to Rotate Globe • Scroll to Zoom
      </div>
    </div>
  );
}
