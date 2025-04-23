// Class untuk mengelola navigasi
export class Navigation {
    constructor() {
      this.navbar = document.querySelector('.navbar');
      this.navToggle = document.querySelector('.nav-toggle');
      this.navLinks = document.querySelector('.nav-links');
      this.navLinksItems = document.querySelectorAll('.nav-links a');
      
      this.init();
    }
    
    init() {
      if (!this.navbar || !this.navToggle || !this.navLinks) return;
      
      // Toggle menu on mobile
      this.navToggle.addEventListener('click', () => this.toggleNavigation());
      
      // Close menu when clicking on links
      this.navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
          this.navLinks.classList.remove('active');
          
          // Add active class to current link
          this.navLinksItems.forEach(link => link.classList.remove('active'));
          item.classList.add('active');
        });
      });
      
      // Add scroll event to change navbar appearance
      window.addEventListener('scroll', () => this.handleScroll());
      
      // Handle active link on scroll
      window.addEventListener('scroll', () => this.updateActiveLink());
      
      // Initial check for active link
      this.updateActiveLink();
    }
    
    toggleNavigation() {
      this.navLinks.classList.toggle('active');
    }
    
    handleScroll() {
      if (window.scrollY > 100) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }
    
    updateActiveLink() {
      const scrollPosition = window.scrollY + 150; // Offset for better detection
      
      // Find the section that is currently in view
      document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (
          scrollPosition >= sectionTop && 
          scrollPosition < sectionTop + sectionHeight &&
          sectionId
        ) {
          this.navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }
  }
  
  export default Navigation;