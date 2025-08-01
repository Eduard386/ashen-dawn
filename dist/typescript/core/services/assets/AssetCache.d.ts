export declare class AssetCache {
    private scene;
    constructor(scene?: Phaser.Scene);
    /**
     * Set the Phaser scene for cache operations
     */
    setScene(scene: Phaser.Scene): void;
    /**
     * Check if an asset is loaded in cache
     */
    isAssetLoaded(key: string, type?: 'image' | 'audio' | 'video'): boolean;
    /**
     * Get asset with fallback strategy
     */
    getAssetWithFallback(key: string, fallbackKey?: string, type?: 'image' | 'audio' | 'video'): string | null;
    /**
     * Check multiple assets availability
     */
    areAssetsLoaded(assets: string[], type?: 'image' | 'audio' | 'video'): boolean;
    /**
     * Get missing assets from a list
     */
    getMissingAssets(assets: string[], type?: 'image' | 'audio' | 'video'): string[];
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        imageCount: number;
        audioCount: number;
        videoCount: number;
        totalSize: number;
    };
    /**
     * Clear specific asset from cache
     */
    clearAsset(key: string, type: 'image' | 'audio' | 'video'): boolean;
    /**
     * Check cache health and integrity
     */
    validateCache(): {
        healthy: boolean;
        corruptedAssets: string[];
        missingTextures: string[];
    };
}
