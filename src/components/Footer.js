// Class untuk mengelola footer
export class Footer {
    constructor(facultyInfo) {
      this.footer = document.querySelector('.footer');
      this.facultyInfo = facultyInfo;
      
      this.init();
    }
    
    init() {
      if (!this.footer) return;
      
      // Tambahkan tahun copyright yang dinamis
      const currentYear = new Date().getFullYear();
      const copyrightElement = this.footer.querySelector('.footer-bottom p:first-child');
      
      if (copyrightElement) {
        copyrightElement.textContent = `© ${currentYear} ${this.facultyInfo.name} - ${this.facultyInfo.university}`;
      }
      
      // Social media links
      this.setupSocialLinks();
      
      // Add footer animation
      this.setupAnimation();
    }
    
    setupSocialLinks() {
      const socialLinks = this.footer.querySelectorAll('.social-icon');
      
      if (socialLinks.length > 0 && this.facultyInfo.contact && this.facultyInfo.contact.social) {
        const social = this.facultyInfo.contact.social;
        
        // Facebook
        if (social.facebook) {
          const facebookLink = this.footer.querySelector('.social-icon .fa-facebook')?.parentElement;
          if (facebookLink) {
            facebookLink.setAttribute('href', `https://facebook.com/${social.facebook}`);
            facebookLink.setAttribute('target', '_blank');
            facebookLink.setAttribute('rel', 'noopener noreferrer');
          }
        }
        
        // Twitter
        if (social.twitter) {
          const twitterLink = this.footer.querySelector('.social-icon .fa-twitter')?.parentElement;
          if (twitterLink) {
            twitterLink.setAttribute('href', `https://twitter.com/${social.twitter}`);
            twitterLink.setAttribute('target', '_blank');
            twitterLink.setAttribute('rel', 'noopener noreferrer');
          }
        }
        
        // Instagram
        if (social.instagram) {
          const instagramLink = this.footer.querySelector('.social-icon .fa-instagram')?.parentElement;
          if (instagramLink) {
            instagramLink.setAttribute('href', `https://instagram.com/${social.instagram}`);
            instagramLink.setAttribute('target', '_blank');
            instagramLink.setAttribute('rel', 'noopener noreferrer');
          }
        }
        
        // YouTube
        if (social.youtube) {
          const youtubeLink = this.footer.querySelector('.social-icon .fa-youtube')?.parentElement;
          if (youtubeLink) {
            youtubeLink.setAttribute('href', `https://youtube.com/c/${social.youtube}`);
            youtubeLink.setAttribute('target', '_blank');
            youtubeLink.setAttribute('rel', 'noopener noreferrer');
          }
        }
      }
    }
    
    setupAnimation() {
      // Add intersection observer to animate footer when it comes into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(this.footer);
    }
  }
  
  export default Footer;