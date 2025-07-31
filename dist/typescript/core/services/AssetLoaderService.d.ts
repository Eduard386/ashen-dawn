export interface AssetManifest {
    images: Record<string, string>;
    audio: Record<string, string>;
    video: Record<string, string>;
}
export interface AssetProgress {
    loaded: number;
    total: number;
    percentage: number;
    currentFile: string;
}
/**
 * Centralized Asset Management Service
 * Provides efficient asset loading with progress tracking and caching
 *
 * Features:
 * - Background preloading of all game assets
 * - Progress tracking with callbacks
 * - Smart asset prioritization
 * - Cache management
 * - Error handling and fallbacks
 */
export declare class AssetLoaderService {
    private static instance;
    private scene;
    private totalAssets;
    private loadedAssets;
    private isLoading;
    private progressCallbacks;
    private completionCallbacks;
    private criticalAssets;
    private gameAssets;
    static getInstance(): AssetLoaderService;
    /**
     * Initialize the asset loader with a Phaser scene
     */
    init(scene: Phaser.Scene): void;
    /**
     * Setup all asset manifests - organized by priority
     */
    private setupAssetManifests;
    /**
     * Build comprehensive game asset manifest
     */
    private buildGameAssetManifest;
    /**
     * Load critical assets first - blocks until complete
     */
    loadCriticalAssets(): Promise<void>;
    /**
     * Load game assets in background - non-blocking
     */
    startBackgroundLoading(): void;
    /**
     * Async loading of game assets
     */
    private loadGameAssetsAsync;
    /**
     * Load assets in smaller chunks to prevent blocking
     */
    private loadAssetsInChunks;
    /**
     * Load a group of assets
     */
    private loadAssetGroup;
    /**
     * Update loading progress
     */
    private updateProgress;
    /**
     * Check if an asset is loaded
     */
    isAssetLoaded(key: string, type?: 'image' | 'audio' | 'video'): boolean;
    /**
     * Get asset with fallback
     */
    getAssetWithFallback(key: string, fallbackKey?: string, type?: 'image' | 'audio' | 'video'): string | null;
    /**
     * Subscribe to loading progress
     */
    onProgress(callback: (progress: AssetProgress) => void): void;
    /**
     * Subscribe to loading completion
     */
    onComplete(callback: () => void): void;
    /**
     * Notify completion callbacks
     */
    private notifyCompletion;
    /**
     * Get loading status
     */
    getLoadingStatus(): {
        isLoading: boolean;
        progress: number;
    };
    /**
     * Clear all callbacks (useful for scene transitions)
     */
    clearCallbacks(): void;
    /**
     * Preload specific assets for a scene
     */
    preloadSceneAssets(sceneAssets: string[]): Promise<void>;
}
