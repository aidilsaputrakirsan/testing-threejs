import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import custom modules
import { SceneManager } from './js/three/scene';
import { ControlsManager } from './js/three/controls';
import { InteractionManager } from './js/three/interaction';
import ModelsManager from './js/three/models';
import VirtualTourManager, { TourUtils, TourConfig } from './js/three/tour';
import { UIAnimationManager } from './js/ui/animations';
import { DarkModeManager } from './js/ui/darkMode';

// Import data
import facultyInfo from './data/faculty';
import programs from './data/programs';
import timelineData from './data/timeline';

// Import styles
import './style.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global variables
let sceneManager, controlsManager, interactionManager;
let modelsManager, virtualTourManager;
let uiAnimationManager, darkModeManager;
let facultyModel, clock;
let mixer, animations = {};
let isInitComplete = false;

// DOM Elements
const loadingScreen = document.querySelector('.loading-screen');
const threejsContainer = document.getElementById('threejs-container');
const tourContainer = document.getElementById('tour-container');
const startTourBtn = document.getElementById('start-tour');
const exitTourBtn = document.getElementById('exit-tour');
const exploreBtn = document.getElementById('explore-btn');
const tourBtn = document.getElementById('tour-btn');
const tourBtnNav = document.querySelector('.tour-btn');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');
const modal = document.getElementById('detail-modal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.querySelector('.modal-body');
const programDetailBtns = document.querySelectorAll('.program-detail-btn');
const tourLocationsContainer = document.querySelector('.tour-locations');

// Initialize everything
init();

function init() {
  // Create clock for animation timing
  clock = new THREE.Clock();
  
  // Start loading screen
  if (loadingScreen) {
    loadingScreen.style.opacity = '1';
    loadingScreen.style.visibility = 'visible';
  }
  
  // Initialize 3D scene
  if (threejsContainer) {
    initializeScene();
  }
  
  // Initialize UI animations
  uiAnimationManager = new UIAnimationManager();
  
  // Initialize dark mode
  darkModeManager = new DarkModeManager();
  // Add callback for theme change
  darkModeManager.onThemeChange((isDark) => {
    if (sceneManager) {
      sceneManager.toggleDarkMode();
    }
  });
  
  // Setup event listeners
  setupEventListeners();
  
  // Hide loading screen when everything is ready
  window.addEventListener('load', () => {
    if (uiAnimationManager) {
      uiAnimationManager.hideLoadingScreen();
    }
    isInitComplete = true;
  });
  
  // Start animation loop
  animate();
}

// Initialize Three.js scene
function initializeScene() {
  // Create scene manager
  sceneManager = new SceneManager(threejsContainer);
  
  // Create models manager
  modelsManager = new ModelsManager();
  
  // Create controls manager
  controlsManager = new ControlsManager(sceneManager.camera, sceneManager.renderer);
  controlsManager.setupClock(clock);
  
  // Create interaction manager
  interactionManager = new InteractionManager(
    sceneManager.scene, 
    sceneManager.camera, 
    sceneManager.renderer
  );
  
  // Create virtual tour manager
  virtualTourManager = new VirtualTourManager(
    sceneManager.scene,
    sceneManager.camera,
    sceneManager.renderer,
    modelsManager
  );
  
  // Initialize virtual tour
  if (tourContainer) {
    virtualTourManager.init(tourContainer);
    
    // Create tour location buttons
    if (tourLocationsContainer) {
      TourUtils.createLocationButtons(
        tourLocationsContainer, 
        TourConfig.defaultLocations,
        (locationId) => virtualTourManager.setLocation(locationId)
      );
    }
    
    // Inject tour styles
    TourUtils.injectTourStyles();
    
    // Add fullscreen button to tour container
    TourUtils.createFullscreenButton(tourContainer, tourContainer);
  }
  
  // Set interaction callbacks
  interactionManager.setOnFacultySignClick(() => showFacultyInfo());
  interactionManager.setOnBuildingClick(() => controlsManager.animateCameraToBuilding());
  
  // Load 3D models
  facultyModel = modelsManager.createFacultyModel();
  sceneManager.scene.add(facultyModel);
  
  // Setup interactive elements
  interactionManager.setupInteractiveElements();
}

// Setup event listeners
function setupEventListeners() {
  // Virtual tour controls
  if (startTourBtn) {
    startTourBtn.addEventListener('click', startVirtualTour);
  }
  
  if (exitTourBtn) {
    exitTourBtn.addEventListener('click', exitVirtualTour);
  }
  
  if (tourBtn) {
    tourBtn.addEventListener('click', scrollToTour);
  }
  
  if (tourBtnNav) {
    tourBtnNav.addEventListener('click', scrollToTour);
  }
  
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      if (controlsManager) {
        controlsManager.startCameraAnimation();
      }
    });
  }
  
  // Navigation toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', toggleNavigation);
    
    navLinksItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
  
  // Modal controls
  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Program detail buttons
  programDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const program = e.target.closest('.program-card').dataset.program;
      showProgramDetails(program);
    });
  });
  
  // Setup back to top button
  uiAnimationManager.setupBackToTopButton();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (sceneManager && sceneManager.renderer) {
      const container = virtualTourManager.isActive ? tourContainer : threejsContainer;
      if (container) {
        sceneManager.renderer.setSize(container.clientWidth, container.clientHeight);
        sceneManager.camera.aspect = container.clientWidth / container.clientHeight;
        sceneManager.camera.updateProjectionMatrix();
      }
    }
  });
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC key to exit tour
    if (e.key === 'Escape' && virtualTourManager && virtualTourManager.isActive) {
      exitVirtualTour();
    }
    
    // F key to toggle fullscreen
    if (e.key === 'f' && virtualTourManager && virtualTourManager.isActive) {
      toggleFullscreen(tourContainer);
    }
  });
}

