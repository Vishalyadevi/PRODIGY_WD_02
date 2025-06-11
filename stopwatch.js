// Core stopwatch functionality

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsed = 0;
        this.isRunning = false;
        this.lapTimes = [];
        this.splitTime = 0;
        this.mode = 'lap'; // 'lap' or 'split'
        this.timeFormat = 'ms'; // 'ms', 'cs', 's'
        this.intervalId = null;
        this.updateCallback = null;
        
        // Load saved settings
        this.loadSettings();
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now() - this.elapsed;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.elapsed = Date.now() - this.startTime;
            if (this.updateCallback) {
                this.updateCallback(this.elapsed);
            }
        }, 10); // Update every 10ms for smooth display
        
        this.saveSettings();
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.saveSettings();
    }

    reset() {
        this.stop();
        this.elapsed = 0;
        this.lapTimes = [];
        this.splitTime = 0;
        this.startTime = 0;
        
        if (this.updateCallback) {
            this.updateCallback(0);
        }
        
        this.saveSettings();
    }

    lap() {
        if (!this.isRunning) return null;

        const currentTime = this.elapsed;
        const lapNumber = this.lapTimes.length + 1;
        
        let lapTime, diff = null;
        
        if (this.mode === 'lap') {
            // Lap mode: time since last lap (or start)
            lapTime = currentTime - this.splitTime;
            this.splitTime = currentTime;
            
            // Calculate difference from previous lap
            if (this.lapTimes.length > 0) {
                const previousLapTime = TimeFormatter.parseTimeToMs(this.lapTimes[this.lapTimes.length - 1].time);
                const diffMs = lapTime - previousLapTime;
                if (diffMs > 0) {
                    diff = `+${TimeFormatter.formatTime(diffMs, this.timeFormat)}`;
                } else if (diffMs < 0) {
                    diff = `-${TimeFormatter.formatTime(Math.abs(diffMs), this.timeFormat)}`;
                }
            }
        } else {
            // Split mode: total elapsed time
            lapTime = currentTime;
            
            // Calculate difference from previous split
            if (this.lapTimes.length > 0) {
                const previousSplitTime = TimeFormatter.parseTimeToMs(this.lapTimes[this.lapTimes.length - 1].time);
                const diffMs = lapTime - previousSplitTime;
                diff = `+${TimeFormatter.formatTime(diffMs, this.timeFormat)}`;
            }
        }

        const lapData = {
            number: lapNumber,
            time: TimeFormatter.formatTime(lapTime, this.timeFormat),
            totalTime: TimeFormatter.formatTime(currentTime, this.timeFormat),
            diff: diff,
            timestamp: Date.now()
        };

        this.lapTimes.push(lapData);
        this.saveSettings();
        return lapData;
    }

    getCurrentTime() {
        return this.elapsed;
    }

    getCurrentSplitTime() {
        if (this.mode === 'split') {
            return this.elapsed;
        } else {
            return this.elapsed - this.splitTime;
        }
    }

    getLapTimes() {
        return [...this.lapTimes];
    }

    setMode(mode) {
        if (mode === this.mode) return;
        
        this.mode = mode;
        
        // Reset split time when changing modes
        if (this.isRunning) {
            this.splitTime = this.elapsed;
        }
        
        this.saveSettings();
    }

    getMode() {
        return this.mode;
    }

    setTimeFormat(format) {
        this.timeFormat = format;
        this.saveSettings();
    }

    getTimeFormat() {
        return this.timeFormat;
    }

    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    clearLapTimes() {
        this.lapTimes = [];
        this.saveSettings();
    }

    saveSettings() {
        const settings = {
            elapsed: this.elapsed,
            lapTimes: this.lapTimes,
            splitTime: this.splitTime,
            mode: this.mode,
            timeFormat: this.timeFormat,
            isRunning: this.isRunning,
            startTime: this.isRunning ? this.startTime : 0
        };
        
        StorageManager.saveData('stopwatch_settings', settings);
    }

    loadSettings() {
        const settings = StorageManager.loadData('stopwatch_settings');
        
        if (settings) {
            this.elapsed = settings.elapsed || 0;
            this.lapTimes = settings.lapTimes || [];
            this.splitTime = settings.splitTime || 0;
            this.mode = settings.mode || 'lap';
            this.timeFormat = settings.timeFormat || 'ms';
            
            // Don't restore running state - always start stopped
            this.isRunning = false;
        }
    }

    // Get statistics for current lap times
    getStatistics() {
        return StatisticsCalculator.calculateStats(this.lapTimes);
    }

    // Export lap times in various formats
    exportLapTimes(format = 'csv') {
        const data = this.lapTimes.map(lap => ({
            number: lap.number,
            time: lap.time,
            diff: lap.diff
        }));

        switch (format) {
            case 'csv':
                ExportManager.exportToCSV(data);
                break;
            case 'json':
                ExportManager.exportToJSON(data);
                break;
            case 'txt':
                ExportManager.exportToText(data);
                break;
            default:
                ExportManager.exportToCSV(data);
        }
    }
}

// Make Stopwatch available globally
window.Stopwatch = Stopwatch;