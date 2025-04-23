import * as THREE from 'three';
import { gsap } from 'gsap';

// Class untuk menangani interaksi dengan objek 3D
export class InteractionManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.highlightedObjects = [];
    this.isVirtualTourActive = false;
    
    this.init();
  }
  
  init() {
    // Add event listeners
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    window.addEventListener('click', (e) => this.onMouseClick(e), false);
  }
  
  setupInteractiveElements() {
    // Reset highlighted objects
    this.highlightedObjects = [];
    
    // Add interactivity to doors
    const leftDoor = this.scene.getObjectByName("leftDoor");
    const rightDoor = this.scene.getObjectByName("rightDoor");
    
    if (leftDoor && rightDoor) {
      this.highlightedObjects.push(leftDoor);
      this.highlightedObjects.push(rightDoor);
      
      // Add custom properties for animation
      leftDoor.userData.isOpen = false;
      rightDoor.userData.isOpen = false;
      leftDoor.userData.originalPosition = leftDoor.position.clone();
      rightDoor.userData.originalPosition = rightDoor.position.clone();
    }
    
    // Add interactivity to faculty sign
    const facultySign = this.scene.getObjectByName("facultySign");
    if (facultySign) {
      this.highlightedObjects.push(facultySign);
    }
    
    // Add interactivity to building
    const building = this.scene.getObjectByName("building");
    if (building) {
      this.highlightedObjects.push(building);
    }
    
    // Add interactivity to windows
    this.scene.traverse((object) => {
      if (object.name === "window") {
        this.highlightedObjects.push(object);
        
        // Add custom properties for animation
        object.userData.isLit = false;
        object.userData.originalColor = object.material.color.clone();
      }
    });
  }
  
  onMouseMove(event) {
    if (this.isVirtualTourActive) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast and highlight interactive objects
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.highlightedObjects);
    
    // Reset all objects
    this.highlightedObjects.forEach(obj => {
      if (obj.material && !obj.userData.isLit) {
        obj.material.emissive = new THREE.Color(0x000000);
      }
    });
    
    // Highlight hovered object
    if (intersects.length > 0) {
      const object = intersects[0].object;
      if (object.material) {
        object.material.emissive = new THREE.Color(0x333333);
        document.body.style.cursor = 'pointer';
      }
    } else {
      document.body.style.cursor = 'default';
    }
  }
  
  onMouseClick(event) {
    if (this.isVirtualTourActive) return;
    
    // Raycast to find clicked objects
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.highlightedObjects);
    
    if (intersects.length > 0) {
      const object = intersects[0].object;
      
      // Handle different object interactions
      if (object.name === "leftDoor" || object.name === "rightDoor") {
        this.toggleDoor(object);
      } else if (object.name === "window") {
        this.toggleWindowLight(object);
      } else if (object.name === "facultySign") {
        if (this.onFacultySignClick) {
          this.onFacultySignClick();
        }
      } else if (object.name === "building") {
        if (this.onBuildingClick) {
          this.onBuildingClick();
        }
      }
    }
  }
  
  toggleDoor(door) {
    if (!door.userData.isOpen) {
      const direction = door.name === "leftDoor" ? -1 : 1;
      gsap.to(door.position, {
        x: door.userData.originalPosition.x + (direction * 0.9),
        duration: 1,
        ease: "power2.out"
      });
      door.userData.isOpen = true;
    } else {
      gsap.to(door.position, {
        x: door.userData.originalPosition.x,
        duration: 1,
        ease: "power2.in"
      });
      door.userData.isOpen = false;
    }
  }
  
  toggleWindowLight(windowObj) {
    if (!windowObj.userData.isLit) {
      windowObj.userData.isLit = true;
      gsap.to(windowObj.material.color, {
        r: 1,
        g: 0.9,
        b: 0.6,
        duration: 0.5
      });
      gsap.to(windowObj.material, {
        emissive: new THREE.Color(0xffbb33).getHex(),
        emissiveIntensity: 0.5,
        duration: 0.5
      });
    } else {
      windowObj.userData.isLit = false;
      gsap.to(windowObj.material.color, {
        r: windowObj.userData.originalColor.r,
        g: windowObj.userData.originalColor.g,
        b: windowObj.userData.originalColor.b,
        duration: 0.5
      });
      gsap.to(windowObj.material, {
        emissive: new THREE.Color(0x000000).getHex(),
        emissiveIntensity: 0,
        duration: 0.5
      });
    }
  }
  
  setVirtualTourActive(active) {
    this.isVirtualTourActive = active;
  }
  
  setOnFacultySignClick(callback) {
    this.onFacultySignClick = callback;
  }
  
  setOnBuildingClick(callback) {
    this.onBuildingClick = callback;
  }
}

export default InteractionManager;