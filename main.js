// Main application initialization

class StopwatchApp {
    constructor() {
        this.stopwatch = null;
        this.soundManager = null;
        this.ui = null;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            // Initialize core components
            this.stopwatch = new Stopwatch();
            this.soundManager = new SoundManager();
            this.ui = new StopwatchUI(this.stopwatch, this.soundManager);
            
            console.log('Professional Stopwatch initialized successfully');
            
            // Add some helpful console commands for debugging
            if (typeof window !== 'undefined') {
                window.stopwatch = this.stopwatch;
                window.stopwatchUI = this.ui;
                window.soundManager = this.soundManager;
            }
            
        } catch (error) {
            console.error('Error initializing stopwatch application:', error);
            this.showErrorMessage('Failed to initialize the stopwatch application. Please refresh the page.');
        }
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #dc3545;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize the application
const app = new StopwatchApp();

// Add some global utilities for console debugging
window.StopwatchApp = StopwatchApp;

// Add helpful console commands
if (typeof console !== 'undefined') {
    console.log('%c Professional Stopwatch Loaded! ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold;');
    console.log('Available console commands:');
    console.log('• stopwatch - Access the stopwatch instance');
    console.log('• stopwatchUI - Access the UI controller');
    console.log('• soundManager - Access the sound manager');
    console.log('• TimeFormatter - Time formatting utilities');
    console.log('• StorageManager - Local storage utilities');
    console.log('• ExportManager - Export functionality');
}