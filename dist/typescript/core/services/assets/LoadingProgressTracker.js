/**
 * Loading Progress Tracker - Single responsibility for tracking loading progress
 * Handles progress callbacks, status tracking, completion notifications
 */
export class LoadingProgressTracker {
    constructor() {
        this.progressCallbacks = [];
        this.completionCallbacks = [];
        this.errorCallbacks = [];
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.isLoading = false;
        this.currentFile = '';
        this.currentCategory = '';
        this.startTime = 0;
        this.lastProgressTime = 0;
        // Progress history for ETA calculation
        this.progressHistory = [];
        this.historyLength = 10;
    }
    /**
     * Start tracking progress for a new loading session
     */
    startTracking(totalAssets, category = 'assets') {
        this.totalAssets = totalAssets;
        this.loadedAssets = 0;
        this.isLoading = true;
        this.currentFile = '';
        this.currentCategory = category;
        this.startTime = Date.now();
        this.lastProgressTime = this.startTime;
        this.progressHistory = [];
        console.log(`📊 Started tracking progress for ${totalAssets} ${category}`);
    }
    /**
     * Update progress based on Phaser loader progress
     */
    updateProgress(phaserProgress, currentFile = '') {
        if (!this.isLoading)
            return;
        const now = Date.now();
        this.currentFile = currentFile;
        this.loadedAssets = Math.floor(phaserProgress * this.totalAssets);
        this.lastProgressTime = now;
        // Add to progress history for ETA calculation
        this.progressHistory.push({ time: now, loaded: this.loadedAssets });
        if (this.progressHistory.length > this.historyLength) {
            this.progressHistory.shift();
        }
        const progressInfo = this.calculateProgressInfo();
        this.notifyProgress(progressInfo);
    }
    /**
     * Update progress with specific loaded count
     */
    updateProgressCount(loadedCount, currentFile = '') {
        if (!this.isLoading)
            return;
        const now = Date.now();
        this.currentFile = currentFile;
        this.loadedAssets = loadedCount;
        this.lastProgressTime = now;
        this.progressHistory.push({ time: now, loaded: this.loadedAssets });
        if (this.progressHistory.length > this.historyLength) {
            this.progressHistory.shift();
        }
        const progressInfo = this.calculateProgressInfo();
        this.notifyProgress(progressInfo);
    }
    /**
     * Calculate comprehensive progress information
     */
    calculateProgressInfo() {
        const now = Date.now();
        const timeElapsed = now - this.startTime;
        const percentage = this.totalAssets > 0 ? Math.floor((this.loadedAssets / this.totalAssets) * 100) : 0;
        // Calculate estimated time remaining
        let estimatedTimeRemaining = 0;
        if (this.progressHistory.length >= 2 && this.loadedAssets > 0) {
            const oldestProgress = this.progressHistory[0];
            const latestProgress = this.progressHistory[this.progressHistory.length - 1];
            const timeDiff = latestProgress.time - oldestProgress.time;
            const loadedDiff = latestProgress.loaded - oldestProgress.loaded;
            if (loadedDiff > 0 && timeDiff > 0) {
                const loadingRate = loadedDiff / timeDiff; // assets per millisecond
                const remainingAssets = this.totalAssets - this.loadedAssets;
                estimatedTimeRemaining = remainingAssets / loadingRate;
            }
        }
        return {
            loaded: this.loadedAssets,
            total: this.totalAssets,
            percentage,
            currentFile: this.currentFile,
            category: this.currentCategory,
            timeElapsed,
            estimatedTimeRemaining: Math.max(0, estimatedTimeRemaining)
        };
    }
    /**
     * Mark loading as complete
     */
    completeLoading() {
        if (!this.isLoading)
            return;
        this.isLoading = false;
        this.loadedAssets = this.totalAssets;
        const finalProgress = this.calculateProgressInfo();
        this.notifyProgress(finalProgress);
        this.notifyCompletion();
        const totalTime = Date.now() - this.startTime;
        console.log(`✅ Loading completed: ${this.totalAssets} ${this.currentCategory} in ${totalTime}ms`);
    }
    /**
     * Report loading error
     */
    reportError(errorMessage, fileName) {
        const fullError = fileName ? `${errorMessage}: ${fileName}` : errorMessage;
        console.warn(`❌ Loading error: ${fullError}`);
        this.notifyError(fullError);
    }
    /**
     * Get current loading status
     */
    getLoadingStatus() {
        const progressInfo = this.calculateProgressInfo();
        return {
            isLoading: this.isLoading,
            progress: progressInfo.percentage / 100,
            loaded: this.loadedAssets,
            total: this.totalAssets,
            timeElapsed: progressInfo.timeElapsed || 0,
            estimatedTimeRemaining: progressInfo.estimatedTimeRemaining || 0
        };
    }
    /**
     * Subscribe to progress updates
     */
    onProgress(callback) {
        this.progressCallbacks.push(callback);
    }
    /**
     * Subscribe to completion notifications
     */
    onComplete(callback) {
        this.completionCallbacks.push(callback);
    }
    /**
     * Subscribe to error notifications
     */
    onError(callback) {
        this.errorCallbacks.push(callback);
    }
    /**
     * Remove all callbacks
     */
    clearCallbacks() {
        this.progressCallbacks = [];
        this.completionCallbacks = [];
        this.errorCallbacks = [];
    }
    /**
     * Remove specific callback type
     */
    clearProgressCallbacks() {
        this.progressCallbacks = [];
    }
    clearCompletionCallbacks() {
        this.completionCallbacks = [];
    }
    clearErrorCallbacks() {
        this.errorCallbacks = [];
    }
    /**
     * Get progress statistics
     */
    getProgressStats() {
        const now = Date.now();
        const totalTimeElapsed = now - this.startTime;
        const averageLoadTime = this.loadedAssets > 0 ? totalTimeElapsed / this.loadedAssets : 0;
        // Calculate loading rate (assets per second)
        let loadingRate = 0;
        if (this.progressHistory.length >= 2) {
            const oldestProgress = this.progressHistory[0];
            const latestProgress = this.progressHistory[this.progressHistory.length - 1];
            const timeDiff = latestProgress.time - oldestProgress.time;
            const loadedDiff = latestProgress.loaded - oldestProgress.loaded;
            if (timeDiff > 0) {
                loadingRate = (loadedDiff / timeDiff) * 1000; // assets per second
            }
        }
        // Check if loading is stalled (no progress in last 5 seconds)
        const isStalled = this.isLoading && (now - this.lastProgressTime) > 5000;
        return {
            averageLoadTime,
            loadingRate,
            totalTimeElapsed,
            isStalled
        };
    }
    /**
     * Reset tracker state
     */
    reset() {
        this.isLoading = false;
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.currentFile = '';
        this.currentCategory = '';
        this.startTime = 0;
        this.lastProgressTime = 0;
        this.progressHistory = [];
    }
    // Private notification methods
    notifyProgress(progress) {
        this.progressCallbacks.forEach(callback => {
            try {
                callback(progress);
            }
            catch (error) {
                console.error('Error in progress callback:', error);
            }
        });
    }
    notifyCompletion() {
        this.completionCallbacks.forEach(callback => {
            try {
                callback();
            }
            catch (error) {
                console.error('Error in completion callback:', error);
            }
        });
    }
    notifyError(error) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            }
            catch (error) {
                console.error('Error in error callback:', error);
            }
        });
    }
}
//# sourceMappingURL=LoadingProgressTracker.js.map