// Toggle fullscreen mode
function toggleFullscreen(element) {
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Start virtual tour
function startVirtualTour() {
  if (virtualTourManager) {
    virtualTourManager.start();
    
    if (interactionManager) {
      interactionManager.setVirtualTourActive(true);
    }
    
    // Show tour container
    if (tourContainer) {
      tourContainer.style.display = 'block';
    }
    
    // Show tour controls
    const tourControls = document.querySelector('.tour-controls');
    if (tourControls) {
      tourControls.style.display = 'flex';
    }
  }
}

// Exit virtual tour
function exitVirtualTour() {
  if (virtualTourManager) {
    virtualTourManager.end();
    
    if (interactionManager) {
      interactionManager.setVirtualTourActive(false);
    }
    
    // Hide tour container
    if (tourContainer) {
      tourContainer.style.display = 'none';
    }
  }
}

// Scroll to tour section
function scrollToTour() {
  if (uiAnimationManager) {
    uiAnimationManager.scrollToSection('virtual-tour');
  }
}

// Toggle navigation menu
function toggleNavigation() {
  if (navLinks) {
    navLinks.classList.toggle('active');
  }
}

// Show faculty information
function showFacultyInfo() {
  if (modalBody && modal) {
    modalBody.innerHTML = `
      <h2>${facultyInfo.name}</h2>
      <div class="modal-divider"></div>
      <p>${facultyInfo.name} ${facultyInfo.university} didirikan pada tahun ${facultyInfo.established} sebagai pusat pendidikan dan penelitian di bidang sains dan teknologi informasi di Indonesia Timur.</p>
      
      <h3>Visi</h3>
      <p>${facultyInfo.vision}</p>
      
      <h3>Misi</h3>
      <ul>
        ${facultyInfo.mission.map(item => `<li>${item}</li>`).join('')}
      </ul>
      
      <h3>Fasilitas</h3>
      <p>Fakultas dilengkapi dengan berbagai fasilitas modern untuk mendukung proses pembelajaran dan penelitian:</p>
      <ul>
        ${facultyInfo.facilities.map(item => `<li>${item.name} - ${item.description}</li>`).join('')}
      </ul>
      
      <h3>Kontak</h3>
      <p>
        <strong>Alamat:</strong> ${facultyInfo.contact.address}<br>
        <strong>Telepon:</strong> ${facultyInfo.contact.phone}<br>
        <strong>Email:</strong> ${facultyInfo.contact.email}<br>
        <strong>Website:</strong> ${facultyInfo.contact.website}
      </p>
    `;
    modal.style.display = 'block';
    
    if (uiAnimationManager) {
      uiAnimationManager.animateModalOpen(modal);
    }
  }
}

// Show program details
function showProgramDetails(programId) {
  if (modalBody && modal && programs[programId]) {
    const program = programs[programId];
    
    modalBody.innerHTML = `
      <div class="program-header" style="background-color: ${program.color}">
        <i class="fas fa-${program.icon}"></i>
        <h2>Program Studi ${program.name}</h2>
      </div>
      <div class="modal-divider"></div>
      <p>${program.shortDesc}</p>
      
      <h3>Visi</h3>
      <p>${program.vision}</p>
      
      <h3>Kurikulum</h3>
      <p>Kurikulum dirancang sesuai dengan kebutuhan industri dan perkembangan teknologi terkini:</p>
      <ul>
        ${program.curriculum.map(item => `<li>${item}</li>`).join('')}
      </ul>
      
      <h3>Prospek Karir</h3>
      <p>Lulusan dapat berkarir sebagai:</p>
      <ul>
        ${program.careers.map(item => `<li>${item}</li>`).join('')}
      </ul>
      
      <h3>Fasilitas</h3>
      <ul>
        ${program.facilities.map(item => `<li>${item}</li>`).join('')}
      </ul>
      
      <div class="program-stats">
        <div class="stat-item">
          <span class="stat-number">${program.students}</span>
          <span class="stat-label">Mahasiswa Aktif</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${program.alumni}</span>
          <span class="stat-label">Alumni</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${2025 - program.established}</span>
          <span class="stat-label">Tahun</span>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn secondary apply-btn">Pendaftaran</button>
        <button class="btn primary curriculum-btn">Unduh Kurikulum</button>
      </div>
    `;
    modal.style.display = 'block';
    
    if (uiAnimationManager) {
      uiAnimationManager.animateModalOpen(modal);
    }
    
    // Add event listeners for buttons
    setTimeout(() => {
      const applyBtn = document.querySelector('.apply-btn');
      const curriculumBtn = document.querySelector('.curriculum-btn');
      
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          window.open('https://pmb.itk.ac.id', '_blank');
        });
      }
      
      if (curriculumBtn) {
        curriculumBtn.addEventListener('click', () => {
          alert('Dokumen kurikulum akan diunduh dalam implementasi sebenarnya.');
        });
      }
    }, 100);
  }
}

