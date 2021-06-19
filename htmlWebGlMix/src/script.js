import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { gsap } from "gsap";
/**
 * Base
 */
const gui = new dat.GUI();
const debugObject = {};
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Update all Materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      // child.material.envMap = envMap;
      child.material.envMapIntensity = debugObject.envMapIntensity;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * GLTF MODELS
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
var loadingBarElement = document.querySelector(".loading-bar");

/**Loaders
 *
 */
const loadingManager = new THREE.LoadingManager(
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = ``;
    });
    // window.setTimeout(() => {
    //   // loaded
    //   gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
    //   loadingBarElement.classList.add("ended");
    //   loadingBarElement.style.transform = ``;
    // }, 500);
  },
  (itemUrl, itemLoaded, itemsTotal) => {
    // assets Loaded progress
    const progressRatio = itemLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);
const gltfLoader = new GLTFLoader(loadingManager);
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

// load env
const envMap = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
]);
envMap.encoding = THREE.sRGBEncoding;
scene.background = envMap;
scene.environment = envMap;
debugObject.envMapIntensity = 5;
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// load Model
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("/models/FlightHelmet/glTF/FlightHelmet.gltf", (gltf) => {
  // gltfLoader.load("/models/hamburger.glb", (gltf) => {
  gltf.scene.scale.set(5, 5, 5);
  gltf.scene.position.set(0, 0, 0);
  gltf.scene.rotation.y = Math.PI * 0.5;
  scene.add(gltf.scene);
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("rotation");
  updateAllMaterials();
});

/**Points
 *
 */
const points = [
  {
    position: new THREE.Vector3(1.55, 0.3, -0.6),
    element: document.querySelector(".point-0"),
  },
];

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

/**Overlay
 *
 */
const overlatGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uAlpha: { value: 1 },
  },
  transparent: true,
  vertexShader: `
  void main(){
    gl_Position = vec4(position,1.0);
  }`,
  fragmentShader: `
  uniform float uAlpha;
  void main() {
    gl_FragColor =vec4(0.0,0.0,0.0,uAlpha);
  }
  `,
});
const overlay = new THREE.Mesh(overlatGeometry, overlayMaterial);
scene.add(overlay);

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
camera.position.set(3, 5, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

gui
  .add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reunhard: THREE.ReinhardToneMapping,
    Cinenon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping);
    updateAllMaterials();
  });
gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

/**
 * Light
 */

const directionLight = new THREE.DirectionalLight(0xffffff, 3);
directionLight.position.set(0.25, 3, -2.25);
directionLight.castShadow = true;
directionLight.shadow.camera.far = 15;
directionLight.shadow.mapSize.set(1024, 1024);
directionLight.shadow.normalBias = 0.05;
scene.add(directionLight);

// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionLight.shadow.camera
// );
// scene.add(directionalLightCameraHelper);

/**
 * Debug
 */
gui
  .add(directionLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity");
gui.add(directionLight.position, "x").min(-5).max(5).step(0.001).name("lightX");
gui.add(directionLight.position, "y").min(-5).max(5).step(0.001).name("lightY");
gui.add(directionLight.position, "z").min(-5).max(5).step(0.001).name("lightZ");
/**
 * Animate
 */
const clock = new THREE.Clock();
let oldTime = 0;
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldTime;
  oldTime = elapsedTime;

  // Clone points
  for (const point of points) {
    const screenPosition = point.position.clone();
    screenPosition.project(camera);

    const translateX = screenPosition.x * sizes.width * 0.5;
    const translateY = -screenPosition.y * sizes.height * 0.5;
    point.element.style.transform = `translate(${translateX}px ,${translateY}px)`;
  }
  // Update controls
  controls.update();
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
