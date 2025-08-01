/**
 * Tests for Asset Service SRP implementation
 * Validates single responsibility principle across all asset management components
 */

import { jest } from '@jest/globals';

// Import all asset management components
import { AssetCache } from '../../../../typescript/core/services/assets/AssetCache';
import { LoadingProgressTracker, AssetProgress } from '../../../../typescript/core/services/assets/LoadingProgressTracker';
import { AssetPrioritizer } from '../../../../typescript/core/services/assets/AssetPrioritizer';
import { ResourceValidator, ValidationResult } from '../../../../typescript/core/services/assets/ResourceValidator';
import { AssetLoader, LoadingResult } from '../../../../typescript/core/services/assets/AssetLoader';
import { ModernAssetLoaderService, AssetManifest } from '../../../../typescript/core/services/assets/ModernAssetLoaderService';

// Mock Phaser.Scene for testing
const mockScene = {
  textures: {
    exists: jest.fn(() => false),
    get: jest.fn(() => ({ source: [{ width: 100, height: 100 }] })),
    getTextureKeys: jest.fn(() => ['texture1', 'texture2']),
    remove: jest.fn()
  },
  cache: {
    audio: {
      exists: jest.fn(() => false),
      entries: { 
        keys: jest.fn(() => ['audio1']),
        size: 1
      },
      remove: jest.fn(),
      destroy: jest.fn()
    },
    video: {
      exists: jest.fn(() => false),
      entries: { 
        keys: jest.fn(() => ['video1']),
        size: 1
      },
      remove: jest.fn(),
      destroy: jest.fn()
    }
  },
  load: {
    on: jest.fn(),
    off: jest.fn(),
    image: jest.fn(),
    audio: jest.fn(),
    video: jest.fn(),
    start: jest.fn(),
    isLoading: jest.fn(() => false)
  }
} as any;

