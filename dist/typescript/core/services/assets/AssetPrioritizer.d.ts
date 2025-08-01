/**
 * Asset Prioritizer - Single responsibility for asset prioritization
 * Handles critical vs non-critical assets, loading order, chunking strategies
 */
export interface AssetManifest {
    images: Record<string, string>;
    audio: Record<string, string>;
    video: Record<string, string>;
}
export interface AssetItem {
    key: string;
    path: string;
    type: 'image' | 'audio' | 'video';
    priority: number;
    category: string;
}
export type AssetPriority = 'critical' | 'high' | 'normal' | 'low' | 'background';
export declare class AssetPrioritizer {
    private criticalAssets;
    private gameAssets;
    private readonly priorityValues;
    /**
     * Initialize with asset manifests
     */
    initialize(): void;
    /**
     * Setup critical assets - needed for immediate gameplay
     */
    private setupCriticalAssets;
    /**
     * Setup game assets - can be loaded in background
     */
    private setupGameAssets;
    /**
     * Get critical assets manifest
     */
    getCriticalAssets(): AssetManifest;
    /**
     * Get game assets manifest
     */
    getGameAssets(): AssetManifest;
    /**
     * Get assets sorted by priority
     */
    getAssetsByPriority(includeGame?: boolean): AssetItem[];
    /**
     * Get assets in chunks for progressive loading
     */
    getAssetsInChunks(chunkSize?: number): AssetItem[][];
    /**
     * Get assets for specific scene
     */
    getSceneAssets(sceneName: string): AssetItem[];
    /**
     * Determine asset priority based on type and usage
     */
    getAssetPriority(key: string, type: 'image' | 'audio' | 'video'): AssetPriority;
    /**
     * Calculate total assets count by priority
     */
    getAssetCountsByPriority(): Record<AssetPriority, number>;
    private addAssetsFromManifest;
    private addGameAssetsWithPriority;
    private isInManifest;
}
