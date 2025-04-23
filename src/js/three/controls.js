import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { gsap } from 'gsap';

// Class untuk menangani camera controls
export class ControlsManager {
  constructor(camera, renderer) {
    this.camera = camera;
    this.renderer = renderer;
    this.container = renderer.domElement.parentElement;
    
    this.orbitControls = null;
    this.fpControls = null;
    this.activeControls = null;
    this.isVirtualTourActive = false;
    
    this.clock = null;
    
    this.init();
  }
  
  init() {
    // Orbit controls for main view
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.minDistance = 5;
    this.orbitControls.maxDistance = 50;
    this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.1;
    this.orbitControls.target.set(0, 0, 0);
    
    // First person controls for virtual tour
    this.fpControls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.fpControls.lookSpeed = 0.1;
    this.fpControls.movementSpeed = 10;
    this.fpControls.lookVertical = true;
    this.fpControls.enabled = false;
    
    // Set active controls
    this.activeControls = this.orbitControls;
  }
  
  setupClock(clock) {
    this.clock = clock;
  }
  
  startVirtualTour(tourContainer) {
    this.isVirtualTourActive = true;
    
    // Switch controls from orbit to first person
    this.orbitControls.enabled = false;
    this.fpControls.enabled = true;
    this.activeControls = this.fpControls;
    
    // Set initial position and target for tour
    this.camera.position.set(0, 2, 10);
    this.fpControls.lookSpeed = 0.1;
    this.fpControls.movementSpeed = 5;
    
    // Move renderer to tour container
    tourContainer.appendChild(this.renderer.domElement);
    tourContainer.style.display = 'block';
    this.renderer.setSize(tourContainer.clientWidth, tourContainer.clientHeight);
    
    // Update camera aspect
    this.camera.aspect = tourContainer.clientWidth / tourContainer.clientHeight;
    this.camera.updateProjectionMatrix();
  }
  
  exitVirtualTour(mainContainer) {
    this.isVirtualTourActive = false;
    
    // Switch controls back to orbit
    this.fpControls.enabled = false;
    this.orbitControls.enabled = true;
    this.activeControls = this.orbitControls;
    
    // Reset camera
    this.camera.position.set(0, 5, 20);
    this.orbitControls.target.set(0, 0, 0);
    
    // Move renderer back to main container
    mainContainer.appendChild(this.renderer.domElement);
    this.renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
    
    // Update camera aspect
    this.camera.aspect = mainContainer.clientWidth / mainContainer.clientHeight;
    this.camera.updateProjectionMatrix();
  }
  
  startCameraAnimation() {
    // Save current position
    const startPosition = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };
    
    const startTarget = {
      x: this.orbitControls.target.x,
      y: this.orbitControls.target.y,
      z: this.orbitControls.target.z
    };
    
    // Animate camera to fly around the faculty
    const timeline = gsap.timeline();
    
    // First move to front view
    timeline.to(this.camera.position, {
      x: 0,
      y: 5,
      z: 20,
      duration: 2,
      ease: "power2.inOut"
    });
    timeline.to(this.orbitControls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 2,
      ease: "power2.inOut"
    }, "<");
    
    // Circle around the faculty
    timeline.to(this.camera.position, {
      x: 20,
      z: 0,
      duration: 4,
      ease: "power1.inOut"
    });
    
    timeline.to(this.camera.position, {
      x: 0,
      z: -20,
      duration: 4,
      ease: "power1.inOut"
    });
    
    timeline.to(this.camera.position, {
      x: -20,
      z: 0,
      duration: 4,
      ease: "power1.inOut"
    });
    
    // Top view
    timeline.to(this.camera.position, {
      x: 0,
      y: 25,
      z: 0,
      duration: 3,
      ease: "power2.inOut"
    });
    
    // Then return to original position
    timeline.to(this.camera.position, {
      x: startPosition.x,
      y: startPosition.y,
      z: startPosition.z,
      duration: 3,
      ease: "power2.inOut"
    });
    timeline.to(this.orbitControls.target, {
      x: startTarget.x,
      y: startTarget.y,
      z: startTarget.z,
      duration: 3,
      ease: "power2.inOut"
    }, "<");
  }
  
  animateCameraToBuilding() {
    gsap.to(this.camera.position, {
      x: 0,
      y: 5,
      z: 15,
      duration: 2,
      ease: "power2.inOut"
    });
    
    gsap.to(this.orbitControls.target, {
      x: 0,
      y: 2,
      z: 0,
      duration: 2,
      ease: "power2.inOut"
    });
  }
  
  update(delta) {
    if (this.isVirtualTourActive) {
      if (this.fpControls && this.clock) {
        this.fpControls.update(delta || this.clock.getDelta());
      }
    } else {
      if (this.orbitControls) {
        this.orbitControls.update();
      }
    }
  }
}

export default ControlsManager;