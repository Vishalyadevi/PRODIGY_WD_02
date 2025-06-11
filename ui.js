// UI management and interaction handling

class StopwatchUI {
    constructor(stopwatch, soundManager) {
        this.stopwatch = stopwatch;
        this.soundManager = soundManager;
        this.isFullscreen = false;
        this.theme = 'dark';
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadUISettings();
        this.updateDisplay();
    }

    initializeElements() {
        // Main controls
        this.startStopBtn = document.getElementById('startStopBtn');
        this.lapSplitBtn = document.getElementById('lapSplitBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Display elements
        this.mainTime = document.getElementById('mainTime');
        this.splitTimeDisplay = document.getElementById('splitTimeDisplay');
        this.splitTime = document.getElementById('splitTime');
        this.progressRing = document.getElementById('progressRing');
        this.progressCircle = document.getElementById('progressCircle');
        this.progressTime = document.getElementById('progressTime');
        
        // Results
        this.resultsList = document.getElementById('resultsList');
        this.resultsTitle = document.getElementById('resultsTitle');
        this.resultsStats = document.getElementById('resultsStats');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearBtn = document.getElementById('clearBtn');
        
        // Controls
        this.themeToggle = document.getElementById('themeToggle');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.soundToggle = document.getElementById('soundToggle');
        
        // Mode and format selectors
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.formatButtons = document.querySelectorAll('.format-btn');
    }

    setupEventListeners() {
        // Main controls
        this.startStopBtn.addEventListener('click', () => this.toggleStartStop());
        this.lapSplitBtn.addEventListener('click', () => this.recordLapSplit());
        this.resetBtn.addEventListener('click', () => this.resetStopwatch());
        
        // Header controls
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Results controls
        this.exportBtn.addEventListener('click', () => this.exportResults());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        
        // Mode selection
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
        });
        
