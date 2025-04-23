import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// Class untuk mengelola post-processing effects
export class PostProcessingManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.outlinePass = null;
    this.ssaoPass = null;
    this.fxaaPass = null;
    
    this.enabled = false;
    this.quality = 'medium'; // low, medium, high
    
    this.highlightedObjects = [];
    
    this.init();
  }
  
  init() {
    // Create effect composer
    this.composer = new EffectComposer(this.renderer);
    
    // Create render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    
    // Setup quality settings
    this.setQuality(this.quality);
  }
  
  setupPasses() {
    // Clear existing passes beyond the first (render pass)
    while (this.composer.passes.length > 1) {
      this.composer.passes.pop();
    }
    
    // Add bloom pass
    if (this.bloomEnabled) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.bloomSettings.strength,
        this.bloomSettings.radius,
        this.bloomSettings.threshold
      );
      this.composer.addPass(this.bloomPass);
    }
    
    // Add SSAO pass
    if (this.ssaoEnabled) {
      this.ssaoPass = new SSAOPass(
        this.scene,
        this.camera,
        window.innerWidth,
        window.innerHeight
      );
      this.ssaoPass.kernelRadius = this.ssaoSettings.kernelRadius;
      this.ssaoPass.minDistance = this.ssaoSettings.minDistance;
      this.ssaoPass.maxDistance = this.ssaoSettings.maxDistance;
      this.composer.addPass(this.ssaoPass);
    }
    
    // Add outline pass
    if (this.outlineEnabled) {
      this.outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.scene,
        this.camera
      );
      this.outlinePass.edgeStrength = this.outlineSettings.edgeStrength;
      this.outlinePass.edgeGlow = this.outlineSettings.edgeGlow;
      this.outlinePass.edgeThickness = this.outlineSettings.edgeThickness;
      this.outlinePass.pulsePeriod = this.outlineSettings.pulsePeriod;
      this.outlinePass.visibleEdgeColor.set(this.outlineSettings.edgeColor);
      this.outlinePass.hiddenEdgeColor.set(this.outlineSettings.hiddenEdgeColor);
      this.composer.addPass(this.outlinePass);
    }
    
    // Add anti-aliasing pass (always add last)
    if (this.fxaaEnabled) {
      this.fxaaPass = new ShaderPass(FXAAShader);
      this.fxaaPass.material.uniforms['resolution'].value.set(
        1 / window.innerWidth, 
        1 / window.innerHeight
      );
      this.composer.addPass(this.fxaaPass);
    }
  }
  
  setQuality(quality) {
    this.quality = quality;
    
    switch (quality) {
      case 'low':
        this.bloomEnabled = false;
        this.outlineEnabled = true;
        this.ssaoEnabled = false;
        this.fxaaEnabled = true;
        
        this.bloomSettings = {
          strength: 0.5,
          radius: 0.5,
          threshold: 0.8
        };
        
        this.outlineSettings = {
          edgeStrength: 3,
          edgeGlow: 0,
          edgeThickness: 1,
          pulsePeriod: 0,
          edgeColor: '#ffffff',
          hiddenEdgeColor: '#333333'
        };
        
        this.ssaoSettings = {
          kernelRadius: 16,
          minDistance: 0.005,
          maxDistance: 0.1
        };
        break;
        
      case 'medium':
        this.bloomEnabled = true;
        this.outlineEnabled = true;
        this.ssaoEnabled = false;
        this.fxaaEnabled = true;
        
        this.bloomSettings = {
          strength: 0.6,
          radius: 0.6,
          threshold: 0.7
        };
        
        this.outlineSettings = {
          edgeStrength: 5,
          edgeGlow: 0.5,
          edgeThickness: 2,
          pulsePeriod: 0,
          edgeColor: '#0088ff',
          hiddenEdgeColor: '#004488'
        };
        
        this.ssaoSettings = {
          kernelRadius: 24,
          minDistance: 0.01,
          maxDistance: 0.2
        };
        break;
        
      case 'high':
        this.bloomEnabled = true;
        this.outlineEnabled = true;
        this.ssaoEnabled = true;
        this.fxaaEnabled = true;
        
        this.bloomSettings = {
          strength: 0.8,
          radius: 0.8,
          threshold: 0.6
        };
        
        this.outlineSettings = {
          edgeStrength: 7,
          edgeGlow: 1,
          edgeThickness: 2.5,
          pulsePeriod: 2,
          edgeColor: '#0088ff',
          hiddenEdgeColor: '#004488'
        };
        
        this.ssaoSettings = {
          kernelRadius: 32,
          minDistance: 0.015,
          maxDistance: 0.3
        };
        break;
    }
    
    this.setupPasses();
  }
  
  setHighlightedObjects(objects) {
    this.highlightedObjects = Array.isArray(objects) ? objects : [objects];
    
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = this.highlightedObjects;
    }
  }
  
  addHighlightedObject(object) {
    if (!this.highlightedObjects.includes(object)) {
      this.highlightedObjects.push(object);
      
      if (this.outlinePass) {
        this.outlinePass.selectedObjects = this.highlightedObjects;
      }
    }
  }
  
  removeHighlightedObject(object) {
    const index = this.highlightedObjects.indexOf(object);
    if (index !== -1) {
      this.highlightedObjects.splice(index, 1);
      
      if (this.outlinePass) {
        this.outlinePass.selectedObjects = this.highlightedObjects;
      }
    }
  }
  
  clearHighlightedObjects() {
    this.highlightedObjects = [];
    
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = [];
    }
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
  
  toggle() {
    this.enabled = !this.enabled;
  }
  
  resize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    
    if (this.fxaaPass) {
      this.fxaaPass.material.uniforms['resolution'].value.set(
        1 / width, 
        1 / height
      );
    }
  }
  
  render() {
    if (this.enabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default PostProcessingManager;