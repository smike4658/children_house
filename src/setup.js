// ============================================================
// Scene, Renderer
// ============================================================
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputEncoding = THREE.sRGBEncoding;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// ============================================================
// Cameras
// ============================================================
const perspCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
perspCamera.position.set(6, 4, -6);
perspCamera.lookAt(0, 1.5, 0);

let orthoCamera = null;
let activeCamera = perspCamera;
let currentView = '3d';

// ============================================================
// Lighting
// ============================================================
const ambientLight = new THREE.AmbientLight(0xddeeff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
dirLight.position.set(6, 12, -4);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 30;
dirLight.shadow.camera.left = -8;
dirLight.shadow.camera.right = 8;
dirLight.shadow.camera.top = 8;
dirLight.shadow.camera.bottom = -8;
dirLight.shadow.bias = -0.0005;
dirLight.shadow.radius = 5;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 0.6);
fillLight.position.set(-5, 4, 6);
scene.add(fillLight);
