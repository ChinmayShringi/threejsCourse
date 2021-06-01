import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as dat from "dat.gui";
import CANNON from "cannon";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Texture
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const envMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 */
// World
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Material
const defaultMaterial = new CANNON.Material("default");

const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultMaterial;
// Sphere
const sphereShape = new CANNON.Sphere(0.5);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 3, 0),
  shape: sphereShape,
  material: defaultMaterial,
});
sphereBody.applyLocalForce(
  new CANNON.Vec3(150, 0, 0),
  new CANNON.Vec3(0, 0, 0)
);
world.addBody(sphereBody);

// floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.material = defaultMaterial;
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);
world.addBody(floorBody);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: envMapTexture,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Object
 */
const geometry = new THREE.SphereBufferGeometry(0.5, 32, 32);
const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: envMapTexture,
});
const sphere = new THREE.Mesh(geometry, material);
sphere.castShadow = true;
sphere.position.y = 0.5;
scene.add(sphere);

/**
 * Light
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionLight.castShadow = true;
directionLight.shadow.mapSize.set(1024, 1024);
directionLight.shadow.camera.far = 15;
directionLight.shadow.camera.left = -7;
directionLight.shadow.camera.top = 7;
directionLight.shadow.camera.right = 7;
directionLight.shadow.camera.bottom = -7;
directionLight.position.set(5, 5, 5);
scene.add(directionLight);

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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;
  // Update controls
  controls.update();

  // Update Physics world
  sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);

  world.step(1 / 60, deltaTime, 3);

  sphere.position.copy(sphereBody.position);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
