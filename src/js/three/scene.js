import * as THREE from 'three';

// Class untuk menangani setup scene Three.js
export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = container.clientWidth;
    this.height = container.clientHeight;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    
    this.isDarkMode = false;
    
    this.init();
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.01);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 5, 20);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Add renderer to container
    this.container.appendChild(this.renderer.domElement);
    
    // Setup lights
    this.setupLights();
    
    // Setup environment
    this.createEnvironment();
    
    // Setup resize handler
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 30);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
    
    // Hemisphere light for natural outdoor illumination
    const hemisphereLight = new THREE.HemisphereLight(0x0080ff, 0x00ff80, 0.3);
    this.scene.add(hemisphereLight);
    
    // Point lights for buildings
    const pointLight1 = new THREE.PointLight(0xffaa00, 1, 50);
    pointLight1.position.set(0, 7, 0);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00aaff, 1, 30);
    pointLight2.position.set(-20, 5, 20);
    this.scene.add(pointLight2);
  }
  
  createEnvironment() {
    // Skybox/background
    const skyGeo = new THREE.SphereGeometry(500, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x87CEEB,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
    
    // Add clouds
    this.addClouds();
  }
  
  addClouds() {
    const cloudGroup = new THREE.Group();
    cloudGroup.name = "clouds";
    
    for (let i = 0; i < 20; i++) {
      const cloudPuff = new THREE.Mesh(
        new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.8
        })
      );
      
      const angle = Math.random() * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      const height = 30 + Math.random() * 40;
      
      cloudPuff.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      cloudGroup.add(cloudPuff);
    }
    
    this.scene.add(cloudGroup);
  }
  
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      this.scene.background = new THREE.Color(0x121212);
      this.scene.fog = new THREE.FogExp2(0x121212, 0.01);
      
      // Update skybox color
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material && object.geometry instanceof THREE.SphereGeometry && object.geometry.parameters.radius === 500) {
          object.material.color.set(0x1a1a2a);
        }
      });
    } else {
      this.scene.background = new THREE.Color(0x1a1a2e);
      this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.01);
      
      // Reset skybox color
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.material && object.geometry instanceof THREE.SphereGeometry && object.geometry.parameters.radius === 500) {
          object.material.color.set(0x87CEEB);
        }
      });
    }
  }
  
  onWindowResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
  }
  
  update() {
    // Animate clouds
    const clouds = this.scene.getObjectByName("clouds");
    if (clouds) {
      clouds.rotation.y += 0.0003;
    }
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default SceneManager;