// Create detailed faculty model
function createDetailedFacultyModel() {
  // We're now using ModelsManager instead of this function,
  // but we'll keep it for compatibility with old code
  return modelsManager.createFacultyModel();
}

// Create main building
function createMainBuilding() {
  // We're now using ModelsManager instead of this function
  console.warn('createMainBuilding is deprecated, use modelsManager.createMainBuilding instead');
  return modelsManager.createMainBuilding();
}

// Create windows
function createWindows(buildingGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createWindows is deprecated, use modelsManager.createWindows instead');
  return modelsManager.createWindows(buildingGroup);
}

// Create main entrance
function createMainEntrance(buildingGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createMainEntrance is deprecated, use modelsManager.createMainEntrance instead');
  return modelsManager.createMainEntrance(buildingGroup);
}

// Create roof
function createRoof(buildingGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createRoof is deprecated, use modelsManager.createRoof instead');
  return modelsManager.createRoof(buildingGroup);
}

// Create faculty text
function createFacultyText(buildingGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createFacultyText is deprecated, use modelsManager.createFacultyText instead');
  return modelsManager.createFacultyText(buildingGroup);
}

// Add decorative elements
function addDecorativeElements(buildingGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('addDecorativeElements is deprecated, use modelsManager.addDecorativeElements instead');
  return modelsManager.addDecorativeElements(buildingGroup);
}

// Create secondary building
function createSecondaryBuilding() {
  // We're now using ModelsManager instead of this function
  console.warn('createSecondaryBuilding is deprecated, use modelsManager.createSecondaryBuilding instead');
  return modelsManager.createSecondaryBuilding();
}

// Create campus paths
function createCampusPaths(facultyGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createCampusPaths is deprecated, use modelsManager.createCampusPaths instead');
  return modelsManager.createCampusPaths(facultyGroup);
}

