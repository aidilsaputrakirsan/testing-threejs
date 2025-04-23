import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Class untuk menangani animasi UI
export class UIAnimationManager {
  constructor() {
    this.fadeElements = document.querySelectorAll('.fade-in');
    this.statElements = document.querySelectorAll('.stat-number');
    this.timelineItems = document.querySelectorAll('.timeline-item');
    this.programCards = document.querySelectorAll('.program-card');
    this.galleryItems = document.querySelectorAll('.gallery-item');
    
    this.init();
  }
  
  init() {
    // Initialize fade-in animations
    this.initializeFadeAnimations();
    
    // Setup scroll animations
    this.setupScrollAnimations();
    
    // Setup statistics counter
    this.setupStatisticsCounter();
    
    // Setup timeline animations
    this.setupTimelineAnimations();
    
    // Setup program cards animations
    this.setupProgramCardsAnimations();
    
    // Setup gallery animations
    this.setupGalleryAnimations();
  }
  
  initializeFadeAnimations() {
    // Initial setup for fade-in elements
    gsap.set('.fade-in', { 
      opacity: 0, 
      y: 20 
    });
    
    // Animate hero section elements
    gsap.to('.hero-section .fade-in', { 
      opacity: 1, 
      y: 0, 
      duration: 1, 
      stagger: 0.2,
      delay: 0.5,
      ease: "power2.out"
    });
  }
  
  setupScrollAnimations() {
    // Create scroll animations for fade elements
    this.fadeElements.forEach(element => {
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleClass: "appear",
          once: true
        }
      });
    });
  }
  
  setupStatisticsCounter() {
    this.statElements.forEach(element => {
      const targetValue = parseInt(element.dataset.count);
      
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          once: true
        },
        innerText: targetValue,
        duration: 2,
        snap: { innerText: 1 },
        ease: "power2.out"
      });
    });
  }
  
  setupTimelineAnimations() {
    // Animate timeline items on scroll
    this.timelineItems.forEach((item, index) => {
      gsap.set(item, {
        opacity: 0,
        x: index % 2 === 0 ? -50 : 50
      });
      
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 80%",
          once: true
        },
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
        delay: index * 0.1
      });
    });
  }
  
  setupProgramCardsAnimations() {
    // Animate program cards on scroll
    gsap.set(this.programCards, {
      opacity: 0,
      y: 50
    });
    
    gsap.to(this.programCards, {
      scrollTrigger: {
        trigger: '.programs-container',
        start: "top 80%",
        once: true
      },
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power2.out"
    });
  }
  
  setupGalleryAnimations() {
    // Animate gallery items on scroll
    gsap.set(this.galleryItems, {
      opacity: 0,
      scale: 0.8
    });
    
    gsap.to(this.galleryItems, {
      scrollTrigger: {
        trigger: '.gallery-container',
        start: "top 80%",
        once: true
      },
      opacity: 1,
      scale: 1,
      duration: 1,
      stagger: 0.15,
      ease: "elastic.out(1, 0.5)"
    });
  }
  
  // Show loading screen
  showLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    loadingScreen.style.opacity = '1';
    loadingScreen.style.visibility = 'visible';
  }
  
  // Hide loading screen with animation
  hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        loadingScreen.style.visibility = 'hidden';
      }
    });
  }
  
  // Animate modal opening
  animateModalOpen(modalElement) {
    gsap.fromTo(modalElement.querySelector('.modal-content'), 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }
  
  // Back to top button functionality
  setupBackToTopButton() {
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        gsap.to(backToTop, { opacity: 1, visibility: 'visible', duration: 0.3 });
      } else {
        gsap.to(backToTop, { opacity: 0, duration: 0.3, onComplete: () => {
          backToTop.style.visibility = 'hidden';
        }});
      }
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Smooth scroll to section
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70, // Adjust for navbar height
        behavior: 'smooth'
      });
    }
  }
}

export default UIAnimationManager;