// Utility functions for the stopwatch application

class TimeFormatter {
    static formatTime(milliseconds, format = 'ms') {
        const totalMs = Math.floor(milliseconds);
        const ms = totalMs % 1000;
        const totalSeconds = Math.floor(totalMs / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const hours = Math.floor(totalMinutes / 60);

        switch (format) {
            case 'ms':
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
            case 'cs':
                const cs = Math.floor(ms / 10);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
            case 's':
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            default:
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
        }
    }

    static formatShortTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    static parseTimeToMs(timeString) {
        const parts = timeString.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const secondsParts = parts[2].split('.');
        const seconds = parseInt(secondsParts[0]) || 0;
        const milliseconds = parseInt(secondsParts[1]) || 0;
        
        return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    }
}

class SoundManager {
    constructor() {
        this.enabled = true;
        this.context = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported');
        }
    }

    playBeep(frequency = 800, duration = 100, volume = 0.3) {
        if (!this.enabled || !this.context) return;

        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration / 1000);

            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }

    playStart() {
        this.playBeep(600, 150, 0.2);
    }

    playStop() {
        this.playBeep(400, 200, 0.2);
    }

    playLap() {
        this.playBeep(800, 100, 0.15);
    }

    playReset() {
        this.playBeep(300, 250, 0.2);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    isEnabled() {
        return this.enabled;
    }
}

class StorageManager {
    static saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save data to localStorage:', error);
        }
    }

    static loadData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load data from localStorage:', error);
            return defaultValue;
        }
    }

    static removeData(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove data from localStorage:', error);
        }
    }
}

class ExportManager {
    static exportToCSV(data, filename = 'stopwatch_results.csv') {
        const headers = ['Number', 'Time', 'Difference'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.number,
                item.time,
                item.diff || ''
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, filename, 'text/csv');
    }

    static exportToJSON(data, filename = 'stopwatch_results.json') {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    }

    static exportToText(data, filename = 'stopwatch_results.txt') {
        const textContent = data.map(item => 
            `${item.number}. ${item.time}${item.diff ? ` (${item.diff})` : ''}`
        ).join('\n');

        this.downloadFile(textContent, filename, 'text/plain');
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

class StatisticsCalculator {
    static calculateStats(times) {
        if (times.length === 0) return null;

        const numericTimes = times.map(item => TimeFormatter.parseTimeToMs(item.time));
        
        const total = numericTimes.reduce((sum, time) => sum + time, 0);
        const average = total / numericTimes.length;
        const best = Math.min(...numericTimes);
        const worst = Math.max(...numericTimes);

        return {
            total: TimeFormatter.formatTime(total),
            average: TimeFormatter.formatTime(average),
            best: TimeFormatter.formatTime(best),
            worst: TimeFormatter.formatTime(worst),
            count: times.length
        };
    }

    static findBestAndWorst(times) {
        if (times.length === 0) return { bestIndex: -1, worstIndex: -1 };

        const numericTimes = times.map(item => TimeFormatter.parseTimeToMs(item.time));
        const best = Math.min(...numericTimes);
        const worst = Math.max(...numericTimes);

        return {
            bestIndex: numericTimes.indexOf(best),
            worstIndex: numericTimes.indexOf(worst)
        };
    }
}

class AnimationManager {
    static addBounceAnimation(element) {
        element.classList.add('bounce');
        setTimeout(() => {
            element.classList.remove('bounce');
        }, 600);
    }

    static addPulseAnimation(element) {
        element.classList.add('running');
    }

    static removePulseAnimation(element) {
        element.classList.remove('running');
    }

    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress.toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(element.style.opacity) || 1;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = (startOpacity * (1 - progress)).toString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Export utilities for use in other modules
window.TimeFormatter = TimeFormatter;
window.SoundManager = SoundManager;
window.StorageManager = StorageManager;
window.ExportManager = ExportManager;
window.StatisticsCalculator = StatisticsCalculator;
window.AnimationManager = AnimationManager;