describe('Asset Service SRP Implementation', () => {
  
  describe('AssetCache', () => {
    let assetCache: AssetCache;

    beforeEach(() => {
      assetCache = new AssetCache();
      assetCache.setScene(mockScene);
      jest.clearAllMocks();
    });

    describe('Single Responsibility: Asset Caching and Availability', () => {
      it('should check if assets are loaded in cache', () => {
        mockScene.textures.exists.mockReturnValue(true);
        expect(assetCache.isAssetLoaded('test-image', 'image')).toBe(true);
        expect(mockScene.textures.exists).toHaveBeenCalledWith('test-image');
      });

      it('should handle different asset types correctly', () => {
        mockScene.cache.audio.exists.mockReturnValue(true);
        expect(assetCache.isAssetLoaded('test-audio', 'audio')).toBe(true);
        expect(mockScene.cache.audio.exists).toHaveBeenCalledWith('test-audio');

        mockScene.cache.video.exists.mockReturnValue(true);
        expect(assetCache.isAssetLoaded('test-video', 'video')).toBe(true);
        expect(mockScene.cache.video.exists).toHaveBeenCalledWith('test-video');
      });

      it('should check multiple assets availability', () => {
        mockScene.textures.exists.mockReturnValue(true);
        const result = assetCache.areAssetsLoaded(['asset1', 'asset2'], 'image');
        expect(result).toBe(true);
        expect(mockScene.textures.exists).toHaveBeenCalledTimes(2);
      });

      it('should identify missing assets', () => {
        mockScene.textures.exists
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false);
        
        const missing = assetCache.getMissingAssets(['asset1', 'asset2'], 'image');
        expect(missing).toEqual(['asset2']);
      });

      it('should provide cache statistics', () => {
        const stats = assetCache.getCacheStats();
        expect(stats).toHaveProperty('imageCount');
        expect(stats).toHaveProperty('audioCount');
        expect(stats).toHaveProperty('videoCount');
        expect(stats).toHaveProperty('totalSize');
      });

      it('should clear specific assets', () => {
        mockScene.textures.exists.mockReturnValue(true);
        const result = assetCache.clearAsset('test-image', 'image');
        expect(result).toBe(true);
        expect(mockScene.textures.remove).toHaveBeenCalledWith('test-image');
      });

      it('should validate cache integrity', () => {
        const validation = assetCache.validateCache();
        expect(validation).toHaveProperty('healthy');
        expect(validation).toHaveProperty('corruptedAssets');
        expect(validation).toHaveProperty('missingTextures');
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on caching operations', () => {
        // AssetCache should not handle loading, prioritization, or validation
        expect(assetCache).not.toHaveProperty('loadAsset');
        expect(assetCache).not.toHaveProperty('prioritizeAssets');
        expect(assetCache).not.toHaveProperty('validateAsset');
      });

      it('should handle fallback strategies within caching scope', () => {
        const asset = assetCache.getAssetWithFallback('missing-asset', 'fallback-asset', 'image');
        expect(asset).toBeDefined();
      });
    });
  });

  describe('LoadingProgressTracker', () => {
    let progressTracker: LoadingProgressTracker;
    let onProgressCallback: jest.Mock;
    let onCompleteCallback: jest.Mock;

    beforeEach(() => {
      progressTracker = new LoadingProgressTracker();
      onProgressCallback = jest.fn();
      onCompleteCallback = jest.fn();
      jest.clearAllMocks();
    });

    describe('Single Responsibility: Progress Tracking', () => {
      it('should track loading progress correctly', () => {
        progressTracker.startTracking(10, 'test-assets');
        progressTracker.onProgress(onProgressCallback);
        
        progressTracker.updateProgress(0.5, 'asset1.png');
        expect(onProgressCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            currentFile: 'asset1.png',
            percentage: expect.any(Number)
          })
        );
      });

      it('should calculate ETA correctly', () => {
        progressTracker.startTracking(10, 'test-assets');
        progressTracker.updateProgress(0.5, 'asset1.png');
        
        const status = progressTracker.getLoadingStatus();
        expect(status.estimatedTimeRemaining).toBeGreaterThanOrEqual(0);
      });

      it('should handle progress completion', () => {
        progressTracker.startTracking(5, 'test-assets');
        progressTracker.onComplete(onCompleteCallback);
        
        // Complete tracking manually
        progressTracker.completeLoading();
        
        expect(onCompleteCallback).toHaveBeenCalled();
      });

      it('should track loading errors', () => {
        progressTracker.startTracking(5, 'test-assets');
        
        let errorMessage = '';
        progressTracker.onError((error) => {
          errorMessage = error;
        });
        
        progressTracker.reportError('Failed to load asset1.png', 'asset1.png');
        
        expect(errorMessage).toContain('asset1.png');
      });

      it('should provide comprehensive progress statistics', () => {
        progressTracker.startTracking(10, 'test-assets');
        progressTracker.updateProgressCount(3, 'asset3.png');
        
        const stats = progressTracker.getProgressStats();
        expect(stats.averageLoadTime).toBeGreaterThanOrEqual(0);
        expect(stats.loadingRate).toBeGreaterThanOrEqual(0);
        expect(stats.totalTimeElapsed).toBeGreaterThanOrEqual(0);
        expect(typeof stats.isStalled).toBe('boolean');
      });

      it('should reset tracking state', () => {
        progressTracker.startTracking(10, 'test-assets');
        progressTracker.updateProgress(0.5, 'asset1.png');
        progressTracker.reset();
        
        const status = progressTracker.getLoadingStatus();
        expect(status.isLoading).toBe(false);
        expect(status.progress).toBe(0);
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on progress tracking', () => {
        // LoadingProgressTracker should not handle asset loading or caching
        expect(progressTracker).not.toHaveProperty('loadAsset');
        expect(progressTracker).not.toHaveProperty('cacheAsset');
        expect(progressTracker).not.toHaveProperty('validateAsset');
      });

      it('should manage callbacks efficiently', () => {
        progressTracker.onProgress(onProgressCallback);
        progressTracker.onComplete(onCompleteCallback);
        
        progressTracker.clearCallbacks();
        
        progressTracker.startTracking(1, 'test');
        progressTracker.updateProgress(1, 'done');
        
        // Callbacks should not be called after clearing
        expect(onProgressCallback).not.toHaveBeenCalled();
        expect(onCompleteCallback).not.toHaveBeenCalled();
      });
    });
  });

  describe('AssetPrioritizer', () => {
    let assetPrioritizer: AssetPrioritizer;

    beforeEach(() => {
      assetPrioritizer = new AssetPrioritizer();
      assetPrioritizer.initialize();
      jest.clearAllMocks();
    });

    describe('Single Responsibility: Asset Prioritization', () => {
      it('should provide critical assets manifest', () => {
        const criticalAssets = assetPrioritizer.getCriticalAssets();
        expect(criticalAssets).toHaveProperty('images');
        expect(criticalAssets).toHaveProperty('audio');
        expect(criticalAssets).toHaveProperty('video');
        expect(Object.keys(criticalAssets.images).length).toBeGreaterThan(0);
      });

      it('should provide game assets manifest', () => {
        const gameAssets = assetPrioritizer.getGameAssets();
        expect(gameAssets).toHaveProperty('images');
        expect(gameAssets).toHaveProperty('audio');
        expect(gameAssets).toHaveProperty('video');
      });

      it('should return assets sorted by priority', () => {
        const prioritizedAssets = assetPrioritizer.getAssetsByPriority(true);
        expect(Array.isArray(prioritizedAssets)).toBe(true);
        
        // Check if sorted by priority (higher priority first)
        for (let i = 1; i < prioritizedAssets.length; i++) {
          expect(prioritizedAssets[i-1].priority).toBeGreaterThanOrEqual(prioritizedAssets[i].priority);
        }
      });

      it('should group assets into chunks', () => {
        const chunks = assetPrioritizer.getAssetsInChunks(5);
        expect(Array.isArray(chunks)).toBe(true);
        chunks.forEach(chunk => {
          expect(chunk.length).toBeLessThanOrEqual(5);
        });
      });

      it('should filter assets by scene', () => {
        const menuAssets = assetPrioritizer.getSceneAssets('MainMenu');
        expect(Array.isArray(menuAssets)).toBe(true);
        
        // All assets should be categorized for MainMenu or be critical
        menuAssets.forEach(asset => {
          expect(['MainMenu', 'critical', 'ui'].some(category => 
            asset.category.includes(category)
          )).toBe(true);
        });
      });

      it('should determine asset priority correctly', () => {
        const priority = assetPrioritizer.getAssetPriority('background_menu', 'image');
        expect(['critical', 'high', 'normal', 'low', 'background']).toContain(priority);
      });

      it('should provide priority statistics', () => {
        const stats = assetPrioritizer.getAssetCountsByPriority();
        expect(stats).toHaveProperty('critical');
        expect(stats).toHaveProperty('high');
        expect(stats).toHaveProperty('normal');
        expect(stats).toHaveProperty('low');
        expect(stats).toHaveProperty('background');
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on prioritization logic', () => {
        // AssetPrioritizer should not handle loading, caching, or validation
        expect(assetPrioritizer).not.toHaveProperty('loadAsset');
        expect(assetPrioritizer).not.toHaveProperty('cacheAsset');
        expect(assetPrioritizer).not.toHaveProperty('validateAsset');
      });

      it('should provide deterministic prioritization', () => {
        const assets1 = assetPrioritizer.getAssetsByPriority(true);
        const assets2 = assetPrioritizer.getAssetsByPriority(true);
        
        expect(assets1).toEqual(assets2);
      });
    });
  });

  describe('ResourceValidator', () => {
    let resourceValidator: ResourceValidator;

    beforeEach(() => {
      resourceValidator = new ResourceValidator();
      resourceValidator.setScene(mockScene);
      jest.clearAllMocks();
    });

    describe('Single Responsibility: Asset Validation', () => {
      it('should validate single asset correctly', async () => {
        const result = await resourceValidator.validateAsset(
          'test-image',
          'assets/images/test.png',
          'image'
        );
        
        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(typeof result.isValid).toBe('boolean');
      });

      it('should validate multiple assets', async () => {
        const assets = [
          { key: 'image1', path: 'assets/images/image1.png', type: 'image' as const },
          { key: 'audio1', path: 'assets/sounds/audio1.mp3', type: 'audio' as const }
        ];
        
        const result = await resourceValidator.validateAssets(assets);
        expect(result).toHaveProperty('isValid');
        expect(Array.isArray(result.errors)).toBe(true);
      });

      it('should validate complete manifest', async () => {
        const manifest = {
          images: { 'test-img': 'assets/images/test.png' },
          audio: { 'test-audio': 'assets/sounds/test.mp3' },
          video: { 'test-video': 'assets/videos/test.mp4' }
        };
        
        const result = await resourceValidator.validateManifest(manifest);
        expect(result).toHaveProperty('isValid');
        expect(Array.isArray(result.missingFiles)).toBe(true);
      });

      it('should support custom validation rules', async () => {
        const customRule = {
          name: 'customRule',
          validate: async () => false,
          errorMessage: 'Custom validation failed'
        };
        
        resourceValidator.addValidationRule(customRule);
        
        const result = await resourceValidator.validateAsset(
          'test',
          'assets/test.png',
          'image'
        );
        
        expect(result.errors.some(error => error.includes('Custom validation failed'))).toBe(true);
      });

      it('should remove validation rules', async () => {
        const ruleName = 'testRule';
        resourceValidator.addValidationRule({
          name: ruleName,
          validate: async () => false,
          errorMessage: 'Test error'
        });
        
        resourceValidator.removeValidationRule(ruleName);
        
        const summary = resourceValidator.getValidationSummary();
        expect(summary.rules).not.toContain(ruleName);
      });

      it('should provide validation summary', () => {
        const summary = resourceValidator.getValidationSummary();
        expect(summary).toHaveProperty('rulesCount');
        expect(summary).toHaveProperty('rules');
        expect(summary).toHaveProperty('hasScene');
        expect(typeof summary.rulesCount).toBe('number');
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on validation logic', () => {
        // ResourceValidator should not handle loading, caching, or prioritization
        expect(resourceValidator).not.toHaveProperty('loadAsset');
        expect(resourceValidator).not.toHaveProperty('cacheAsset');
        expect(resourceValidator).not.toHaveProperty('prioritizeAssets');
      });

      it('should validate without modifying assets', async () => {
        const assets = [
          { key: 'test', path: 'assets/test.png', type: 'image' as const }
        ];
        
        const originalAssets = JSON.parse(JSON.stringify(assets));
        await resourceValidator.validateAssets(assets);
        
        expect(assets).toEqual(originalAssets);
      });
    });
  });

  describe('AssetLoader', () => {
    let assetLoader: AssetLoader;

    beforeEach(() => {
      assetLoader = new AssetLoader();
      assetLoader.setScene(mockScene);
      jest.clearAllMocks();
    });

    describe('Single Responsibility: File Loading', () => {
      it('should check if assets are loaded', () => {
        mockScene.textures.exists.mockReturnValue(true);
        expect(assetLoader.isAssetLoaded('test-image', 'image')).toBe(true);
        expect(mockScene.textures.exists).toHaveBeenCalledWith('test-image');
      });

      it('should get list of loaded assets', () => {
        const loadedAssets = assetLoader.getLoadedAssets();
        expect(loadedAssets).toHaveProperty('images');
        expect(loadedAssets).toHaveProperty('audio');
        expect(loadedAssets).toHaveProperty('video');
      });

      it('should unload specific assets', () => {
        mockScene.textures.exists.mockReturnValue(true);
        const result = assetLoader.unloadAsset('test-image', 'image');
        expect(result).toBe(true);
        expect(mockScene.textures.remove).toHaveBeenCalledWith('test-image');
      });

      it('should clear all assets', () => {
        assetLoader.clearAllAssets();
        expect(mockScene.cache.audio.destroy).toHaveBeenCalled();
        expect(mockScene.cache.video.destroy).toHaveBeenCalled();
      });

      it('should provide memory usage estimates', () => {
        const memoryUsage = assetLoader.getMemoryUsage();
        expect(memoryUsage).toHaveProperty('images');
        expect(memoryUsage).toHaveProperty('audio');
        expect(memoryUsage).toHaveProperty('video');
        expect(memoryUsage).toHaveProperty('total');
        expect(typeof memoryUsage.total).toBe('number');
      });
    });

    describe('SRP Compliance', () => {
      it('should focus only on loading operations', () => {
        // AssetLoader should not handle prioritization, validation, or caching logic
        expect(assetLoader).not.toHaveProperty('prioritizeAssets');
        expect(assetLoader).not.toHaveProperty('validateAsset');
        expect(assetLoader).not.toHaveProperty('getCacheStats');
      });

      it('should handle loading without external dependencies', () => {
        // AssetLoader should work independently
        const newLoader = new AssetLoader(mockScene);
        expect(newLoader.isAssetLoaded).toBeDefined();
        expect(newLoader.getLoadedAssets).toBeDefined();
      });
    });
  });

  describe('ModernAssetLoaderService', () => {
    let modernAssetLoader: ModernAssetLoaderService;
    let testManifest: AssetManifest;

    beforeEach(() => {
      modernAssetLoader = new ModernAssetLoaderService();
      modernAssetLoader.setScene(mockScene);
      
      testManifest = {
        images: {
          'test-image': 'assets/images/test.png',
          'background': 'assets/images/bg.png'
        },
        audio: {
          'test-sound': 'assets/sounds/test.mp3'
        },
        video: {
          'test-video': 'assets/videos/test.mp4'
        }
      };
      
      jest.clearAllMocks();
    });

    describe('Single Responsibility: Orchestration', () => {
      it('should orchestrate all asset loading components', async () => {
        const config = {
          validateAssets: false, // Skip validation for faster test
          useCache: true,
          usePrioritization: true,
          trackProgress: true
        };
        
        const callbacks = {
          onProgress: jest.fn(),
          onComplete: jest.fn()
        };
        
        // Mock successful loading
        mockScene.textures.exists.mockReturnValue(false);
        
        const result = await modernAssetLoader.loadFromManifest(
          testManifest,
          config,
          callbacks
        );
        
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('loadedAssets');
        expect(result).toHaveProperty('failedAssets');
        expect(result).toHaveProperty('totalTime');
      });

      it('should load specific assets', async () => {
        const assetKeys = ['test-image', 'test-sound'];
        
        // Mock successful loading by returning immediately
        const result = await modernAssetLoader.loadAssets(
          assetKeys,
          testManifest,
          { 
            validateAssets: false,
            loadingOptions: { timeout: 100 } // Fast timeout for testing
          }
        );
        
        expect(result).toHaveProperty('success');
      }, 15000); // Increase timeout for this test

      it('should preload critical assets', async () => {
        const criticalAssets = ['background'];
        const result = await modernAssetLoader.preloadCriticalAssets(
          testManifest,
          criticalAssets,
          { validateAssets: false }
        );
        
        expect(result).toHaveProperty('success');
      });

      it('should provide loading statistics', () => {
        const stats = modernAssetLoader.getLoadingStatistics();
        expect(stats).toHaveProperty('cache');
        expect(stats).toHaveProperty('progress');
        expect(stats).toHaveProperty('validator');
        expect(stats).toHaveProperty('loader');
      });

      it('should check if manifest is loaded', () => {
        mockScene.textures.exists.mockReturnValue(true);
        mockScene.cache.audio.exists.mockReturnValue(true);
        mockScene.cache.video.exists.mockReturnValue(true);
        
        const isLoaded = modernAssetLoader.isManifestLoaded(testManifest);
        expect(typeof isLoaded).toBe('boolean');
      });

      it('should reset all components', () => {
        modernAssetLoader.reset();
        // Should not throw errors
        expect(true).toBe(true);
      });

      it('should provide access to individual components', () => {
        const components = modernAssetLoader.getComponents();
        expect(components).toHaveProperty('cache');
        expect(components).toHaveProperty('progressTracker');
        expect(components).toHaveProperty('prioritizer');
        expect(components).toHaveProperty('validator');
        expect(components).toHaveProperty('loader');
      });
    });

    describe('SRP Compliance', () => {
      it('should only orchestrate, not implement specific logic', () => {
        const components = modernAssetLoader.getComponents();
        
        // Should delegate to specialized components
        expect(components.cache).toBeDefined();
        expect(components.progressTracker).toBeDefined();
        expect(components.prioritizer).toBeDefined();
        expect(components.validator).toBeDefined();
        expect(components.loader).toBeDefined();
      });

      it('should maintain separation of concerns', () => {
        // ModernAssetLoaderService should not implement caching, validation, etc. directly
        expect(modernAssetLoader).not.toHaveProperty('validateAsset');
        expect(modernAssetLoader).not.toHaveProperty('cacheAsset');
        expect(modernAssetLoader).not.toHaveProperty('prioritizeAsset');
      });
    });
  });

  describe('SRP Integration', () => {
    it('should demonstrate clear separation of responsibilities', () => {
      const cache = new AssetCache();
      const progressTracker = new LoadingProgressTracker();
      const prioritizer = new AssetPrioritizer();
      const validator = new ResourceValidator();
      const loader = new AssetLoader();
      const orchestrator = new ModernAssetLoaderService();
      
      // Each component should have distinct responsibilities
      expect(cache.isAssetLoaded).toBeDefined();
      expect(progressTracker.startTracking).toBeDefined();
      expect(prioritizer.getAssetsByPriority).toBeDefined();
      expect(validator.validateAsset).toBeDefined();
      expect(loader.getLoadedAssets).toBeDefined();
      expect(orchestrator.loadFromManifest).toBeDefined();
      
      // No component should duplicate another's core functionality
      expect(cache).not.toHaveProperty('startTracking');
      expect(progressTracker).not.toHaveProperty('validateAsset');
      expect(prioritizer).not.toHaveProperty('isAssetLoaded');
    });

    it('should support composition over inheritance', () => {
      const modernService = new ModernAssetLoaderService();
      const components = modernService.getComponents();
      
      // Each component is composed, not inherited
      expect(components.cache).toBeInstanceOf(AssetCache);
      expect(components.progressTracker).toBeInstanceOf(LoadingProgressTracker);
      expect(components.prioritizer).toBeInstanceOf(AssetPrioritizer);
      expect(components.validator).toBeInstanceOf(ResourceValidator);
      expect(components.loader).toBeInstanceOf(AssetLoader);
    });

    it('should enable independent testing of each component', () => {
      // Each component can be tested in isolation
      const cache = new AssetCache(mockScene);
      
      // Mock scene returns false, so asset should not be loaded
      mockScene.textures.exists.mockReturnValue(false);
      expect(cache.isAssetLoaded('test', 'image')).toBe(false);
      
      const progressTracker = new LoadingProgressTracker();
      progressTracker.startTracking(5);
      expect(progressTracker.getLoadingStatus().total).toBe(5);
      
      const prioritizer = new AssetPrioritizer();
      prioritizer.initialize();
      expect(prioritizer.getCriticalAssets()).toBeDefined();
    });
  });
});
