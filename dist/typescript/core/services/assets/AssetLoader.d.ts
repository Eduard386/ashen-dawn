/**
 * Asset Loader - Single responsibility for file loading operations
 * Handles actual file loading, error handling, retry logic
 */
export interface LoadingOptions {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    parallel?: boolean;
    maxParallel?: number;
}
export interface LoadingResult {
    success: boolean;
    loadedAssets: string[];
    failedAssets: Array<{
        key: string;
        path: string;
        error: string;
    }>;
    totalTime: number;
    retryCount: number;
}
export interface AssetLoadCallback {
    onProgress?: (progress: number, key: string) => void;
    onComplete?: (result: LoadingResult) => void;
    onError?: (key: string, error: string) => void;
    onAssetLoaded?: (key: string, type: string) => void;
}
export declare class AssetLoader {
    private scene;
    private defaultOptions;
    constructor(scene?: Phaser.Scene);
    /**
     * Set the Phaser scene for loading operations
     */
    setScene(scene: Phaser.Scene): void;
    /**
     * Load a single asset with retry logic
     */
    loadAsset(key: string, path: string, type: 'image' | 'audio' | 'video', options?: LoadingOptions, callbacks?: AssetLoadCallback): Promise<LoadingResult>;
    /**
     * Load multiple assets with parallel/sequential control
     */
    loadAssets(assets: Array<{
        key: string;
        path: string;
        type: 'image' | 'audio' | 'video';
    }>, options?: LoadingOptions, callbacks?: AssetLoadCallback): Promise<LoadingResult>;
    /**
     * Load assets from manifest
     */
    loadFromManifest(manifest: {
        images?: Record<string, string>;
        audio?: Record<string, string>;
        video?: Record<string, string>;
    }, options?: LoadingOptions, callbacks?: AssetLoadCallback): Promise<LoadingResult>;
    /**
     * Check if asset is already loaded
     */
    isAssetLoaded(key: string, type: 'image' | 'audio' | 'video'): boolean;
    /**
     * Get list of loaded assets
     */
    getLoadedAssets(): {
        images: string[];
        audio: string[];
        video: string[];
    };
    /**
     * Unload asset
     */
    unloadAsset(key: string, type: 'image' | 'audio' | 'video'): boolean;
    /**
     * Clear all loaded assets
     */
    clearAllAssets(): void;
    /**
     * Get memory usage estimate
     */
    getMemoryUsage(): {
        images: number;
        audio: number;
        video: number;
        total: number;
    };
    /**
     * Utility delay function
     */
    private delay;
}
