// Class untuk menangani fitur dark mode
export class DarkModeManager {
    constructor() {
      this.isDarkMode = false;
      this.themeToggleBtn = document.querySelector('.theme-toggle');
      this.themeIcon = this.themeToggleBtn ? this.themeToggleBtn.querySelector('i') : null;
      this.callbacks = [];
      
      this.init();
    }
    
    init() {
      // Check for saved theme preference
      this.checkSavedTheme();
      
      // Add event listener to toggle button
      if (this.themeToggleBtn) {
        this.themeToggleBtn.addEventListener('click', () => this.toggleDarkMode());
      }
    }
    
    checkSavedTheme() {
      // Check localStorage or system preference
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme === 'dark') {
        this.enableDarkMode(false);
      } else if (savedTheme === 'light') {
        this.enableLightMode(false);
      } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          this.enableDarkMode(false);
        }
      }
    }
    
    toggleDarkMode() {
      if (this.isDarkMode) {
        this.enableLightMode();
      } else {
        this.enableDarkMode();
      }
    }
    
    enableDarkMode(savePreference = true) {
      document.body.classList.add('dark-mode');
      this.isDarkMode = true;
      
      if (this.themeIcon) {
        this.themeIcon.classList.remove('fa-moon');
        this.themeIcon.classList.add('fa-sun');
      }
      
      if (savePreference) {
        localStorage.setItem('theme', 'dark');
      }
      
      // Execute all registered callbacks
      this.callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback(true); // true for dark mode
        }
      });
    }
    
    enableLightMode(savePreference = true) {
      document.body.classList.remove('dark-mode');
      this.isDarkMode = false;
      
      if (this.themeIcon) {
        this.themeIcon.classList.remove('fa-sun');
        this.themeIcon.classList.add('fa-moon');
      }
      
      if (savePreference) {
        localStorage.setItem('theme', 'light');
      }
      
      // Execute all registered callbacks
      this.callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback(false); // false for light mode
        }
      });
    }
    
    // Register a callback function to be executed when theme changes
    onThemeChange(callback) {
      if (typeof callback === 'function') {
        this.callbacks.push(callback);
      }
    }
    
    // Get current theme status
    getIsDarkMode() {
      return this.isDarkMode;
    }
  }
  
  export default DarkModeManager;