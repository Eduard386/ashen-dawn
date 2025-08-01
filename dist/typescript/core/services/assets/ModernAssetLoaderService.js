/**
 * Modern Asset Loader Service - Orchestrates all asset loading components
 * Single responsibility: Coordinate asset loading workflow with composition pattern
 */
import { AssetCache } from './AssetCache';
import { LoadingProgressTracker } from './LoadingProgressTracker';
import { AssetPrioritizer } from './AssetPrioritizer';
import { ResourceValidator } from './ResourceValidator';
import { AssetLoader } from './AssetLoader';
export class ModernAssetLoaderService {
    constructor(scene) {
        this.scene = null;
        this.cache = new AssetCache();
        this.progressTracker = new LoadingProgressTracker();
        this.prioritizer = new AssetPrioritizer();
        this.validator = new ResourceValidator();
        this.loader = new AssetLoader();
        if (scene) {
            this.setScene(scene);
        }
    }
    /**
     * Set the Phaser scene for all components
     */
    setScene(scene) {
        this.scene = scene;
        this.validator.setScene(scene);
        this.loader.setScene(scene);
    }
    /**
     * Load assets from manifest with full workflow
     */
    async loadFromManifest(manifest, config = {}, callbacks) {
        if (!this.scene) {
            throw new Error('Scene is required for asset loading');
        }
        const startTime = Date.now();
        let totalRetryCount = 0;
        const loadedAssets = [];
        const failedAssets = [];
        try {
            // Phase 1: Validation (if enabled)
            if (config.validateAssets) {
                callbacks?.onPhaseComplete?.('validation_start', null);
                const validationResults = await this.validator.validateManifest(manifest);
                callbacks?.onValidationComplete?.(validationResults);
                if (!validationResults.isValid && validationResults.errors.length > 0) {
                    const errorMessage = `Validation failed: ${validationResults.errors.join(', ')}`;
                    callbacks?.onError?.('validation', errorMessage);
                    // Continue with warnings, but fail on critical errors
                    const criticalErrors = validationResults.errors.filter(error => error.includes('missing') || error.includes('corrupted'));
                    if (criticalErrors.length > 0) {
                        throw new Error(errorMessage);
                    }
                }
                callbacks?.onPhaseComplete?.('validation_complete', validationResults);
            }
            // Phase 2: Cache Check (if enabled)
            const assetsToLoad = [];
            const allAssets = [
                ...Object.entries(manifest.images).map(([key, path]) => ({ key, path, type: 'image' })),
                ...Object.entries(manifest.audio).map(([key, path]) => ({ key, path, type: 'audio' })),
                ...Object.entries(manifest.video).map(([key, path]) => ({ key, path, type: 'video' }))
            ];
            if (config.useCache) {
                callbacks?.onPhaseComplete?.('cache_check_start', null);
                for (const asset of allAssets) {
                    if (this.cache.isAssetLoaded(asset.key, asset.type)) {
                        callbacks?.onCacheHit?.(asset.key);
                        loadedAssets.push(asset.key);
                    }
                    else {
                        callbacks?.onCacheMiss?.(asset.key);
                        assetsToLoad.push(asset);
                    }
                }
                callbacks?.onPhaseComplete?.('cache_check_complete', {
                    cached: loadedAssets.length,
                    toLoad: assetsToLoad.length
                });
            }
            else {
                assetsToLoad.push(...allAssets);
            }
            // Phase 3: Prioritization (if enabled)
            let prioritizedAssets = assetsToLoad;
            if (config.usePrioritization && assetsToLoad.length > 0) {
                callbacks?.onPhaseComplete?.('prioritization_start', null);
                // Initialize prioritizer
                this.prioritizer.initialize();
                // Get prioritized assets
                const prioritizedItems = this.prioritizer.getAssetsByPriority(true);
                // Filter to only include assets we need to load
                const assetsToLoadKeys = new Set(assetsToLoad.map(a => a.key));
                prioritizedAssets = prioritizedItems
                    .filter(item => assetsToLoadKeys.has(item.key))
                    .map(item => ({
                    key: item.key,
                    path: item.path,
                    type: item.type
                }));
                callbacks?.onPhaseComplete?.('prioritization_complete', {
                    originalOrder: assetsToLoad.map(a => a.key),
                    prioritizedOrder: prioritizedAssets.map(a => a.key)
                });
            }
            // Phase 4: Progress Tracking Setup (if enabled)
            if (config.trackProgress && prioritizedAssets.length > 0) {
                this.progressTracker.startTracking(prioritizedAssets.length);
            }
            // Phase 5: Asset Loading
            if (prioritizedAssets.length > 0) {
                callbacks?.onPhaseComplete?.('loading_start', null);
                const loadingCallbacks = {
                    onProgress: (progress, key) => {
                        if (config.trackProgress) {
                            this.progressTracker.updateProgress(1);
                        }
                        callbacks?.onProgress?.(progress, key);
                    },
                    onAssetLoaded: (key, type) => {
                        // Asset already loaded by AssetLoader, cache will detect it automatically
                        callbacks?.onAssetLoaded?.(key, type);
                    },
                    onError: (key, error) => {
                        callbacks?.onError?.('loading', `Failed to load ${key}: ${error}`);
                    }
                };
                const loadingResult = await this.loader.loadAssets(prioritizedAssets, config.loadingOptions || {}, loadingCallbacks);
                totalRetryCount += loadingResult.retryCount;
                loadedAssets.push(...loadingResult.loadedAssets);
                failedAssets.push(...loadingResult.failedAssets);
                callbacks?.onPhaseComplete?.('loading_complete', loadingResult);
            }
            // Phase 6: Fallback Loading (if configured and there are failures)
            if (failedAssets.length > 0 && config.fallbackUrls) {
                callbacks?.onPhaseComplete?.('fallback_start', null);
                const fallbackAssets = failedAssets
                    .filter(failed => config.fallbackUrls[failed.key])
                    .map(failed => ({
                    key: failed.key,
                    path: config.fallbackUrls[failed.key],
                    type: this.determineAssetType(failed.path)
                }));
                if (fallbackAssets.length > 0) {
                    const fallbackResult = await this.loader.loadAssets(fallbackAssets, config.loadingOptions || {}, {
                        onAssetLoaded: (key, type) => {
                            // Asset already loaded by AssetLoader, cache will detect it automatically
                            callbacks?.onAssetLoaded?.(key, type);
                        }
                    });
                    // Update results with fallback successes
                    loadedAssets.push(...fallbackResult.loadedAssets);
                    // Remove successful fallbacks from failed list
                    const successfulFallbacks = new Set(fallbackResult.loadedAssets);
                    const remainingFailed = failedAssets.filter(failed => !successfulFallbacks.has(failed.key));
                    failedAssets.splice(0, failedAssets.length, ...remainingFailed);
                }
                callbacks?.onPhaseComplete?.('fallback_complete', {
                    attempted: fallbackAssets.length,
                    successful: fallbackAssets.length - failedAssets.length
                });
            }
            // Final Result
            const totalTime = Date.now() - startTime;
            const finalResult = {
                success: failedAssets.length === 0,
                loadedAssets,
                failedAssets,
                totalTime,
                retryCount: totalRetryCount
            };
            // Update cache statistics (optional - cache handles this internally)
            if (config.useCache) {
                // Cache automatically tracks loaded assets through isAssetLoaded checks
            }
            callbacks?.onComplete?.(finalResult);
            return finalResult;
        }
        catch (error) {
            callbacks?.onError?.('workflow', `Asset loading workflow failed: ${error}`);
            throw error;
        }
    }
    /**
     * Load specific assets by keys
     */
    async loadAssets(assetKeys, manifest, config = {}, callbacks) {
        // Filter manifest to only include requested assets
        const filteredManifest = {
            images: {},
            audio: {},
            video: {}
        };
        assetKeys.forEach(key => {
            if (manifest.images[key]) {
                filteredManifest.images[key] = manifest.images[key];
            }
            if (manifest.audio[key]) {
                filteredManifest.audio[key] = manifest.audio[key];
            }
            if (manifest.video[key]) {
                filteredManifest.video[key] = manifest.video[key];
            }
        });
        return this.loadFromManifest(filteredManifest, config, callbacks);
    }
    /**
     * Preload critical assets
     */
    async preloadCriticalAssets(manifest, criticalAssets, config = {}) {
        const criticalConfig = {
            ...config,
            criticalAssets,
            usePrioritization: true,
            loadingOptions: {
                ...config.loadingOptions,
                parallel: false, // Load critical assets sequentially for reliability
                maxRetries: 5
            }
        };
        return this.loadAssets(criticalAssets, manifest, criticalConfig);
    }
    /**
     * Get loading statistics
     */
    getLoadingStatistics() {
        return {
            cache: this.cache.getCacheStats(),
            progress: this.progressTracker.getLoadingStatus(),
            validator: this.validator.getValidationSummary(),
            loader: this.loader.getMemoryUsage()
        };
    }
    /**
     * Clear all caches and reset state
     */
    reset() {
        // Clear asset cache by clearing individual assets
        const loadedAssets = this.loader.getLoadedAssets();
        Object.keys(loadedAssets.images).forEach(key => this.cache.clearAsset(key, 'image'));
        Object.keys(loadedAssets.audio).forEach(key => this.cache.clearAsset(key, 'audio'));
        Object.keys(loadedAssets.video).forEach(key => this.cache.clearAsset(key, 'video'));
        this.progressTracker.reset();
        // Prioritizer doesn't need reset - it's stateless
        this.loader.clearAllAssets();
    }
    /**
     * Get all components for advanced usage
     */
    getComponents() {
        return {
            cache: this.cache,
            progressTracker: this.progressTracker,
            prioritizer: this.prioritizer,
            validator: this.validator,
            loader: this.loader
        };
    }
    /**
     * Check if all assets from manifest are loaded
     */
    isManifestLoaded(manifest) {
        const allKeys = [
            ...Object.keys(manifest.images),
            ...Object.keys(manifest.audio),
            ...Object.keys(manifest.video)
        ];
        return allKeys.every(key => {
            // Check if asset is in Phaser's cache
            if (manifest.images[key] && this.loader.isAssetLoaded(key, 'image'))
                return true;
            if (manifest.audio[key] && this.loader.isAssetLoaded(key, 'audio'))
                return true;
            if (manifest.video[key] && this.loader.isAssetLoaded(key, 'video'))
                return true;
            return false;
        });
    }
    /**
     * Helper to determine asset type from path
     */
    determineAssetType(path) {
        const ext = path.toLowerCase().split('.').pop() || '';
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
            return 'image';
        }
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) {
            return 'audio';
        }
        if (['mp4', 'webm', 'ogg'].includes(ext)) {
            return 'video';
        }
        return 'image'; // Default fallback
    }
}
//# sourceMappingURL=ModernAssetLoaderService.js.map