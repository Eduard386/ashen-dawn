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
export declare class LoadingProgressTracker {
    private progressCallbacks;
    private completionCallbacks;
    private errorCallbacks;
    private totalAssets;
    private loadedAssets;
    private isLoading;
    private currentFile;
    private currentCategory;
    private startTime;
    private lastProgressTime;
    private progressHistory;
    private readonly historyLength;
    /**
     * Start tracking progress for a new loading session
     */
    startTracking(totalAssets: number, category?: string): void;
    /**
     * Update progress based on Phaser loader progress
     */
    updateProgress(phaserProgress: number, currentFile?: string): void;
    /**
     * Update progress with specific loaded count
     */
    updateProgressCount(loadedCount: number, currentFile?: string): void;
    /**
     * Calculate comprehensive progress information
     */
    private calculateProgressInfo;
    /**
     * Mark loading as complete
     */
    completeLoading(): void;
    /**
     * Report loading error
     */
    reportError(errorMessage: string, fileName?: string): void;
    /**
     * Get current loading status
     */
    getLoadingStatus(): {
        isLoading: boolean;
        progress: number;
        loaded: number;
        total: number;
        timeElapsed: number;
        estimatedTimeRemaining: number;
    };
    /**
     * Subscribe to progress updates
     */
    onProgress(callback: (progress: AssetProgress) => void): void;
    /**
     * Subscribe to completion notifications
     */
    onComplete(callback: () => void): void;
    /**
     * Subscribe to error notifications
     */
    onError(callback: (error: string) => void): void;
    /**
     * Remove all callbacks
     */
    clearCallbacks(): void;
    /**
     * Remove specific callback type
     */
    clearProgressCallbacks(): void;
    clearCompletionCallbacks(): void;
    clearErrorCallbacks(): void;
    /**
     * Get progress statistics
     */
    getProgressStats(): {
        averageLoadTime: number;
        loadingRate: number;
        totalTimeElapsed: number;
        isStalled: boolean;
    };
    /**
     * Reset tracker state
     */
    reset(): void;
    private notifyProgress;
    private notifyCompletion;
    private notifyError;
}
