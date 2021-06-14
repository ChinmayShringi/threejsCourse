import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";

/**
 * Base
 */
const parameters = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, 1, { y: mesh.rotation.y + Math.PI * 2 });
  },
};
/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const displcementTexture = textureLoader.load("/textures/displacementMap.png");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Object
 */
const cube = new THREE.Mesh(
  new THREE.BoxBufferGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial()
);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(-5, 0, 0);
scene.add(cube);

const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotBufferGeometry(1, 0.4, 128, 32),
  new THREE.MeshStandardMaterial()
);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
scene.add(torusKnot);

const sphere = new THREE.Mesh(
  new THREE.SphereBufferGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial()
);
sphere.position.set(5, 0, 0);
sphere.receiveShadow = true;
sphere.castShadow = true;
scene.add(sphere);

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(10, 10),
  new THREE.MeshStandardMaterial()
);
floor.position.set(0, -2, 0);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.castShadow = true;
scene.add(floor);

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
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, 2.25);
scene.add(directionalLight);

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
camera.position.set(2, 2, 6);
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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
/**
 * Debug
 */
const gui = new dat.GUI({
  // closed: true,
  width: 400,
});
// gui.hide()

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  //   Torus Rotate
  torusKnot.rotation.y = elapsedTime * 0.1;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Tips
 */
//  Tip 4
// console.log(renderer.info);
//  Tip 6
// scene.remove(cube)
// cube.geometry.dispose()
// cube.material.dispose()
// Tip 10
// directionalLight.shadow.camera.top = 3;
// directionalLight.shadow.camera.right = 6;
// directionalLight.shadow.camera.left = -6;
// directionalLight.shadow.camera.bottom = -3;
// directionalLight.shadow.camera.far = 10;
// directionalLight.shadow.mapSize.set(1024, 1024);

// const camerahelper = new THREE.CameraHelper(
//   directionalLight / directionalLight.shadow.camera
// );
