import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { gsap } from "gsap";
import indiaMap from "../assets/india_map.webp";

export function useThreeScene() {
  const mountRef = useRef();
  const canvasRef = useRef();
  const textureRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene + Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 100, 150); // start in front of plane
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // FlyControls
    const controls = new FlyControls(camera, renderer.domElement);
    controls.movementSpeed = 30;
    controls.rollSpeed = Math.PI / 6;
    controls.dragToLook = true;
    controls.autoForward = false;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(50, 100, 50);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(500, 100, 0x00ffcc, 0x333333);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Plane with India Map
    let plane;
    const loader = new THREE.TextureLoader();
    loader.load(indiaMap, (texture) => {
      const aspect = texture.image.width / texture.image.height;
      const planeWidth = 200;
      const planeHeight = planeWidth / aspect;

      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI / 2; // horizontal
      plane.position.set(0, 0, 0);
      scene.add(plane);

      scene.userData.plane = plane;
    });

    // Example objects
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    cube.position.set(10, 1, 0);
    scene.add(cube);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
    sphere.position.set(-10, 1, 0);
    scene.add(sphere);

    // Optional text canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    canvasRef.current = ctx;

    const textTexture = new THREE.CanvasTexture(canvas);
    textTexture.minFilter = THREE.LinearFilter;
    textureRef.current = textTexture;

    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(canvas.width / 100, canvas.height / 100),
      new THREE.MeshBasicMaterial({
        map: textTexture,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    textPlane.position.z = 5;
    scene.add(textPlane);

    // Raycaster for hover + click-to-zoom
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      mouse.x = (event.clientX / mount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / mount.clientHeight) * 2 + 1;

      if (!plane) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane);
      document.body.style.cursor = intersects.length > 0 ? "pointer" : "default";
    }

    function onClick(event) {
      mouse.x = (event.clientX / mount.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / mount.clientHeight) * 2 + 1;

      if (!plane) return;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        // Animate camera to point
        gsap.to(camera.position, {
        x: point.x + 20,   // stay slightly away
        y: point.y + 20,   // keep some height
        z: point.z + 20,   // pull back a little
        duration: 1.5,
        onUpdate: () => camera.lookAt(point),
    });
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    // Animate loop
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      controls.update(delta);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount && renderer.domElement) mount.removeChild(renderer.domElement);
    };
  }, []);

  return { mountRef, canvasRef, textureRef };
}
