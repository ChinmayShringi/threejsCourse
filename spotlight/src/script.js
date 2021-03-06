import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * SpotLight
 */
const spotLight = new THREE.SpotLight(
  0x78ff00,
  5, //intensity
  18, //distance
  Math.PI * 0.2, //angle
  0.25,
  -10
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);
scene.add(spotLight.target);

/**
 * Object
 */
const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 1, 0);
scene.add(mesh);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Plane
 */

const plane = new THREE.Mesh(
  new THREE.BoxGeometry(5, 0.2, 5),
  new THREE.MeshStandardMaterial({ color: 0x444444 })
);
scene.add(plane);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 3, 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // spotlight target move
  //   spotLight.target.position.x = Math.random() * elapsedTime;
  //   gsap.to(spotLight.target.position, 1, {
  //     x: Math.random() + Math.PI * 0.1,
  //     y: Math.random() + Math.PI * 0.1,
  //   });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
