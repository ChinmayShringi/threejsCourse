import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
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
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

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

const mapTexture = textureLoader.load("/models/LeePerrySmith/color.jpg");
mapTexture.encoding = THREE.sRGBEncoding;
const normalTexture = textureLoader.load("/models/LeePerrySmith/normal.jpg");
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

const customUniforms = {
  uTime: {
    value: 0,
  },
};
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <common>",
    `
      #include <common>
      uniform float uTime;

      mat2 get2dRotateMatrix(float _angle){
        return mat2(cos(_angle),-sin(_angle),sin(_angle),cos(_angle));
      }
    
    `
  );
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `
      #include <begin_vertex>

      float angle=(position.y+uTime)*0.9;
      mat2 rotateMatrix=get2dRotateMatrix(angle);
      transformed.xz=rotateMatrix*transformed.xz;
    
    `
  );
};
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials);

// load Model
// gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load("/models/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
  const mesh = gltf.scene.children[0];
  // mesh=new THREE.Mesh(,material);
  mesh.rotation.y = Math.PI * 0.5;
  mesh.material = material;
  scene.add(mesh);
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("rotation");
  updateAllMaterials();
});

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
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
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
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update Animation
  customUniforms.uTime.value = elapsedTime;

  // Update controls
  controls.update();
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