        // Format selection
        this.formatButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setTimeFormat(btn.dataset.format));
        });
        
        // Fullscreen change event
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        
        // Set up stopwatch update callback
        this.stopwatch.setUpdateCallback((elapsed) => this.updateTimeDisplay(elapsed));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleStartStop();
                    break;
                case 'KeyL':
                    e.preventDefault();
                    this.recordLapSplit();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.resetStopwatch();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'KeyT':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.toggleSound();
                    break;
            }
        });
    }

    toggleStartStop() {
        if (this.stopwatch.isRunning) {
            this.stopwatch.stop();
            this.soundManager.playStop();
            this.updateStartStopButton(false);
            this.hideProgressRing();
            AnimationManager.removePulseAnimation(this.startStopBtn);
        } else {
            this.stopwatch.start();
            this.soundManager.playStart();
            this.updateStartStopButton(true);
            this.showProgressRing();
            AnimationManager.addPulseAnimation(this.startStopBtn);
        }
        
        this.updateButtonStates();
    }

    recordLapSplit() {
        if (!this.stopwatch.isRunning) return;
        
        const lapData = this.stopwatch.lap();
        if (lapData) {
            this.soundManager.playLap();
            this.addResultItem(lapData);
            this.updateResultsStats();
            this.updateButtonStates();
            AnimationManager.addBounceAnimation(this.lapSplitBtn);
        }
    }

    resetStopwatch() {
        this.stopwatch.reset();
        this.soundManager.playReset();
        this.updateStartStopButton(false);
        this.updateButtonStates();
        this.clearResultsDisplay();
        this.hideProgressRing();
        this.hideSplitTime();
        AnimationManager.removePulseAnimation(this.startStopBtn);
        AnimationManager.addBounceAnimation(this.resetBtn);
    }

    updateTimeDisplay(elapsed) {
        const formattedTime = TimeFormatter.formatTime(elapsed, this.stopwatch.getTimeFormat());
        this.mainTime.textContent = formattedTime;
        
        // Update split time display
        if (this.stopwatch.isRunning) {
            const splitTime = this.stopwatch.getCurrentSplitTime();
            const formattedSplitTime = TimeFormatter.formatTime(splitTime, this.stopwatch.getTimeFormat());
            this.splitTime.textContent = formattedSplitTime;
            this.showSplitTime();
        }
        
        // Update progress ring
        this.updateProgressRing(elapsed);
    }

    updateDisplay() {
        const elapsed = this.stopwatch.getCurrentTime();
        this.updateTimeDisplay(elapsed);
        this.updateStartStopButton(this.stopwatch.isRunning);
        this.updateButtonStates();
        this.updateModeDisplay();
        this.updateFormatDisplay();
        this.displayResults();
        this.updateResultsStats();
        
        if (this.stopwatch.isRunning) {
            this.showProgressRing();
            AnimationManager.addPulseAnimation(this.startStopBtn);
        }
    }

    updateStartStopButton(isRunning) {
        const icon = this.startStopBtn.querySelector('i');
        const text = this.startStopBtn.querySelector('span');
        
        if (isRunning) {
            icon.className = 'fas fa-pause';
            text.textContent = 'Stop';
            this.startStopBtn.classList.add('running');
        } else {
            icon.className = 'fas fa-play';
            text.textContent = 'Start';
            this.startStopBtn.classList.remove('running');
        }
    }

    updateButtonStates() {
        const isRunning = this.stopwatch.isRunning;
        const hasElapsed = this.stopwatch.getCurrentTime() > 0;
        const hasLaps = this.stopwatch.getLapTimes().length > 0;
        
        this.lapSplitBtn.disabled = !isRunning;
        this.resetBtn.disabled = !hasElapsed && !hasLaps;
        this.exportBtn.disabled = !hasLaps;
        this.clearBtn.disabled = !hasLaps;
    }

    updateModeDisplay() {
        const currentMode = this.stopwatch.getMode();
        
        this.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === currentMode);
        });
        
        // Update lap/split button text
        const lapSplitText = this.lapSplitBtn.querySelector('span');
        const lapSplitIcon = this.lapSplitBtn.querySelector('i');
        
        if (currentMode === 'lap') {
            lapSplitText.textContent = 'Lap';
            lapSplitIcon.className = 'fas fa-flag';
            this.resultsTitle.textContent = 'Lap Times';
        } else {
            lapSplitText.textContent = 'Split';
            lapSplitIcon.className = 'fas fa-cut';
            this.resultsTitle.textContent = 'Split Times';
        }
    }

    updateFormatDisplay() {
        const currentFormat = this.stopwatch.getTimeFormat();
        
        this.formatButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === currentFormat);
        });
    }

    showSplitTime() {
        if (!this.splitTimeDisplay.classList.contains('visible')) {
            this.splitTimeDisplay.classList.add('visible');
        }
    }

    hideSplitTime() {
        this.splitTimeDisplay.classList.remove('visible');
    }

    showProgressRing() {
        this.progressRing.classList.add('visible');
    }

    hideProgressRing() {
        this.progressRing.classList.remove('visible');
    }

    updateProgressRing(elapsed) {
        const seconds = Math.floor(elapsed / 1000) % 60;
        const progress = (seconds / 60) * 314.16; // 2 * π * r where r = 50
        
        this.progressCircle.style.strokeDashoffset = 314.16 - progress;
        this.progressTime.textContent = TimeFormatter.formatShortTime(elapsed);
    }

    setMode(mode) {
        this.stopwatch.setMode(mode);
        this.updateModeDisplay();
        this.clearResultsDisplay();
        this.displayResults();
    }

    setTimeFormat(format) {
        this.stopwatch.setTimeFormat(format);
        this.updateFormatDisplay();
        this.updateDisplay();
        this.displayResults();
    }

    addResultItem(lapData) {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const number = document.createElement('div');
        number.className = 'result-number';
        number.textContent = `#${lapData.number}`;
        
        const time = document.createElement('div');
        time.className = 'result-time';
        time.textContent = lapData.time;
        
        const diff = document.createElement('div');
        diff.className = 'result-diff';
        
        if (lapData.diff) {
            diff.textContent = lapData.diff;
            diff.classList.add(lapData.diff.startsWith('+') ? 'slower' : 'faster');
        }
        
        item.appendChild(number);
        item.appendChild(time);
        if (lapData.diff) {
            item.appendChild(diff);
        }
        
        // Remove "no results" message if it exists
        const noResults = this.resultsList.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
        
        this.resultsList.appendChild(item);
        
        // Scroll to bottom
        this.resultsList.scrollTop = this.resultsList.scrollHeight;
        
        // Highlight best/worst times
        this.highlightBestWorst();
    }

    displayResults() {
        const lapTimes = this.stopwatch.getLapTimes();
        
        if (lapTimes.length === 0) {
            this.resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-clock"></i>
                    <p>No times recorded yet</p>
                    <p class="hint">Start the stopwatch and press ${this.stopwatch.getMode() === 'lap' ? 'Lap' : 'Split'} to record times</p>
                </div>
            `;
            return;
        }
        
        this.resultsList.innerHTML = '';
        
        lapTimes.forEach(lapData => {
            this.addResultItem(lapData);
        });
    }

    highlightBestWorst() {
        const items = this.resultsList.querySelectorAll('.result-item');
        if (items.length < 2) return;
        
        const lapTimes = this.stopwatch.getLapTimes();
        const { bestIndex, worstIndex } = StatisticsCalculator.findBestAndWorst(lapTimes);
        
        items.forEach((item, index) => {
            item.classList.remove('best', 'worst');
            if (index === bestIndex) {
                item.classList.add('best');
            } else if (index === worstIndex) {
                item.classList.add('worst');
            }
        });
    }

    updateResultsStats() {
        const stats = this.stopwatch.getStatistics();
        
        if (!stats) {
            this.resultsStats.innerHTML = '';
            return;
        }
        
        this.resultsStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">Total</div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Average</div>
                <div class="stat-value">${stats.average}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Best</div>
                <div class="stat-value">${stats.best}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Worst</div>
                <div class="stat-value">${stats.worst}</div>
            </div>
        `;
    }

    clearResults() {
        this.stopwatch.clearLapTimes();
        this.clearResultsDisplay();
        this.updateButtonStates();
        this.updateResultsStats();
    }

    clearResultsDisplay() {
        this.displayResults();
    }

    exportResults() {
        const format = prompt('Export format (csv, json, txt):', 'csv');
        if (format && ['csv', 'json', 'txt'].includes(format.toLowerCase())) {
            this.stopwatch.exportLapTimes(format.toLowerCase());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        this.saveUISettings();
    }

    toggleSound() {
        const enabled = this.soundManager.toggle();
        const icon = this.soundToggle.querySelector('i');
        icon.className = enabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        
        this.saveUISettings();
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            document.body.classList.add('fullscreen');
            this.fullscreenBtn.querySelector('i').className = 'fas fa-compress';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            document.body.classList.remove('fullscreen');
            this.fullscreenBtn.querySelector('i').className = 'fas fa-expand';
        }
        
        this.isFullscreen = !this.isFullscreen;
    }

    handleFullscreenChange() {
        if (!document.fullscreenElement) {
            document.body.classList.remove('fullscreen');
            this.fullscreenBtn.querySelector('i').className = 'fas fa-expand';
            this.isFullscreen = false;
        }
    }

    saveUISettings() {
        const settings = {
            theme: this.theme,
            soundEnabled: this.soundManager.isEnabled(),
            isFullscreen: this.isFullscreen
        };
        
        StorageManager.saveData('stopwatch_ui_settings', settings);
    }

    loadUISettings() {
        const settings = StorageManager.loadData('stopwatch_ui_settings');
        
        if (settings) {
            if (settings.theme) {
                this.theme = settings.theme;
                document.documentElement.setAttribute('data-theme', this.theme);
                const icon = this.themeToggle.querySelector('i');
                icon.className = this.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
            }
            
            if (settings.soundEnabled !== undefined) {
                this.soundManager.enabled = settings.soundEnabled;
                const icon = this.soundToggle.querySelector('i');
                icon.className = settings.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
        }
    }
}

// Make StopwatchUI available globally
window.StopwatchUI = StopwatchUI;