// Add trees and decorations
function addTreesAndDecorations(facultyGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('addTreesAndDecorations is deprecated, use modelsManager.addTreesAndDecorations instead');
  return modelsManager.addTreesAndDecorations(facultyGroup);
}

// Create tree
function createTree(type = 0) {
  // We're now using ModelsManager instead of this function
  console.warn('createTree is deprecated, use modelsManager.createTree instead');
  return modelsManager.createTree(type);
}

// Create bench
function createBench() {
  // We're now using ModelsManager instead of this function
  console.warn('createBench is deprecated, use modelsManager.createBench instead');
  return modelsManager.createBench();
}

// Create lamp post
function createLampPost() {
  // We're now using ModelsManager instead of this function
  console.warn('createLampPost is deprecated, use modelsManager.createLampPost instead');
  return modelsManager.createLampPost();
}

// Create campus entrance
function createCampusEntrance(facultyGroup) {
  // We're now using ModelsManager instead of this function
  console.warn('createCampusEntrance is deprecated, use modelsManager.createCampusEntrance instead');
  return modelsManager.createCampusEntrance(facultyGroup);
}

// Handle device performance detection
function detectDevicePerformance() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const gpuInfo = getGPUInfo();
  const cores = navigator.hardwareConcurrency || 4;
  
  if (isMobile || cores <= 2 || gpuInfo.tier === 'low') {
    return 'low';
  } else if (cores >= 8 && gpuInfo.tier === 'high') {
    return 'high';
  } else {
    return 'medium';
  }
}

// Get GPU information (simplified)
function getGPUInfo() {
  // This is a very simplified approach
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    return { tier: 'low', renderer: 'unknown' };
  }
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) {
    return { tier: 'medium', renderer: 'unknown' };
  }
  
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
  
  // Very simplified GPU detection
  const isHighEnd = /NVIDIA|RTX|GTX|Radeon|Adreno 6|Mali-G7/i.test(renderer);
  const isLowEnd = /Intel|HD Graphics|Mali-4|Mali-T|Adreno 3/i.test(renderer);
  
  if (isHighEnd) {
    return { tier: 'high', renderer };
  } else if (isLowEnd) {
    return { tier: 'low', renderer };
  } else {
    return { tier: 'medium', renderer };
  }
}

// Optimize rendering based on device performance
function optimizeForDevice() {
  const performance = detectDevicePerformance();
  
  switch (performance) {
    case 'low':
      // Reduce rendering quality
      if (sceneManager && sceneManager.renderer) {
        sceneManager.renderer.setPixelRatio(1);
        sceneManager.renderer.shadowMap.enabled = false;
      }
      break;
    
    case 'medium':
      // Default settings
      if (sceneManager && sceneManager.renderer) {
        sceneManager.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        sceneManager.renderer.shadowMap.enabled = true;
        sceneManager.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      break;
    
    case 'high':
      // Enhance visual quality
      if (sceneManager && sceneManager.renderer) {
        sceneManager.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        sceneManager.renderer.shadowMap.enabled = true;
        sceneManager.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      break;
  }
  
  // Add performance class to body
  document.body.classList.add(`performance-${performance}`);
  
  return performance;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update controls
  if (controlsManager && !virtualTourManager?.isActive) {
    controlsManager.update(delta);
  }
  
  // Update virtual tour
  if (virtualTourManager && virtualTourManager.isActive) {
    virtualTourManager.update(delta);
  }
  
  // Update scene
  if (sceneManager) {
    sceneManager.update();
  }
  
  // Slow constant rotation of faculty model
  if (facultyModel && !virtualTourManager?.isActive) {
    facultyModel.rotation.y += 0.001;
  }
  
  // Update any animation mixers
  if (mixer) {
    mixer.update(delta);
  }
  
  // Run any custom animations
  for (const key in animations) {
    if (animations[key]) animations[key]();
  }
  
  // Render scene
  if (sceneManager) {
    // Only render when initialization is complete or during loading
    if (!isInitComplete || document.visibilityState === 'visible') {
      sceneManager.render();
    }
  }
}

// Call performance optimization after initialization
window.addEventListener('load', () => {
  optimizeForDevice();
});