/**
 * Loading Progress Tracker - Single responsibility for tracking loading progress
 * Handles progress callbacks, status tracking, completion notifications
 */

export interface AssetProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentFile: string;
  category?: string;
  timeElapsed?: number;
  estimatedTimeRemaining?: number;
}

export class LoadingProgressTracker {
  private progressCallbacks: ((progress: AssetProgress) => void)[] = [];
  private completionCallbacks: (() => void)[] = [];
  private errorCallbacks: ((error: string) => void)[] = [];
  
  private totalAssets = 0;
  private loadedAssets = 0;
  private isLoading = false;
  private currentFile = '';
  private currentCategory = '';
  private startTime = 0;
  private lastProgressTime = 0;
  
  // Progress history for ETA calculation
  private progressHistory: { time: number; loaded: number }[] = [];
  private readonly historyLength = 10;

  /**
   * Start tracking progress for a new loading session
   */
  public startTracking(totalAssets: number, category: string = 'assets'): void {
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
  public updateProgress(phaserProgress: number, currentFile: string = ''): void {
    if (!this.isLoading) return;

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
  public updateProgressCount(loadedCount: number, currentFile: string = ''): void {
    if (!this.isLoading) return;

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
  private calculateProgressInfo(): AssetProgress {
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
  public completeLoading(): void {
    if (!this.isLoading) return;

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
  public reportError(errorMessage: string, fileName?: string): void {
    const fullError = fileName ? `${errorMessage}: ${fileName}` : errorMessage;
    console.warn(`❌ Loading error: ${fullError}`);
    this.notifyError(fullError);
  }

  /**
   * Get current loading status
   */
  public getLoadingStatus(): { 
    isLoading: boolean; 
    progress: number; 
    loaded: number; 
    total: number;
    timeElapsed: number;
    estimatedTimeRemaining: number;
  } {
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
  public onProgress(callback: (progress: AssetProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Subscribe to completion notifications
   */
  public onComplete(callback: () => void): void {
    this.completionCallbacks.push(callback);
  }

  /**
   * Subscribe to error notifications
   */
  public onError(callback: (error: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Remove all callbacks
   */
  public clearCallbacks(): void {
    this.progressCallbacks = [];
    this.completionCallbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Remove specific callback type
   */
  public clearProgressCallbacks(): void {
    this.progressCallbacks = [];
  }

  public clearCompletionCallbacks(): void {
    this.completionCallbacks = [];
  }

  public clearErrorCallbacks(): void {
    this.errorCallbacks = [];
  }

  /**
   * Get progress statistics
   */
  public getProgressStats(): {
    averageLoadTime: number;
    loadingRate: number;
    totalTimeElapsed: number;
    isStalled: boolean;
  } {
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
  public reset(): void {
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
  private notifyProgress(progress: AssetProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  private notifyCompletion(): void {
    this.completionCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in completion callback:', error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }
}
