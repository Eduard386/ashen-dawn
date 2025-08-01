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
  failedAssets: Array<{ key: string; path: string; error: string }>;
  totalTime: number;
  retryCount: number;
}

export interface AssetLoadCallback {
  onProgress?: (progress: number, key: string) => void;
  onComplete?: (result: LoadingResult) => void;
  onError?: (key: string, error: string) => void;
  onAssetLoaded?: (key: string, type: string) => void;
}

export class AssetLoader {
  private scene: Phaser.Scene | null = null;
  private defaultOptions: LoadingOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    parallel: true,
    maxParallel: 4
  };

  constructor(scene?: Phaser.Scene) {
    if (scene) {
      this.scene = scene;
    }
  }

  /**
   * Set the Phaser scene for loading operations
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * Load a single asset with retry logic
   */
  public async loadAsset(
    key: string,
    path: string,
    type: 'image' | 'audio' | 'video',
    options: LoadingOptions = {},
    callbacks?: AssetLoadCallback
  ): Promise<LoadingResult> {
    if (!this.scene) {
      throw new Error('Scene is required for asset loading');
    }

    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let retryCount = 0;
    let lastError = '';

    const attempt = async (): Promise<boolean> => {
      return new Promise((resolve) => {
        let completed = false;
        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };

        const onSuccess = () => {
          if (!completed) {
            completed = true;
            cleanup();
            callbacks?.onAssetLoaded?.(key, type);
            resolve(true);
          }
        };

        const onError = (error: string) => {
          if (!completed) {
            completed = true;
            cleanup();
            lastError = error;
            callbacks?.onError?.(key, error);
            resolve(false);
          }
        };

        // Set timeout
        if (opts.timeout) {
          timeoutId = setTimeout(() => {
            onError(`Timeout loading ${key}`);
          }, opts.timeout);
        }

        try {
          // Use scene's loader
          const loader = this.scene!.load;

          // Setup event listeners for this specific asset
          const onFileComplete = (file: any) => {
            if (file.key === key) {
              loader.off('filecomplete', onFileComplete);
              loader.off('loaderror', onFileError);
              onSuccess();
            }
          };

          const onFileError = (file: any) => {
            if (file.key === key) {
              loader.off('filecomplete', onFileComplete);
              loader.off('loaderror', onFileError);
              onError(`Failed to load file: ${file.src || path}`);
            }
          };

          loader.on('filecomplete', onFileComplete);
          loader.on('loaderror', onFileError);

          // Add asset to loader
          switch (type) {
            case 'image':
              loader.image(key, path);
              break;
            case 'audio':
              loader.audio(key, path);
              break;
            case 'video':
              loader.video(key, path);
              break;
          }

          // Start loading if not already started
          if (!loader.isLoading()) {
            loader.start();
          }

        } catch (error) {
          onError(`Loading error: ${error}`);
        }
      });
    };

    // Retry logic
    while (retryCount <= opts.maxRetries!) {
      try {
        const success = await attempt();
        if (success) {
          const totalTime = Date.now() - startTime;
          return {
            success: true,
            loadedAssets: [key],
            failedAssets: [],
            totalTime,
            retryCount
          };
        }
      } catch (error) {
        lastError = `Exception: ${error}`;
      }

      retryCount++;
      if (retryCount <= opts.maxRetries! && opts.retryDelay) {
        await this.delay(opts.retryDelay);
      }
    }

    // All retries failed
    const totalTime = Date.now() - startTime;
    return {
      success: false,
      loadedAssets: [],
      failedAssets: [{ key, path, error: lastError }],
      totalTime,
      retryCount
    };
  }

  /**
   * Load multiple assets with parallel/sequential control
   */
  public async loadAssets(
    assets: Array<{ key: string; path: string; type: 'image' | 'audio' | 'video' }>,
    options: LoadingOptions = {},
    callbacks?: AssetLoadCallback
  ): Promise<LoadingResult> {
    if (!this.scene) {
      throw new Error('Scene is required for asset loading');
    }

    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let totalRetryCount = 0;
    const loadedAssets: string[] = [];
    const failedAssets: Array<{ key: string; path: string; error: string }> = [];

    const updateProgress = () => {
      const progress = (loadedAssets.length + failedAssets.length) / assets.length;
      callbacks?.onProgress?.(progress, loadedAssets[loadedAssets.length - 1] || '');
    };

    if (opts.parallel) {
      // Parallel loading with concurrency control
      const semaphore = new Semaphore(opts.maxParallel || 4);
      const promises = assets.map(async (asset) => {
        return semaphore.acquire(async () => {
          const result = await this.loadAsset(asset.key, asset.path, asset.type, opts, callbacks);
          totalRetryCount += result.retryCount;
          
          if (result.success) {
            loadedAssets.push(...result.loadedAssets);
          } else {
            failedAssets.push(...result.failedAssets);
          }
          
          updateProgress();
          return result;
        });
      });

      await Promise.all(promises);
    } else {
      // Sequential loading
      for (const asset of assets) {
        const result = await this.loadAsset(asset.key, asset.path, asset.type, opts, callbacks);
        totalRetryCount += result.retryCount;
        
        if (result.success) {
          loadedAssets.push(...result.loadedAssets);
        } else {
          failedAssets.push(...result.failedAssets);
        }
        
        updateProgress();
      }
    }

    const totalTime = Date.now() - startTime;
    const result: LoadingResult = {
      success: failedAssets.length === 0,
      loadedAssets,
      failedAssets,
      totalTime,
      retryCount: totalRetryCount
    };

    callbacks?.onComplete?.(result);
    return result;
  }

  /**
   * Load assets from manifest
   */
  public async loadFromManifest(
    manifest: {
      images?: Record<string, string>;
      audio?: Record<string, string>;
      video?: Record<string, string>;
    },
    options: LoadingOptions = {},
    callbacks?: AssetLoadCallback
  ): Promise<LoadingResult> {
    const assets = [
      ...(manifest.images ? Object.entries(manifest.images).map(([key, path]) => ({ key, path, type: 'image' as const })) : []),
      ...(manifest.audio ? Object.entries(manifest.audio).map(([key, path]) => ({ key, path, type: 'audio' as const })) : []),
      ...(manifest.video ? Object.entries(manifest.video).map(([key, path]) => ({ key, path, type: 'video' as const })) : [])
    ];

    return this.loadAssets(assets, options, callbacks);
  }

  /**
   * Check if asset is already loaded
   */
  public isAssetLoaded(key: string, type: 'image' | 'audio' | 'video'): boolean {
    if (!this.scene) {
      return false;
    }

    switch (type) {
      case 'image':
        return this.scene.textures.exists(key);
      case 'audio':
        return this.scene.cache.audio.exists(key);
      case 'video':
        return this.scene.cache.video?.exists(key) || false;
      default:
        return false;
    }
  }

  /**
   * Get list of loaded assets
   */
  public getLoadedAssets(): {
    images: string[];
    audio: string[];
    video: string[];
  } {
    if (!this.scene) {
      return { images: [], audio: [], video: [] };
    }

    return {
      images: this.scene.textures.getTextureKeys().filter(key => key !== '__DEFAULT' && key !== '__MISSING'),
      audio: Array.from(this.scene.cache.audio.entries.keys()).map(key => String(key)),
      video: this.scene.cache.video ? Array.from(this.scene.cache.video.entries.keys()).map(key => String(key)) : []
    };
  }

  /**
   * Unload asset
   */
  public unloadAsset(key: string, type: 'image' | 'audio' | 'video'): boolean {
    if (!this.scene) {
      return false;
    }

    try {
      switch (type) {
        case 'image':
          if (this.scene.textures.exists(key)) {
            this.scene.textures.remove(key);
            return true;
          }
          break;
        case 'audio':
          if (this.scene.cache.audio.exists(key)) {
            this.scene.cache.audio.remove(key);
            return true;
          }
          break;
        case 'video':
          if (this.scene.cache.video?.exists(key)) {
            this.scene.cache.video.remove(key);
            return true;
          }
          break;
      }
    } catch (error) {
      console.warn(`Failed to unload ${type} asset '${key}':`, error);
    }

    return false;
  }

  /**
   * Clear all loaded assets
   */
  public clearAllAssets(): void {
    if (!this.scene) {
      return;
    }

    // Clear all caches
    this.scene.cache.audio.destroy();
    if (this.scene.cache.video) {
      this.scene.cache.video.destroy();
    }
    
    // Clear textures (keep defaults)
    const textureKeys = this.scene.textures.getTextureKeys();
    textureKeys.forEach(key => {
      if (key !== '__DEFAULT' && key !== '__MISSING') {
        this.scene!.textures.remove(key);
      }
    });
  }

  /**
   * Get memory usage estimate
   */
  public getMemoryUsage(): {
    images: number;
    audio: number;
    video: number;
    total: number;
  } {
    if (!this.scene) {
      return { images: 0, audio: 0, video: 0, total: 0 };
    }

    let imagesSize = 0;
    let audioSize = 0;
    let videoSize = 0;

    // Estimate texture memory (very rough approximation)
    const textureKeys = this.scene.textures.getTextureKeys();
    textureKeys.forEach(key => {
      if (key !== '__DEFAULT' && key !== '__MISSING') {
        const texture = this.scene!.textures.get(key);
        if (texture && texture.source[0]) {
          const source = texture.source[0];
          imagesSize += (source.width || 0) * (source.height || 0) * 4; // Assuming RGBA
        }
      }
    });

    // Audio and video sizes are harder to estimate without file info
    // This is a placeholder
    audioSize = this.scene.cache.audio.entries.size * 1024 * 1024; // Rough estimate
    videoSize = (this.scene.cache.video?.entries.size || 0) * 5 * 1024 * 1024; // Rough estimate

    return {
      images: imagesSize,
      audio: audioSize,
      video: videoSize,
      total: imagesSize + audioSize + videoSize
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Simple semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const tryAcquire = () => {
        if (this.permits > 0) {
          this.permits--;
          task()
            .then(resolve)
            .catch(reject)
            .finally(() => {
              this.permits++;
              if (this.waiting.length > 0) {
                const next = this.waiting.shift();
                next!();
              }
            });
        } else {
          this.waiting.push(tryAcquire);
        }
      };
      tryAcquire();
    });
  }
}
