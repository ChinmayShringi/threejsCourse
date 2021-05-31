import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import { Mesh } from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Font
 */

const fontLoader = new THREE.FontLoader();

fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new THREE.TextBufferGeometry("SUP!", {
    font,
    size: 0.5,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5,
  });
  //   To center
  //   textGeometry.computeBoundingBox();
  //   textGeometry.translate(
  //     -textGeometry.boundingBox.max.x / 2,
  //     -textGeometry.boundingBox.max.y / 2,
  //     -textGeometry.boundingBox.max.z / 2
  //   );
  textGeometry.center();
  const material = new THREE.MeshNormalMaterial();
  const text = new THREE.Mesh(textGeometry, material);
  scene.add(text);

  const donutGrometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45);

  for (let i = 0; i < 1000; i++) {
    const donut = new THREE.Mesh(donutGrometry, material);

    donut.position.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    );

    donut.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    let scale = Math.random() / 2;
    donut.scale.set(scale, scale, scale);
    scene.add(donut);
  }
});

/**
 * Object
 */
// const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
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

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
