import * as THREE from 'three';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { gsap } from 'gsap';

// Class untuk mengelola virtual tour
export class VirtualTourManager {
  constructor(scene, camera, renderer, modelsManager) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.modelsManager = modelsManager;
    
    this.container = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    
    this.isActive = false;
    this.currentLocation = 'main-building';
    this.tourModel = null;
    
    this.interactionPoints = [];
    this.infoPoints = [];
    this.teleportPoints = [];
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.hudElements = [];
    this.compass = null;
    
    this.keyStates = {};
    
    this.originalSceneState = {
      cameraPosition: null,
      cameraRotation: null,
      activeModels: []
    };
  }
  
  init(container) {
    this.container = container;
    
    // Setup for First Person Controls
    this.controls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.controls.lookSpeed = 0.1;
    this.controls.movementSpeed = 5;
    this.controls.lookVertical = true;
    this.controls.constrainVertical = true;
    this.controls.verticalMin = Math.PI / 4;
    this.controls.verticalMax = 3 * Math.PI / 4;
    this.controls.activeLook = true;
    this.controls.enabled = false;
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Create HUD elements
    this.createHUDElements();
  }
  
  setupEventListeners() {
    // Mouse move for raycasting
    this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    
    // Mouse click for interaction
    this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e), false);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keyStates[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keyStates[e.code] = false;
    });
    
    // Location buttons
    const locationButtons = document.querySelectorAll('.tour-location-btn');
    if (locationButtons) {
      locationButtons.forEach(button => {
        button.addEventListener('click', () => {
          const location = button.dataset.location;
          this.setLocation(location);
          
          // Update active button
          locationButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
        });
      });
    }
  }
  
  createHUDElements() {
    // Create compass
    const compassContainer = document.createElement('div');
    compassContainer.className = 'tour-compass';
    compassContainer.innerHTML = `
      <div class="compass-ring">
        <div class="compass-marker"></div>
        <div class="compass-north">N</div>
        <div class="compass-east">E</div>
        <div class="compass-south">S</div>
        <div class="compass-west">W</div>
      </div>
    `;
    
    // Create info display
    const infoDisplay = document.createElement('div');
    infoDisplay.className = 'tour-info-display';
    infoDisplay.innerHTML = `
      <div class="info-location">
        <h3>Lokasi: <span id="current-location">Gedung Utama</span></h3>
      </div>
      <div class="info-content" id="location-info">
        <p>Gunakan WASD untuk bergerak dan mouse untuk melihat sekitar.</p>
      </div>
    `;
    
    // Create interaction hint
    const interactionHint = document.createElement('div');
    interactionHint.className = 'tour-interaction-hint';
    interactionHint.textContent = 'Klik untuk berinteraksi';
    interactionHint.style.display = 'none';
    
    // Store HUD elements
    this.hudElements = [compassContainer, infoDisplay, interactionHint];
    this.compass = compassContainer;
  }
  
  showHUD() {
    // Create container for HUD if it doesn't exist
    let hudContainer = document.getElementById('tour-hud');
    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'tour-hud';
      document.body.appendChild(hudContainer);
    }
    
    // Add HUD elements to container
    this.hudElements.forEach(element => {
      hudContainer.appendChild(element);
    });
  }
  
  hideHUD() {
    const hudContainer = document.getElementById('tour-hud');
    if (hudContainer) {
      hudContainer.remove();
    }
  }
  
  // Start virtual tour
  start() {
    if (this.isActive) return;
    
    // Save original scene state
    this.saveSceneState();
    
    // Hide existing scene models
    this.hideSceneModels();
    
    // Move renderer to tour container
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
      this.container.style.display = 'block';
      
      // Update renderer size
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    
    // Set initial camera position
    this.camera.position.set(0, 1.7, 0); // Human height
    this.camera.rotation.set(0, 0, 0);
    
    // Enable controls
    this.controls.enabled = true;
    
    // Load initial location
    this.setLocation(this.currentLocation);
    
    // Show HUD
    this.showHUD();
    
    // Mark tour as active
    this.isActive = true;
  }
  
  // End virtual tour
  end() {
    if (!this.isActive) return;
    
    // Disable controls
    this.controls.enabled = false;
    
    // Remove tour model
    if (this.tourModel) {
      this.scene.remove(this.tourModel);
      this.tourModel = null;
    }
    
    // Remove interaction points
    this.clearInteractionPoints();
    
    // Hide HUD
    this.hideHUD();
    
    // Restore original scene state
    this.restoreSceneState();
    
    // Mark tour as inactive
    this.isActive = false;
  }
  
  // Save original scene state before starting tour
  saveSceneState() {
    // Save camera position and rotation
    this.originalSceneState.cameraPosition = this.camera.position.clone();
    this.originalSceneState.cameraRotation = this.camera.rotation.clone();
    
    // Save active models
    this.originalSceneState.activeModels = [];
    this.scene.traverse(object => {
      if (object.isMesh && object.visible) {
        this.originalSceneState.activeModels.push({
          uuid: object.uuid,
          visible: object.visible
        });
      }
    });
  }
  
  // Hide all existing scene models
  hideSceneModels() {
    this.scene.traverse(object => {
      if (object.isMesh && object.visible) {
        object.visible = false;
      }
    });
  }
  
  // Restore original scene state after tour
  restoreSceneState() {
    // Restore camera
    if (this.originalSceneState.cameraPosition) {
      this.camera.position.copy(this.originalSceneState.cameraPosition);
    }
    
    if (this.originalSceneState.cameraRotation) {
      this.camera.rotation.copy(this.originalSceneState.cameraRotation);
    }
    
    // Restore model visibility
    this.originalSceneState.activeModels.forEach(modelState => {
      const object = this.scene.getObjectByProperty('uuid', modelState.uuid);
      if (object) {
        object.visible = modelState.visible;
      }
    });
  }
  
  // Set current location for tour
  setLocation(location) {
    this.currentLocation = location;
    
    // Remove previous model
    if (this.tourModel) {
      this.scene.remove(this.tourModel);
    }
    
    // Clear interaction points
    this.clearInteractionPoints();
    
    // Create new model
    this.tourModel = this.modelsManager.createTourModel(location);
    if (this.tourModel) {
      this.scene.add(this.tourModel);
      
      // Set initial camera position for this location
      this.setInitialPositionForLocation(location);
      
      // Create interaction points
      this.createInteractionPoints(location);
      
      // Update location name in HUD
      this.updateLocationInfo(location);
    }
  }
  
  // Set initial camera position based on current location
  setInitialPositionForLocation(location) {
    switch (location) {
      case 'main-building':
        this.camera.position.set(0, 1.7, 4);
        this.camera.lookAt(0, 1.7, 0);
        break;
      case 'ai-lab':
        this.camera.position.set(0, 1.7, 4);
        this.camera.lookAt(0, 1.7, 0);
        break;
      case 'library':
        this.camera.position.set(0, 1.7, 5);
        this.camera.lookAt(0, 1.7, 0);
        break;
      case 'creative-space':
        this.camera.position.set(0, 1.7, 5);
        this.camera.lookAt(0, 1.7, 0);
        break;
      case 'hall':
        this.camera.position.set(0, 1.7, 10);
        this.camera.lookAt(0, 1.7, 0);
        break;
      default:
        this.camera.position.set(0, 1.7, 5);
        this.camera.lookAt(0, 1.7, 0);
    }
  }
  
  // Update location info in HUD
  updateLocationInfo(location) {
    const locationElement = document.getElementById('current-location');
    const infoElement = document.getElementById('location-info');
    
    if (locationElement && infoElement) {
      let locationName = '';
      let locationInfo = '';
      
      switch (location) {
        case 'main-building':
          locationName = 'Gedung Utama';
          locationInfo = `
            <p>Gedung utama Fakultas Sains dan Teknologi Informasi ITK. 
            Gedung ini mencakup ruang administrasi, ruang dosen, dan ruang kuliah.</p>
            <ul>
              <li>4 ruang kuliah dengan kapasitas 40-60 mahasiswa</li>
              <li>Ruang administrasi program studi</li>
              <li>Ruang rapat fakultas</li>
            </ul>
          `;
          break;
        case 'ai-lab':
          locationName = 'Laboratorium AI';
          locationInfo = `
            <p>Laboratorium Kecerdasan Buatan (AI) dilengkapi dengan perangkat keras dan perangkat lunak terkini 
            untuk penelitian dan pembelajaran di bidang AI dan Machine Learning.</p>
            <ul>
              <li>20 workstation dengan GPU NVIDIA RTX</li>
              <li>Server komputasi paralel</li>
              <li>Perangkat lunak AI terbaru</li>
            </ul>
          `;
          break;
        case 'library':
          locationName = 'Perpustakaan';
          locationInfo = `
            <p>Perpustakaan digital yang dilengkapi dengan koleksi buku fisik dan akses ke jurnal internasional.</p>
            <ul>
              <li>10.000+ koleksi buku referensi</li>
              <li>Akses ke jurnal IEEE, ACM, dan lainnya</li>
              <li>Area baca dan diskusi</li>
            </ul>
          `;
          break;
        case 'creative-space':
          locationName = 'Ruang Kreatif';
          locationInfo = `
            <p>Area kolaborasi dan diskusi untuk mahasiswa dalam mengembangkan ide dan proyek inovatif.</p>
            <ul>
              <li>Ruang diskusi fleksibel</li>
              <li>Peralatan presentasi</li>
              <li>Papan tulis digital</li>
            </ul>
          `;
          break;
        case 'hall':
          locationName = 'Aula Serbaguna';
          locationInfo = `
            <p>Aula dengan kapasitas 300 orang untuk berbagai kegiatan fakultas, seminar, dan acara kemahasiswaan.</p>
            <ul>
              <li>Sistem audio profesional</li>
              <li>Layar proyeksi berukuran besar</li>
              <li>Area panggung multifungsi</li>
            </ul>
          `;
          break;
        default:
          locationName = 'Lokasi tidak dikenal';
          locationInfo = '<p>Informasi tidak tersedia.</p>';
      }
      
      locationElement.textContent = locationName;
      infoElement.innerHTML = locationInfo;
    }
  }
  
  // Create interaction points for current location
  createInteractionPoints(location) {
    // Define interaction points based on location
    switch (location) {
      case 'main-building':
        this.createInfoPoint(0, 1.5, -7, 'Papan Informasi', 'Informasi mengenai jadwal perkuliahan dan pengumuman fakultas.');
        this.createInfoPoint(-8, 1.5, 6, 'Tanaman', 'Tanaman hias untuk memberikan suasana asri dan menyegarkan.');
        this.createInteractionPoint(0, 1, 5, 'Meja Resepsi', 'Tempat administrasi dan informasi fakultas.', () => {
          alert('Selamat datang di Fakultas Sains dan Teknologi Informasi ITK!');
        });
        this.createTeleportPoint(5, 0.1, -3, 'ai-lab', 'Menuju Laboratorium AI');
        break;
      
      case 'ai-lab':
        this.createInfoPoint(0, 1.5, 3, 'Workstation', 'Komputer dengan spesifikasi tinggi untuk pengembangan AI dan analisis data.');
        this.createInfoPoint(-5, 2.5, -4, 'Server Rack', 'Infrastruktur server untuk komputasi paralel dan penyimpanan dataset besar.');
        this.createTeleportPoint(0, 0.1, 5, 'main-building', 'Kembali ke Gedung Utama');
        break;
      
      case 'library':
        this.createInfoPoint(0, 1.5, 0, 'Area Baca', 'Ruang baca yang nyaman untuk mahasiswa dan dosen.');
        this.createTeleportPoint(0, 0.1, 7, 'main-building', 'Kembali ke Gedung Utama');
        break;
      
      case 'creative-space':
        this.createInfoPoint(0, 1.5, 0, 'Area Diskusi', 'Ruang diskusi dan brainstorming untuk proyek kolaboratif.');
        this.createTeleportPoint(0, 0.1, 8, 'main-building', 'Kembali ke Gedung Utama');
        break;
      
      case 'hall':
        this.createInfoPoint(0, 1.5, -8, 'Panggung', 'Panggung untuk presentasi, seminar, dan acara fakultas.');
        this.createTeleportPoint(0, 0.1, 10, 'main-building', 'Kembali ke Gedung Utama');
        break;
    }
  }
  
  // Create info point - displays information when clicked
  createInfoPoint(x, y, z, title, description) {
    const geometryPoint = new THREE.SphereGeometry(0.2, 16, 16);
    const materialPoint = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.7
    });
    
    const point = new THREE.Mesh(geometryPoint, materialPoint);
    point.position.set(x, y, z);
    point.userData.type = 'info';
    point.userData.title = title;
    point.userData.description = description;
    
    this.scene.add(point);
    this.infoPoints.push(point);
    this.interactionPoints.push(point);
    
    // Add pulsing animation
    const initialScale = point.scale.clone();
    animations.points = animations.points || [];
    animations.points.push(() => {
      point.scale.set(
        initialScale.x * (1 + 0.2 * Math.sin(Date.now() * 0.003)),
        initialScale.y * (1 + 0.2 * Math.sin(Date.now() * 0.003)),
        initialScale.z * (1 + 0.2 * Math.sin(Date.now() * 0.003))
      );
    });
  }
  
  // Create interaction point - triggers callback when clicked
  createInteractionPoint(x, y, z, title, description, callback) {
    const geometryPoint = new THREE.SphereGeometry(0.2, 16, 16);
    const materialPoint = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.7
    });
    
    const point = new THREE.Mesh(geometryPoint, materialPoint);
    point.position.set(x, y, z);
    point.userData.type = 'interaction';
    point.userData.title = title;
    point.userData.description = description;
    point.userData.callback = callback;
    
    this.scene.add(point);
    this.interactionPoints.push(point);
    
    // Add pulsing animation
    const initialScale = point.scale.clone();
    animations.points = animations.points || [];
    animations.points.push(() => {
      point.scale.set(
        initialScale.x * (1 + 0.2 * Math.sin(Date.now() * 0.003)),
        initialScale.y * (1 + 0.2 * Math.sin(Date.now() * 0.003)),
        initialScale.z * (1 + 0.2 * Math.sin(Date.now() * 0.003))
      );
    });
  }
  
  // Create teleport point - changes location when clicked
  createTeleportPoint(x, y, z, targetLocation, label) {
    const geometryPoint = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const materialPoint = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7
    });
    
    const point = new THREE.Mesh(geometryPoint, materialPoint);
    point.position.set(x, y, z);
    point.userData.type = 'teleport';
    point.userData.targetLocation = targetLocation;
    point.userData.label = label;
    
    this.scene.add(point);
    this.teleportPoints.push(point);
    this.interactionPoints.push(point);
    
    // Add floating animation
    const initialY = point.position.y;
    animations.points = animations.points || [];
    animations.points.push(() => {
      point.position.y = initialY + 0.1 * Math.sin(Date.now() * 0.002);
    });
    
    // Add arrow indicator above teleport point
    const arrowGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.9
    });
    
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(x, y + 0.5, z);
    
    // Animate arrow up and down
    animations.points.push(() => {
      arrow.position.y = y + 0.5 + 0.2 * Math.sin(Date.now() * 0.003);
    });
    
    this.scene.add(arrow);
    this.teleportPoints.push(arrow);
  }
  
  // Clear all interaction points
  clearInteractionPoints() {
    // Remove all points from scene
    [...this.infoPoints, ...this.teleportPoints, ...this.interactionPoints].forEach(point => {
      if (point && this.scene.getObjectById(point.id)) {
        this.scene.remove(point);
      }
    });
    
    // Clear arrays
    this.infoPoints = [];
    this.teleportPoints = [];
    this.interactionPoints = [];
    
    // Clear animations
    if (animations.points) {
      animations.points = [];
    }
  }
  
  // Mouse move handler for interaction
  onMouseMove(event) {
    if (!this.isActive || !this.renderer.domElement) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast to interaction points
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactionPoints);
    
    // Update cursor and hint
    const interactionHint = document.querySelector('.tour-interaction-hint');
    
    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer';
      
      if (interactionHint) {
        const point = intersects[0].object;
        
        let hintText = '';
        if (point.userData.type === 'info') {
          hintText = `Info: ${point.userData.title}`;
        } else if (point.userData.type === 'interaction') {
          hintText = `Interaksi: ${point.userData.title}`;
        } else if (point.userData.type === 'teleport') {
          hintText = point.userData.label;
        }
        
        interactionHint.textContent = hintText;
        interactionHint.style.display = 'block';
      }
    } else {
      document.body.style.cursor = 'default';
      
      if (interactionHint) {
        interactionHint.style.display = 'none';
      }
    }
  }
  
  // Mouse click handler for interaction
  onMouseClick(event) {
    if (!this.isActive) return;
    
    // Raycast to interaction points
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactionPoints);
    
    if (intersects.length > 0) {
      const point = intersects[0].object;
      
      // Handle click based on point type
      if (point.userData.type === 'info') {
        this.showInfoPopup(point.userData.title, point.userData.description);
      } else if (point.userData.type === 'interaction' && typeof point.userData.callback === 'function') {
        point.userData.callback();
      } else if (point.userData.type === 'teleport') {
        this.teleportTo(point.userData.targetLocation);
      }
    }
  }
  
  // Show info popup
  showInfoPopup(title, description) {
    // Create popup element if it doesn't exist
    let popup = document.getElementById('tour-info-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'tour-info-popup';
      document.body.appendChild(popup);
    }
    
    // Set content
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <h3>${title}</h3>
          <span class="close-popup">&times;</span>
        </div>
        <div class="popup-body">
          <p>${description}</p>
        </div>
      </div>
    `;
    
    // Show popup with animation
    popup.style.display = 'flex';
    setTimeout(() => {
      popup.querySelector('.popup-content').style.transform = 'translateY(0)';
    }, 10);
    
    // Add close button functionality
    const closeBtn = popup.querySelector('.close-popup');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.querySelector('.popup-content').style.transform = 'translateY(-20px)';
        setTimeout(() => {
          popup.style.display = 'none';
        }, 300);
      });
    }
  }
  
  // Teleport to different location
  teleportTo(location) {
    // Add transition effect
    const overlay = document.createElement('div');
    overlay.className = 'tour-transition-overlay';
    document.body.appendChild(overlay);
    
    // Fade in
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        // Change location
        this.setLocation(location);
        
        // Update location buttons
        const locationButtons = document.querySelectorAll('.tour-location-btn');
        if (locationButtons) {
          locationButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.location === location) {
              btn.classList.add('active');
            }
          });
        }
        
        // Fade out
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.5,
          delay: 0.5,
          onComplete: () => {
            overlay.remove();
          }
        });
      }
    });
  }
  
  // Update controls and animations
  update(delta) {
    if (!this.isActive) return;
    
    // Update HUD
    this.updateHUD();
    
    // Update controls
    if (this.controls) {
      this.controls.update(delta);
    }
    
    // Check for keyboard movement
    this.handleKeyboardInput(delta);
    
    // Update point animations
    if (animations.points) {
      animations.points.forEach(animateFn => {
        if (typeof animateFn === 'function') {
          animateFn();
        }
      });
    }
  }
  
  // Handle keyboard movement
  handleKeyboardInput(delta) {
    // Get camera direction
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement on xz plane
    direction.normalize();
    
    // Get right vector
    const right = new THREE.Vector3();
    right.crossVectors(this.camera.up, direction).normalize();
    
    // Movement speed
    const speed = 5 * delta;
    
    // Apply movement
    if (this.keyStates['KeyW']) {
      this.camera.position.addScaledVector(direction, speed);
    }
    if (this.keyStates['KeyS']) {
      this.camera.position.addScaledVector(direction, -speed);
    }
    if (this.keyStates['KeyA']) {
      this.camera.position.addScaledVector(right, speed);
    }
    if (this.keyStates['KeyD']) {
      this.camera.position.addScaledVector(right, -speed);
    }
    
    // Implement collision detection here
    this.handleCollisions();
  }
  
  // Collision detection
  handleCollisions() {
    // Simplified collision: prevent going through walls or outside bounds
    
    // Keep within room boundaries
    const roomSize = 20; // Approximate room size
    const minX = -roomSize / 2;
    const maxX = roomSize / 2;
    const minZ = -roomSize / 2;
    const maxZ = roomSize / 2;
    
    // Clamp position
    this.camera.position.x = Math.max(minX, Math.min(maxX, this.camera.position.x));
    this.camera.position.z = Math.max(minZ, Math.min(maxZ, this.camera.position.z));
    
    // Fix camera height
    this.camera.position.y = 1.7; // Human eye level
  }
  
  // Update HUD information
  updateHUD() {
    // Update compass
    if (this.compass) {
      const compassMarker = this.compass.querySelector('.compass-marker');
      if (compassMarker) {
        // Get camera rotation around y-axis (yaw)
        const yaw = this.camera.rotation.y;
        compassMarker.style.transform = `rotate(${-yaw * 180 / Math.PI}deg)`;
      }
    }
  }
}

// Store animations
const animations = {
    points: []
  };
  
  // Helper functions for external use
  export const TourUtils = {
    /**
     * Create tour CSS styles
     * Injects required CSS for tour UI elements
     */
    injectTourStyles() {
      // Check if styles are already injected
      if (document.getElementById('tour-styles')) return;
      
      const styleSheet = document.createElement('style');
      styleSheet.id = 'tour-styles';
      styleSheet.textContent = `
        /* Tour HUD styles */
        #tour-hud {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
        }
        
        .tour-compass {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 100px;
          height: 100px;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .compass-ring {
          position: relative;
          width: 80px;
          height: 80px;
          border: 2px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
        }
        
        .compass-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 16px solid red;
          transform: translate(-50%, -50%);
          transform-origin: center center;
        }
        
        .compass-north, .compass-east, .compass-south, .compass-west {
          position: absolute;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .compass-north {
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .compass-east {
          top: 50%;
          right: 5px;
          transform: translateY(-50%);
        }
        
        .compass-south {
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .compass-west {
          top: 50%;
          left: 5px;
          transform: translateY(-50%);
        }
        
        .tour-info-display {
          position: absolute;
          bottom: 20px;
          left: 20px;
          max-width: 300px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 15px;
          border-radius: 5px;
        }
        
        .tour-info-display h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .info-content {
          font-size: 14px;
        }
        
        .info-content ul {
          padding-left: 20px;
          margin: 10px 0;
        }
        
        .tour-interaction-hint {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 10px 15px;
          border-radius: 5px;
          font-size: 14px;
          pointer-events: none;
        }
        
        /* Tour popup styles */
        #tour-info-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          pointer-events: auto;
        }
        
        .popup-content {
          background-color: white;
          width: 90%;
          max-width: 500px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          transform: translateY(-20px);
          transition: transform 0.3s ease-out;
        }
        
        .popup-header {
          background-color: #005691;
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .popup-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .close-popup {
          font-size: 24px;
          cursor: pointer;
        }
        
        .popup-body {
          padding: 20px;
          color: #333;
        }
        
        /* Tour transition overlay */
        .tour-transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
          opacity: 0;
          z-index: 3000;
          pointer-events: none;
        }
        
        /* Tour locations buttons */
        .tour-locations {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        
        .tour-location-btn {
          padding: 8px 15px;
          background-color: #e0e0e0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }
        
        .tour-location-btn.active {
          background-color: #005691;
          color: white;
        }
        
        .tour-location-btn:hover {
          background-color: #d0d0d0;
        }
        
        .tour-location-btn.active:hover {
          background-color: #004980;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .tour-compass {
            width: 80px;
            height: 80px;
          }
          
          .compass-ring {
            width: 60px;
            height: 60px;
          }
          
          .tour-info-display {
            max-width: 250px;
            padding: 10px;
          }
          
          .popup-content {
            width: 95%;
          }
        }
      `;
      
      document.head.appendChild(styleSheet);
    },
    
    /**
     * Create tour location buttons
     * @param {HTMLElement} container - DOM element to append buttons to
     * @param {Array} locations - Array of location objects { id, name }
     * @param {Function} onLocationChange - Callback when location is changed
     */
    createLocationButtons(container, locations, onLocationChange) {
      if (!container) return;
      
      // Clear container
      container.innerHTML = '';
      
      // Create buttons container
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'tour-locations';
      
      // Create buttons for each location
      locations.forEach(location => {
        const button = document.createElement('button');
        button.className = 'tour-location-btn';
        button.dataset.location = location.id;
        button.textContent = location.name;
        
        // Set first one as active
        if (locations.indexOf(location) === 0) {
          button.classList.add('active');
        }
        
        // Add click event
        button.addEventListener('click', () => {
          // Remove active class from all buttons
          buttonsContainer.querySelectorAll('.tour-location-btn').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // Add active class to clicked button
          button.classList.add('active');
          
          // Call callback
          if (typeof onLocationChange === 'function') {
            onLocationChange(location.id);
          }
        });
        
        buttonsContainer.appendChild(button);
      });
      
      // Append to container
      container.appendChild(buttonsContainer);
    },
    
    /**
     * Create a fullscreen button for tour view
     * @param {HTMLElement} container - DOM element to append button to
     * @param {HTMLElement} targetElement - Element to make fullscreen
     */
    createFullscreenButton(container, targetElement) {
      if (!container || !targetElement) return;
      
      // Create button
      const button = document.createElement('button');
      button.className = 'fullscreen-btn';
      button.innerHTML = '<i class="fas fa-expand"></i>';
      button.title = 'Fullscreen Mode';
      
      // Add styles
      button.style.position = 'absolute';
      button.style.top = '10px';
      button.style.right = '10px';
      button.style.backgroundColor = 'rgba(0,0,0,0.5)';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.padding = '8px';
      button.style.cursor = 'pointer';
      button.style.zIndex = '1000';
      
      // Add click event
      button.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (targetElement.requestFullscreen) {
            targetElement.requestFullscreen();
          } else if (targetElement.webkitRequestFullscreen) {
            targetElement.webkitRequestFullscreen();
          } else if (targetElement.msRequestFullscreen) {
            targetElement.msRequestFullscreen();
          }
          
          button.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          
          button.innerHTML = '<i class="fas fa-expand"></i>';
        }
      });
      
      // Handle fullscreen change
      document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
          button.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
          button.innerHTML = '<i class="fas fa-expand"></i>';
        }
      });
      
      // Append to container
      container.appendChild(button);
    }
  };
  
  /**
   * Tour configuration settings
   */
  export const TourConfig = {
    // Default locations available in the tour
    defaultLocations: [
      { id: 'main-building', name: 'Gedung Utama' },
      { id: 'ai-lab', name: 'Lab AI' },
      { id: 'library', name: 'Perpustakaan' },
      { id: 'creative-space', name: 'Ruang Kreatif' },
      { id: 'hall', name: 'Aula' }
    ],
    
    // Camera settings
    camera: {
      fov: 75,
      near: 0.1,
      far: 1000,
      height: 1.7,  // Human eye level in meters
      movementSpeed: 5,
      lookSpeed: 0.1
    },
    
    // Interaction settings
    interaction: {
      infoPointColor: 0x00aaff,
      interactionPointColor: 0xffaa00,
      teleportPointColor: 0x00ff00,
      pointScale: 0.2,
      pulseSpeed: 0.003,
      pulseIntensity: 0.2
    },
    
    // Default keybindings
    controls: {
      forward: 'KeyW',
      backward: 'KeyS',
      left: 'KeyA',
      right: 'KeyD',
      sprint: 'ShiftLeft',
      jump: 'Space'
    }
  };
  
  /**
   * Helper class to create a simple tour point indicator
   * Can be used to create different types of interaction points with less code
   */
  export class TourPoint extends THREE.Group {
    /**
     * Create a tour point indicator
     * @param {Object} options - Configuration options
     * @param {string} options.type - Type of point ('info', 'interaction', 'teleport')
     * @param {number} options.x - X position
     * @param {number} options.y - Y position
     * @param {number} options.z - Z position
     * @param {string} options.title - Title/label for the point
     * @param {string} options.description - Description for the point
     * @param {string} options.targetLocation - Target location for teleport points
     * @param {Function} options.callback - Callback function for interaction points
     * @param {number} options.scale - Scale of the point (default 0.2)
     * @param {number} options.color - Color of the point (default depends on type)
     */
    constructor(options) {
      super();
      
      // Default options
      this.options = Object.assign({
        type: 'info',
        x: 0,
        y: 1.5,
        z: 0,
        title: 'Information Point',
        description: '',
        targetLocation: '',
        callback: null,
        scale: 0.2,
        color: null
      }, options);
      
      // Set name
      this.name = `tour-point-${this.options.type}`;
      
      // Set position
      this.position.set(this.options.x, this.options.y, this.options.z);
      
      // Set userData
      this.userData = {
        type: this.options.type,
        title: this.options.title,
        description: this.options.description,
        targetLocation: this.options.targetLocation,
        callback: this.options.callback
      };
      
      // Create mesh based on type
      this.createMesh();
      
      // Set up animations
      this.setupAnimations();
    }
    
    // Create the appropriate mesh for this point type
    createMesh() {
      let geometry, material, color;
      
      // Set default color based on type if not provided
      if (this.options.color === null) {
        switch (this.options.type) {
          case 'info':
            color = 0x00aaff; // Blue
            break;
          case 'interaction':
            color = 0xffaa00; // Orange
            break;
          case 'teleport':
            color = 0x00ff00; // Green
            break;
          default:
            color = 0xffffff; // White
        }
      } else {
        color = this.options.color;
      }
      
      // Create geometry based on type
      switch (this.options.type) {
        case 'teleport':
          geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
          break;
        default:
          geometry = new THREE.SphereGeometry(this.options.scale, 16, 16);
      }
      
      // Create material
      material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
      });
      
      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      this.add(mesh);
      
      // Add indicator for teleport points
      if (this.options.type === 'teleport') {
        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.4, 16);
        const arrowMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.9
        });
        
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow.position.y = 0.5;
        this.add(arrow);
      }
    }
    
    // Set up animation functions
    setupAnimations() {
      this.initialScale = this.scale.clone();
      this.initialY = this.position.y;
      
      switch (this.options.type) {
        case 'teleport':
          // Floating animation
          this.animate = () => {
            this.position.y = this.initialY + 0.1 * Math.sin(Date.now() * 0.002);
            
            // Arrow animation
            if (this.children.length > 1) {
              this.children[1].position.y = 0.5 + 0.1 * Math.sin(Date.now() * 0.003);
            }
          };
          break;
        default:
          // Pulsing animation
          this.animate = () => {
            const pulse = 1 + 0.2 * Math.sin(Date.now() * 0.003);
            this.scale.set(
              this.initialScale.x * pulse,
              this.initialScale.y * pulse,
              this.initialScale.z * pulse
            );
          };
      }
    }
    
    // Update animation state
    update() {
      if (typeof this.animate === 'function') {
        this.animate();
      }
    }
  }
  
  export default VirtualTourManager;
  export { animations };