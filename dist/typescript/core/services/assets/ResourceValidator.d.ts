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
export declare class ResourceValidator {
    private validationRules;
    private scene;
    constructor(scene?: Phaser.Scene);
    /**
     * Set the Phaser scene for validation operations
     */
    setScene(scene: Phaser.Scene): void;
    /**
     * Setup default validation rules
     */
    private setupDefaultValidationRules;
    /**
     * Add custom validation rule
     */
    addValidationRule(rule: AssetValidationRule): void;
    /**
     * Remove validation rule by name
     */
    removeValidationRule(name: string): void;
    /**
     * Validate a single asset
     */
    validateAsset(key: string, path: string, type: 'image' | 'audio' | 'video'): Promise<ValidationResult>;
    /**
     * Validate multiple assets
     */
    validateAssets(assets: Array<{
        key: string;
        path: string;
        type: 'image' | 'audio' | 'video';
    }>): Promise<ValidationResult>;
    /**
     * Validate asset manifest
     */
    validateManifest(manifest: {
        images: Record<string, string>;
        audio: Record<string, string>;
        video: Record<string, string>;
    }): Promise<ValidationResult>;
    /**
     * Test asset loading without adding to scene
     */
    private validateAssetLoading;
    /**
     * Find duplicate asset keys across all types
     */
    private findDuplicateKeys;
    /**
     * Find paths that don't follow conventions
     */
    private findUnusualPaths;
    /**
     * Get validation summary
     */
    getValidationSummary(): {
        rulesCount: number;
        rules: string[];
        hasScene: boolean;
    };
}
