/**
 * Resource Validator - Single responsibility for asset validation
 * Handles file existence checks, format validation, integrity verification
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFiles: string[];
  corruptedFiles: string[];
}

export interface AssetValidationRule {
  name: string;
  validate: (key: string, path: string, type: 'image' | 'audio' | 'video') => Promise<boolean>;
  errorMessage: string;
}

export class ResourceValidator {
  private validationRules: AssetValidationRule[] = [];
  private scene: Phaser.Scene | null = null;

  constructor(scene?: Phaser.Scene) {
    if (scene) {
      this.scene = scene;
    }
    this.setupDefaultValidationRules();
  }

  /**
   * Set the Phaser scene for validation operations
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  /**
   * Setup default validation rules
   */
  private setupDefaultValidationRules(): void {
    // File extension validation
    this.addValidationRule({
      name: 'fileExtension',
      validate: async (key: string, path: string, type: 'image' | 'audio' | 'video') => {
        const validExtensions: Record<string, string[]> = {
          image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
          audio: ['.mp3', '.wav', '.ogg', '.m4a'],
          video: ['.mp4', '.webm', '.ogg']
        };
        
        const extensions = validExtensions[type] || [];
        return extensions.some(ext => path.toLowerCase().endsWith(ext));
      },
      errorMessage: 'Invalid file extension for asset type'
    });

    // Path validation
    this.addValidationRule({
      name: 'pathValidation',
      validate: async (key: string, path: string, type: 'image' | 'audio' | 'video') => {
        // Basic path validation
        return path.startsWith('assets/') && path.length > 7 && !path.includes('..');
      },
      errorMessage: 'Invalid asset path'
    });

    // Key validation
    this.addValidationRule({
      name: 'keyValidation',
      validate: async (key: string, path: string, type: 'image' | 'audio' | 'video') => {
        // Keys should be non-empty and not contain invalid characters
        return key.length > 0 && !/[<>:"/\\|?*]/.test(key);
      },
      errorMessage: 'Invalid asset key'
    });
  }

  /**
   * Add custom validation rule
   */
  public addValidationRule(rule: AssetValidationRule): void {
    this.validationRules.push(rule);
  }

  /**
   * Remove validation rule by name
   */
  public removeValidationRule(name: string): void {
    this.validationRules = this.validationRules.filter(rule => rule.name !== name);
  }

  /**
   * Validate a single asset
   */
  public async validateAsset(
    key: string, 
    path: string, 
    type: 'image' | 'audio' | 'video'
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingFiles: [],
      corruptedFiles: []
    };

    // Run all validation rules
    for (const rule of this.validationRules) {
      try {
        const isValid = await rule.validate(key, path, type);
        if (!isValid) {
          result.errors.push(`${rule.name}: ${rule.errorMessage} (${key})`);
          result.isValid = false;
        }
      } catch (error) {
        result.errors.push(`${rule.name}: Validation error - ${error}`);
        result.isValid = false;
      }
    }

    // Check if file can be loaded (if we have a scene)
    if (this.scene) {
      const loadResult = await this.validateAssetLoading(key, path, type);
      if (!loadResult.success) {
        if (loadResult.missing) {
          result.missingFiles.push(path);
        }
        if (loadResult.corrupted) {
          result.corruptedFiles.push(path);
        }
        result.errors.push(...loadResult.errors);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Validate multiple assets
   */
  public async validateAssets(assets: Array<{
    key: string;
    path: string;
    type: 'image' | 'audio' | 'video';
  }>): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingFiles: [],
      corruptedFiles: []
    };

    const validationPromises = assets.map(asset => 
      this.validateAsset(asset.key, asset.path, asset.type)
    );

    const results = await Promise.all(validationPromises);

    // Combine results
    results.forEach(assetResult => {
      if (!assetResult.isValid) {
        result.isValid = false;
      }
      result.errors.push(...assetResult.errors);
      result.warnings.push(...assetResult.warnings);
      result.missingFiles.push(...assetResult.missingFiles);
      result.corruptedFiles.push(...assetResult.corruptedFiles);
    });

    return result;
  }

  /**
   * Validate asset manifest
   */
  public async validateManifest(manifest: {
    images: Record<string, string>;
    audio: Record<string, string>;
    video: Record<string, string>;
  }): Promise<ValidationResult> {
    const assets = [
      ...Object.entries(manifest.images).map(([key, path]) => ({ key, path, type: 'image' as const })),
      ...Object.entries(manifest.audio).map(([key, path]) => ({ key, path, type: 'audio' as const })),
      ...Object.entries(manifest.video).map(([key, path]) => ({ key, path, type: 'video' as const }))
    ];

    const result = await this.validateAssets(assets);

    // Additional manifest-level validations
    const duplicateKeys = this.findDuplicateKeys(manifest);
    if (duplicateKeys.length > 0) {
      result.warnings.push(`Duplicate asset keys found: ${duplicateKeys.join(', ')}`);
    }

    const unusualPaths = this.findUnusualPaths(assets);
    if (unusualPaths.length > 0) {
      result.warnings.push(`Unusual asset paths detected: ${unusualPaths.join(', ')}`);
    }

    return result;
  }

  /**
   * Test asset loading without adding to scene
   */
  private async validateAssetLoading(
    key: string, 
    path: string, 
    type: 'image' | 'audio' | 'video'
  ): Promise<{
    success: boolean;
    missing: boolean;
    corrupted: boolean;
    errors: string[];
  }> {
    if (!this.scene) {
      return { success: false, missing: false, corrupted: false, errors: ['No scene available for validation'] };
    }

    return new Promise((resolve) => {
      const tempKey = `__validation_${key}_${Date.now()}`;
      const errors: string[] = [];
      let missing = false;
      let corrupted = false;

      const cleanup = () => {
        try {
          // Remove temporary asset
          switch (type) {
            case 'image':
              if (this.scene!.textures.exists(tempKey)) {
                this.scene!.textures.remove(tempKey);
              }
              break;
            case 'audio':
              if (this.scene!.cache.audio.exists(tempKey)) {
                this.scene!.cache.audio.remove(tempKey);
              }
              break;
            case 'video':
              if (this.scene!.cache.video?.exists(tempKey)) {
                this.scene!.cache.video.remove(tempKey);
              }
              break;
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      };

      const onLoad = () => {
        cleanup();
        resolve({ success: true, missing: false, corrupted: false, errors: [] });
      };

      const onError = (file: any) => {
        missing = true;
        errors.push(`Failed to load ${path}: File not found or inaccessible`);
        cleanup();
        resolve({ success: false, missing, corrupted, errors });
      };

      const onFileError = (file: any) => {
        corrupted = true;
        errors.push(`Corrupted file: ${path}`);
        cleanup();
        resolve({ success: false, missing, corrupted, errors });
      };

      try {
        // Create temporary loader
        const tempLoader = new Phaser.Loader.LoaderPlugin(this.scene);
        
        tempLoader.once('complete', onLoad);
        tempLoader.once('loaderror', onError);
        tempLoader.once('fileerror', onFileError);

        // Add asset to temporary loader
        switch (type) {
          case 'image':
            tempLoader.image(tempKey, path);
            break;
          case 'audio':
            tempLoader.audio(tempKey, path);
            break;
          case 'video':
            tempLoader.video(tempKey, path);
            break;
        }

        tempLoader.start();

        // Timeout after 5 seconds
        setTimeout(() => {
          cleanup();
          resolve({ 
            success: false, 
            missing: true, 
            corrupted: false, 
            errors: [`Validation timeout for ${path}`] 
          });
        }, 5000);

      } catch (error) {
        cleanup();
        resolve({ 
          success: false, 
          missing: false, 
          corrupted: true, 
          errors: [`Validation error: ${error}`] 
        });
      }
    });
  }

  /**
   * Find duplicate asset keys across all types
   */
  private findDuplicateKeys(manifest: {
    images: Record<string, string>;
    audio: Record<string, string>;
    video: Record<string, string>;
  }): string[] {
    const allKeys = [
      ...Object.keys(manifest.images),
      ...Object.keys(manifest.audio),
      ...Object.keys(manifest.video)
    ];

    const keyCountMap = new Map<string, number>();
    allKeys.forEach(key => {
      keyCountMap.set(key, (keyCountMap.get(key) || 0) + 1);
    });

    return Array.from(keyCountMap.entries())
      .filter(([_, count]) => count > 1)
      .map(([key, _]) => key);
  }

  /**
   * Find paths that don't follow conventions
   */
  private findUnusualPaths(assets: Array<{
    key: string;
    path: string;
    type: 'image' | 'audio' | 'video';
  }>): string[] {
    const unusualPaths: string[] = [];

    assets.forEach(asset => {
      // Check for non-standard directory structure
      if (!asset.path.startsWith('assets/')) {
        unusualPaths.push(asset.path);
        return;
      }

      // Check for expected directory patterns
      const expectedPatterns: Record<string, RegExp[]> = {
        image: [
          /^assets\/images\//,
          /^assets\/ui\//,
          /^assets\/sprites\//
        ],
        audio: [
          /^assets\/sounds\//,
          /^assets\/music\//,
          /^assets\/audio\//,
          /^assets\/.*\.mp3$/
        ],
        video: [
          /^assets\/videos\//,
          /^assets\/.*\.mp4$/
        ]
      };

      const patterns = expectedPatterns[asset.type] || [];
      if (patterns.length > 0 && !patterns.some(pattern => pattern.test(asset.path))) {
        unusualPaths.push(asset.path);
      }
    });

    return unusualPaths;
  }

  /**
   * Get validation summary
   */
  public getValidationSummary(): {
    rulesCount: number;
    rules: string[];
    hasScene: boolean;
  } {
    return {
      rulesCount: this.validationRules.length,
      rules: this.validationRules.map(rule => rule.name),
      hasScene: !!this.scene
    };
  }
}
