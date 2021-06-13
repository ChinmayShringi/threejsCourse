import "./style.css";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";

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

const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const textureLoader = new THREE.TextureLoader();

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
gltfLoader.load("/models/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  gltf.scene.scale.set(3, 3, 3);
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
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
/**
 * RenderTarget
 */
let RenderTargetClass = null;
if (renderer.getPixelRatio() == 1 && renderer.capabilities.isWebGL2) {
  RenderTargetClass = THREE.WebGLMultipleRenderTargets;
} else {
  RenderTargetClass = THREE.WebGLRenderTarget;
}

const renderTarget = new RenderTargetClass(800, 600, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
});

/**
 * Post Processing
 */
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);

const renderePass = new RenderPass(scene, camera);
effectComposer.addPass(renderePass);
/**
 * Pass
 */

const dotscreenPass = new DotScreenPass();
dotscreenPass.enabled = false;
effectComposer.addPass(dotscreenPass);

const glitchPass = new GlitchPass();
glitchPass.goWild = true;
glitchPass.enabled = false;
effectComposer.addPass(glitchPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.enabled = false;
effectComposer.addPass(rgbShiftPass);

const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.enabled = false;
unrealBloomPass.strength = 0.3;
unrealBloomPass.radius = 1;
unrealBloomPass.threshold = 0.6;
effectComposer.addPass(unrealBloomPass);

// Custom Pass
const TintShader = {
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uTint: {
      value: null,
    },
  },
  vertexShader: `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix*modelViewMatrix* vec4(position,1.0);
    vUv=uv;
  }
  `,
  fragmentShader: `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  uniform vec3 uTint;
  void main() {
    vec4 color = texture2D(tDiffuse,vUv);
    color.rgb += uTint;
    gl_FragColor=color ;
  }`,
};
const tintPass = new ShaderPass(TintShader);
tintPass.material.uniforms.uTint.value = new THREE.Vector3(0, 0, 0);
tintPass.enabled = false;
effectComposer.addPass(tintPass);

gui
  .add(tintPass.material.uniforms.uTint.value, "x")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("red");
gui
  .add(tintPass.material.uniforms.uTint.value, "y")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("blue");
gui
  .add(tintPass.material.uniforms.uTint.value, "z")
  .min(-1)
  .max(1)
  .step(0.001)
  .name("green");

// Custom Pass
const DisplacementShader = {
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uNormalmap: {
      value: null,
    },
  },
  vertexShader: `
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix*modelViewMatrix* vec4(position,1.0);
    vUv=uv;
  }
  `,
  fragmentShader: `
  uniform sampler2D tDiffuse;
  uniform sampler2D uNormalMap;
  varying vec2 vUv;
  void main() {
    vec3 normalColor = texture2D(uNormalMap,vUv).xyz * 2.0 - 1.0;
    vec2 newvUv = vUv + normalColor.xy * 0.1;
    vec4 color = texture2D(tDiffuse,newvUv);
    vec3 lightDirection = normalize(vec3(-1.0,1.0,0.0));
    float lightness = clamp(dot(normalColor,lightDirection),0.0,1.0);
    color.rgb += lightness *2.0;
    gl_FragColor=color;
  }`,
};
const displacementPass = new ShaderPass(DisplacementShader);
displacementPass.material.uniforms.uNormalmap.value = textureLoader.load(
  "/textures/interfaceNormalMap.png"
);
effectComposer.addPass(displacementPass);

// SMAA PASS
if (renderer.getPixelRatio() == 1 && !renderer.capabilities.isWebGL2) {
  // bad performance for anti aliasing
  const smaaPass = new SMAAPass();
  effectComposer.addPass(smaaPass);
}

gui.add(unrealBloomPass, "enabled");
gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.001);
gui.add(unrealBloomPass, "threshold").min(0).max(1).step(0.001);

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

  // Update controls
  controls.update();
  // Render
  // renderer.render(scene, camera);

  // rendere effect composer
  effectComposer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
