/**
 * Asset Cache - Single responsibility for asset caching and availability
 * Handles checking if assets are loaded, providing fallbacks
 */
import { AssetManifest } from '../AssetLoaderService.js';

export class AssetCache {
  private scene: Phaser.Scene | null = null;

  constructor(scene?: Phaser.Scene) {
    if (scene) {
      this.scene = scene;
    }
  }

  /**
   * Set the Phaser scene for cache operations
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * Check if an asset is loaded in cache
   */
  public isAssetLoaded(key: string, type: 'image' | 'audio' | 'video' = 'image'): boolean {
    if (!this.scene) return false;

    try {
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
    } catch (error) {
      console.warn(`Error checking asset cache for ${key}:`, error);
      return false;
    }
  }

  /**
   * Get asset with fallback strategy
   */
  public getAssetWithFallback(
    key: string, 
    fallbackKey?: string, 
    type: 'image' | 'audio' | 'video' = 'image'
  ): string | null {
    if (this.isAssetLoaded(key, type)) {
      return key;
    }
    
    if (fallbackKey && this.isAssetLoaded(fallbackKey, type)) {
      console.warn(`Using fallback asset: ${fallbackKey} for ${key}`);
      return fallbackKey;
    }
    
    console.warn(`Asset not found: ${key} (type: ${type})`);
    return null;
  }

  /**
   * Check multiple assets availability
   */
  public areAssetsLoaded(assets: string[], type: 'image' | 'audio' | 'video' = 'image'): boolean {
    return assets.every(asset => this.isAssetLoaded(asset, type));
  }

  /**
   * Get missing assets from a list
   */
  public getMissingAssets(assets: string[], type: 'image' | 'audio' | 'video' = 'image'): string[] {
    return assets.filter(asset => !this.isAssetLoaded(asset, type));
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    imageCount: number;
    audioCount: number;
    videoCount: number;
    totalSize: number;
  } {
    if (!this.scene) {
      return { imageCount: 0, audioCount: 0, videoCount: 0, totalSize: 0 };
    }

    const imageCount = this.scene.textures.list ? Object.keys(this.scene.textures.list).length : 0;
    const audioCount = this.scene.cache.audio ? this.scene.cache.audio.entries.size : 0;
    const videoCount = this.scene.cache.video ? this.scene.cache.video.entries.size : 0;

    // Note: Calculating actual memory size would require traversing all cached data
    // For now, we return counts
    return {
      imageCount,
      audioCount,
      videoCount,
      totalSize: imageCount + audioCount + videoCount
    };
  }

  /**
   * Clear specific asset from cache
   */
  public clearAsset(key: string, type: 'image' | 'audio' | 'video'): boolean {
    if (!this.scene) return false;

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
      return false;
    } catch (error) {
      console.error(`Error clearing asset ${key}:`, error);
      return false;
    }
  }

  /**
   * Check cache health and integrity
   */
  public validateCache(): {
    healthy: boolean;
    corruptedAssets: string[];
    missingTextures: string[];
  } {
    if (!this.scene) {
      return { healthy: false, corruptedAssets: [], missingTextures: [] };
    }

    const corruptedAssets: string[] = [];
    const missingTextures: string[] = [];

    try {
      // Check texture integrity
      Object.keys(this.scene.textures.list).forEach(key => {
        const texture = this.scene!.textures.get(key);
        if (!texture || texture.key === '__MISSING') {
          missingTextures.push(key);
        }
      });

      // Additional validation can be added here
      const healthy = corruptedAssets.length === 0 && missingTextures.length === 0;

      return { healthy, corruptedAssets, missingTextures };
    } catch (error) {
      console.error('Error validating cache:', error);
      return { healthy: false, corruptedAssets: ['cache_error'], missingTextures: [] };
    }
  }
}
