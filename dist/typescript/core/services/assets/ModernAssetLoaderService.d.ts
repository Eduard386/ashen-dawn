/**
 * Modern Asset Loader Service - Orchestrates all asset loading components
 * Single responsibility: Coordinate asset loading workflow with composition pattern
 */
import { AssetCache } from './AssetCache';
import { LoadingProgressTracker } from './LoadingProgressTracker';
import { AssetPrioritizer } from './AssetPrioritizer';
import { ResourceValidator } from './ResourceValidator';
import { AssetLoader, LoadingOptions, LoadingResult } from './AssetLoader';
export interface AssetManifest {
    images: Record<string, string>;
    audio: Record<string, string>;
    video: Record<string, string>;
    metadata?: {
        version?: string;
        description?: string;
        dependencies?: string[];
    };
}
export interface LoadingConfiguration {
    validateAssets?: boolean;
    useCache?: boolean;
    usePrioritization?: boolean;
    trackProgress?: boolean;
    loadingOptions?: LoadingOptions;
    fallbackUrls?: Record<string, string>;
    criticalAssets?: string[];
}
export interface AssetLoadingCallbacks {
    onValidationComplete?: (results: any) => void;
    onCacheHit?: (key: string) => void;
    onCacheMiss?: (key: string) => void;
    onAssetLoaded?: (key: string, type: string) => void;
    onProgress?: (progress: number, currentAsset: string) => void;
    onPhaseComplete?: (phase: string, results: any) => void;
    onComplete?: (results: LoadingResult) => void;
    onError?: (phase: string, error: string) => void;
}
export declare class ModernAssetLoaderService {
    private cache;
    private progressTracker;
    private prioritizer;
    private validator;
    private loader;
    private scene;
    constructor(scene?: Phaser.Scene);
    /**
     * Set the Phaser scene for all components
     */
    setScene(scene: Phaser.Scene): void;
    /**
     * Load assets from manifest with full workflow
     */
    loadFromManifest(manifest: AssetManifest, config?: LoadingConfiguration, callbacks?: AssetLoadingCallbacks): Promise<LoadingResult>;
    /**
     * Load specific assets by keys
     */
    loadAssets(assetKeys: string[], manifest: AssetManifest, config?: LoadingConfiguration, callbacks?: AssetLoadingCallbacks): Promise<LoadingResult>;
    /**
     * Preload critical assets
     */
    preloadCriticalAssets(manifest: AssetManifest, criticalAssets: string[], config?: LoadingConfiguration): Promise<LoadingResult>;
    /**
     * Get loading statistics
     */
    getLoadingStatistics(): {
        cache: any;
        progress: any;
        validator: any;
        loader: any;
    };
    /**
     * Clear all caches and reset state
     */
    reset(): void;
    /**
     * Get all components for advanced usage
     */
    getComponents(): {
        cache: AssetCache;
        progressTracker: LoadingProgressTracker;
        prioritizer: AssetPrioritizer;
        validator: ResourceValidator;
        loader: AssetLoader;
    };
    /**
     * Check if all assets from manifest are loaded
     */
    isManifestLoaded(manifest: AssetManifest): boolean;
    /**
     * Helper to determine asset type from path
     */
    private determineAssetType;
}
