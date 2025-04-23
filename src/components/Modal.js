import { gsap } from 'gsap';

// Class untuk mengelola modal dialog
export class Modal {
  constructor() {
    this.modal = document.getElementById('detail-modal');
    this.closeBtn = document.querySelector('.close-modal');
    this.modalBody = document.querySelector('.modal-body');
    
    this.init();
  }
  
  init() {
    if (!this.modal || !this.closeBtn) return;
    
    // Close button event
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Close when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }
  
  open(content) {
    if (!this.modal || !this.modalBody) return;
    
    // Set content if provided
    if (content) {
      this.modalBody.innerHTML = content;
    }
    
    // Show modal
    this.modal.style.display = 'block';
    
    // Animate opening
    this.animateOpen();
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    return this;
  }
  
  close() {
    if (!this.modal) return;
    
    // Animate closing
    this.animateClose().then(() => {
      this.modal.style.display = 'none';
      
      // Allow body scrolling again
      document.body.style.overflow = '';
    });
    
    return this;
  }
  
  setContent(content) {
    if (this.modalBody) {
      this.modalBody.innerHTML = content;
    }
    
    return this;
  }
  
  animateOpen() {
    const content = this.modal.querySelector('.modal-content');
    
    gsap.fromTo(
      this.modal,
      { backgroundColor: 'rgba(0, 0, 0, 0)' },
      { backgroundColor: 'rgba(0, 0, 0, 0.7)', duration: 0.3 }
    );
    
    gsap.fromTo(
      content,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }
  
  animateClose() {
    const content = this.modal.querySelector('.modal-content');
    
    gsap.to(
      this.modal,
      { backgroundColor: 'rgba(0, 0, 0, 0)', duration: 0.3 }
    );
    
    return gsap.to(
      content,
      { opacity: 0, y: -50, duration: 0.3, ease: "power2.in" }
    ).then();
  }
}

export default Modal;