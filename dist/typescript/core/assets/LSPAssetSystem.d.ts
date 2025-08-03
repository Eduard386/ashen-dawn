/**
 * LSP-Compliant Asset System
 * Demonstrates Liskov Substitution Principle with polymorphic assets
 */
/**
 * Asset Status Enumeration
 */
export declare enum AssetStatus {
    UNLOADED = "unloaded",
    LOADING = "loading",
    LOADED = "loaded",
    ERROR = "error",
    DISPOSED = "disposed"
}
/**
 * Asset Type Enumeration
 */
export declare enum AssetType {
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    JSON = "json",
    TEXT = "text",
    BINARY = "binary"
}
/**
 * Asset Metadata Interface
 */
export interface IAssetMetadata {
    /** Asset identifier */
    readonly id: string;
    /** Asset path/URL */
    readonly path: string;
    /** Asset type */
    readonly type: AssetType;
    /** Asset size in bytes (if known) */
    readonly size?: number;
    /** Asset MIME type */
    readonly mimeType?: string;
    /** Asset creation/modification timestamp */
    readonly lastModified?: Date;
    /** Asset tags for categorization */
    readonly tags: string[];
    /** Asset priority for loading */
    readonly priority: number;
}
/**
 * Asset Load Options Interface
 */
export interface IAssetLoadOptions {
    /** Force reload even if already loaded */
    readonly forceReload?: boolean;
    /** Timeout for loading operation */
    readonly timeout?: number;
    /** Progress callback */
    readonly onProgress?: (progress: number) => void;
    /** Custom headers for network requests */
    readonly headers?: Record<string, string>;
    /** Cache control options */
    readonly cacheControl?: string;
}
/**
 * Asset Load Result Interface
 */
export interface IAssetLoadResult {
    /** Success status */
    readonly success: boolean;
    /** Load duration in milliseconds */
    readonly duration: number;
    /** Actual size loaded */
    readonly bytesLoaded: number;
    /** Load timestamp */
    readonly timestamp: Date;
    /** Error message if failed */
    readonly error?: string;
    /** Additional metadata */
    readonly metadata: Record<string, any>;
}
/**
 * Abstract Base Asset Class
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Loading behavior must honor the same preconditions and postconditions
 * - Size calculation must be consistent across implementations
 */
export declare abstract class Asset {
    protected _metadata: IAssetMetadata;
    protected _status: AssetStatus;
    protected _data: any;
    protected _loadResult: IAssetLoadResult | null;
    protected _loadStartTime: number;
    constructor(metadata: IAssetMetadata);
    /**
     * Load the asset
     *
     * LSP Contract:
     * - Precondition: asset must not be disposed
     * - Postcondition: status is LOADED or ERROR
     * - Must be idempotent unless forceReload is specified
     */
    load(options?: IAssetLoadOptions): Promise<IAssetLoadResult>;
    /**
     * Check if asset is loaded
     *
     * LSP Contract:
     * - Postcondition: returns true only if status is LOADED
     * - Pure function: no side effects
     */
    isLoaded(): boolean;
    /**
     * Get asset size in bytes
     *
     * LSP Contract:
     * - Postcondition: returns non-negative number
     * - Pure function: no side effects for loaded assets
     */
    getSize(): number;
    /**
     * Get asset metadata
     *
     * LSP Contract:
     * - Postcondition: returns immutable copy of metadata
     * - Pure function: no side effects
     */
    getMetadata(): IAssetMetadata;
    /**
     * Get current asset status
     *
     * LSP Contract:
     * - Postcondition: returns current AssetStatus
     * - Pure function: no side effects
     */
    getStatus(): AssetStatus;
    /**
     * Get asset data (if loaded)
     *
     * LSP Contract:
     * - Precondition: asset must be loaded
     * - Postcondition: returns asset data or throws error
     */
    getData<T = any>(): T;
    /**
     * Get load result information
     *
     * LSP Contract:
     * - Postcondition: returns load result if load was attempted, null otherwise
     * - Pure function: no side effects
     */
    getLoadResult(): IAssetLoadResult | null;
    /**
     * Dispose the asset and free resources
     *
     * LSP Contract:
     * - Postcondition: status is DISPOSED, data is cleared
     * - Must be idempotent: multiple calls should not cause issues
     */
    dispose(): void;
    /**
     * Clone the asset (create a new instance with same metadata)
     *
     * LSP Contract:
     * - Postcondition: returns new asset instance with same metadata
     * - Original asset is unchanged
     */
    abstract clone(): Asset;
    /**
     * Validate asset data integrity
     *
     * LSP Contract:
     * - Precondition: asset must be loaded
     * - Postcondition: returns true if data is valid, false otherwise
     */
    validate(): boolean;
    /**
     * Abstract method: Asset-specific loading logic
     * Subclasses must implement their loading behavior
     */
    protected abstract onLoad(options?: IAssetLoadOptions): Promise<any>;
    /**
     * Virtual method: Calculate actual asset size
     * Subclasses should override for accurate size calculation
     */
    protected calculateSize(): number;
    /**
     * Virtual method: Asset-specific disposal logic
     * Subclasses can override for custom cleanup
     */
    protected onDispose(): void;
    /**
     * Virtual method: Asset-specific validation logic
     * Subclasses can override for custom validation
     */
    protected onValidate(): boolean;
}
/**
 * Image Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export declare class ImageAsset extends Asset {
    private imageElement;
    constructor(metadata: IAssetMetadata);
    protected onLoad(options?: IAssetLoadOptions): Promise<HTMLImageElement>;
    protected calculateSize(): number;
    protected onDispose(): void;
    protected onValidate(): boolean;
    clone(): ImageAsset;
    getDimensions(): {
        width: number;
        height: number;
    };
    getImageElement(): HTMLImageElement;
}
/**
 * Audio Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export declare class AudioAsset extends Asset {
    private audioElement;
    constructor(metadata: IAssetMetadata);
    protected onLoad(options?: IAssetLoadOptions): Promise<HTMLAudioElement>;
    protected calculateSize(): number;
    protected onDispose(): void;
    protected onValidate(): boolean;
    clone(): AudioAsset;
    getDuration(): number;
    getAudioElement(): HTMLAudioElement;
    play(): Promise<void>;
    pause(): void;
}
/**
 * JSON Data Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export declare class JSONAsset extends Asset {
    constructor(metadata: IAssetMetadata);
    protected onLoad(options?: IAssetLoadOptions): Promise<any>;
    protected onValidate(): boolean;
    clone(): JSONAsset;
    query(path: string): any;
    getKeys(): string[];
}
/**
 * Text Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export declare class TextAsset extends Asset {
    constructor(metadata: IAssetMetadata);
    protected onLoad(options?: IAssetLoadOptions): Promise<string>;
    protected calculateSize(): number;
    protected onValidate(): boolean;
    clone(): TextAsset;
    getLineCount(): number;
    getLines(): string[];
    search(pattern: string | RegExp): number[];
}
