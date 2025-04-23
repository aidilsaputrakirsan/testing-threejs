import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Inisialisasi scene, camera, dan renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// Buat container elemen
const container = document.getElementById('threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

// Setup camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 10;

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Tambahkan lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Atur orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Buat geometri untuk fakultas
function createFacultyModel() {
  const group = new THREE.Group();
  
  // Building base
  const baseGeometry = new THREE.BoxGeometry(7, 1, 4);
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x005691, // Warna ITK
    metalness: 0.2,
    roughness: 0.8
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = -2;
  group.add(base);
  
  // Main building
  const buildingGeometry = new THREE.BoxGeometry(6, 3, 3.5);
  const buildingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee,
    metalness: 0.1,
    roughness: 0.7
  });
  const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
  building.position.y = 0;
  group.add(building);
  
  // Roof
  const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333,
    metalness: 0.3,
    roughness: 0.5
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = 2.5;
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  
  // Windows
  const windowGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff,
    metalness: 0.5,
    roughness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  
  // Left windows
  const leftWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow1.position.set(-2, 0, 1.76);
  group.add(leftWindow1);
  
  const leftWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow2.position.set(-0.8, 0, 1.76);
  group.add(leftWindow2);
  
  const leftWindow3 = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow3.position.set(0.8, 0, 1.76);
  group.add(leftWindow3);
  
  const leftWindow4 = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow4.position.set(2, 0, 1.76);
  group.add(leftWindow4);
  
  // Right windows (mirror of left)
  const rightWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  rightWindow1.position.set(-2, 0, -1.76);
  group.add(rightWindow1);
  
  const rightWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  rightWindow2.position.set(-0.8, 0, -1.76);
  group.add(rightWindow2);
  
  const rightWindow3 = new THREE.Mesh(windowGeometry, windowMaterial);
  rightWindow3.position.set(0.8, 0, -1.76);
  group.add(rightWindow3);
  
  const rightWindow4 = new THREE.Mesh(windowGeometry, windowMaterial);
  rightWindow4.position.set(2, 0, -1.76);
  group.add(rightWindow4);
  
  // Door
  const doorGeometry = new THREE.BoxGeometry(1.2, 2, 0.1);
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x995522, 
    metalness: 0.3,
    roughness: 0.8
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, -0.5, 1.76);
  group.add(door);
  
  // Tiang/Pilar
  const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 16);
  const pillarMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd,
    metalness: 0.2,
    roughness: 0.6
  });
  
  const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar1.position.set(-2.8, 0, 1.5);
  group.add(pillar1);
  
  const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar2.position.set(2.8, 0, 1.5);
  group.add(pillar2);
  
  const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar3.position.set(-2.8, 0, -1.5);
  group.add(pillar3);
  
  const pillar4 = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar4.position.set(2.8, 0, -1.5);
  group.add(pillar4);
  
  // Text Label
  const textGeometry = new THREE.BoxGeometry(5, 0.6, 0.1);
  const textMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222,
    metalness: 0.3, 
    roughness: 0.7
  });
  const textLabel = new THREE.Mesh(textGeometry, textMaterial);
  textLabel.position.set(0, 1.2, 1.8);
  group.add(textLabel);
  
  return group;
}

// Tambahkan model ke scene
const facultyModel = createFacultyModel();
scene.add(facultyModel);

// Tambahkan background objects (simple)
function addEnvironment() {
  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a9d23, 
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = Math.PI / 2;
  ground.position.y = -2.5;
  scene.add(ground);
  
  // Add a few random trees
  const treePositions = [
    [-8, -2, 6],
    [-5, -2, -8],
    [10, -2, -3],
    [8, -2, 7],
    [-9, -2, -5]
  ];
  
  treePositions.forEach(position => {
    const tree = createSimpleTree();
    tree.position.set(...position);
    scene.add(tree);
  });
}

// Simple tree function
function createSimpleTree() {
  const tree = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, 
    metalness: 0.1,
    roughness: 0.9 
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  tree.add(trunk);
  
  // Leaves
  const leavesGeometry = new THREE.ConeGeometry(1, 2.5, 8);
  const leavesMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2E8B57, 
    metalness: 0.05,
    roughness: 0.8 
  });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.y = 2.5;
  tree.add(leaves);
  
  return tree;
}

// Tambahkan environment
addEnvironment();

// Animasi
function animate() {
  requestAnimationFrame(animate);
  
  // Rotate the building slightly
  facultyModel.rotation.y += 0.002;
  
  controls.update();
  renderer.render(scene, camera);
}

// Resize handler
window.addEventListener('resize', () => {
  const newWidth = container.clientWidth;
  const newHeight = container.clientHeight;
  
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(newWidth, newHeight);
});

// Start animation
animate();