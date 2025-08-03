/**
 * LSP-Compliant Asset System
 * Demonstrates Liskov Substitution Principle with polymorphic assets
 */

/**
 * Asset Status Enumeration
 */
export enum AssetStatus {
  UNLOADED = 'unloaded',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
  DISPOSED = 'disposed'
}

/**
 * Asset Type Enumeration
 */
export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  JSON = 'json',
  TEXT = 'text',
  BINARY = 'binary'
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
export abstract class Asset {
  protected _metadata: IAssetMetadata;
  protected _status: AssetStatus = AssetStatus.UNLOADED;
  protected _data: any = null;
  protected _loadResult: IAssetLoadResult | null = null;
  protected _loadStartTime: number = 0;

  constructor(metadata: IAssetMetadata) {
    // Precondition: metadata must be valid
    if (!metadata || !metadata.id || !metadata.path) {
      throw new Error('Asset metadata must include id and path');
    }
    
    this._metadata = { ...metadata };
  }

  /**
   * Load the asset
   * 
   * LSP Contract:
   * - Precondition: asset must not be disposed
   * - Postcondition: status is LOADED or ERROR
   * - Must be idempotent unless forceReload is specified
   */
  public async load(options: IAssetLoadOptions = {}): Promise<IAssetLoadResult> {
    // Honor precondition
    if (this._status === AssetStatus.DISPOSED) {
      throw new Error('Cannot load disposed asset');
    }

    // Idempotent behavior
    if (this._status === AssetStatus.LOADED && !(options && options.forceReload)) {
      return this._loadResult!;
    }

    if (this._status === AssetStatus.LOADING) {
      throw new Error('Asset is already loading');
    }

    this._status = AssetStatus.LOADING;
    this._loadStartTime = Date.now();

    try {
      // Template method: subclasses implement specific loading logic
      this._data = await this.onLoad(options);
      
      const duration = Date.now() - this._loadStartTime;
      this._loadResult = {
        success: true,
        duration,
        bytesLoaded: this.calculateSize(),
        timestamp: new Date(),
        metadata: {
          type: this._metadata.type,
          path: this._metadata.path
        }
      };

      // Ensure postcondition: status is LOADED after successful load
      this._status = AssetStatus.LOADED;
      
      return this._loadResult;
    } catch (error) {
      const duration = Date.now() - this._loadStartTime;
      this._loadResult = {
        success: false,
        duration,
        bytesLoaded: 0,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          type: this._metadata.type,
          path: this._metadata.path
        }
      };

      this._status = AssetStatus.ERROR;
      throw error;
    }
  }

  /**
   * Check if asset is loaded
   * 
   * LSP Contract:
   * - Postcondition: returns true only if status is LOADED
   * - Pure function: no side effects
   */
  public isLoaded(): boolean {
    return this._status === AssetStatus.LOADED;
  }

  /**
   * Get asset size in bytes
   * 
   * LSP Contract:
   * - Postcondition: returns non-negative number
   * - Pure function: no side effects for loaded assets
   */
  public getSize(): number {
    if (this._status === AssetStatus.LOADED) {
      return this.calculateSize();
    }
    
    // Return estimated size from metadata if not loaded
    return this._metadata.size || 0;
  }

  /**
   * Get asset metadata
   * 
   * LSP Contract:
   * - Postcondition: returns immutable copy of metadata
   * - Pure function: no side effects
   */
  public getMetadata(): IAssetMetadata {
    return { ...this._metadata };
  }

  /**
   * Get current asset status
   * 
   * LSP Contract:
   * - Postcondition: returns current AssetStatus
   * - Pure function: no side effects
   */
  public getStatus(): AssetStatus {
    return this._status;
  }

  /**
   * Get asset data (if loaded)
   * 
   * LSP Contract:
   * - Precondition: asset must be loaded
   * - Postcondition: returns asset data or throws error
   */
  public getData<T = any>(): T {
    if (this._status !== AssetStatus.LOADED) {
      throw new Error('Asset must be loaded before accessing data');
    }
    
    return this._data as T;
  }

  /**
   * Get load result information
   * 
   * LSP Contract:
   * - Postcondition: returns load result if load was attempted, null otherwise
   * - Pure function: no side effects
   */
  public getLoadResult(): IAssetLoadResult | null {
    return this._loadResult;
  }

  /**
   * Dispose the asset and free resources
   * 
   * LSP Contract:
   * - Postcondition: status is DISPOSED, data is cleared
   * - Must be idempotent: multiple calls should not cause issues
   */
  public dispose(): void {
    if (this._status === AssetStatus.DISPOSED) {
      return; // Idempotent behavior
    }

    // Template method: subclasses can implement specific disposal logic
    this.onDispose();
    
    this._data = null;
    this._status = AssetStatus.DISPOSED;
  }

  /**
   * Clone the asset (create a new instance with same metadata)
   * 
   * LSP Contract:
   * - Postcondition: returns new asset instance with same metadata
   * - Original asset is unchanged
   */
  public abstract clone(): Asset;

  /**
   * Validate asset data integrity
   * 
   * LSP Contract:
   * - Precondition: asset must be loaded
   * - Postcondition: returns true if data is valid, false otherwise
   */
  public validate(): boolean {
    if (this._status !== AssetStatus.LOADED) {
      return false;
    }

    return this.onValidate();
  }

  /**
   * Abstract method: Asset-specific loading logic
   * Subclasses must implement their loading behavior
   */
  protected abstract onLoad(options?: IAssetLoadOptions): Promise<any>;

  /**
   * Virtual method: Calculate actual asset size
   * Subclasses should override for accurate size calculation
   */
  protected calculateSize(): number {
    if (!this._data) {
      return 0;
    }

    // Default implementation for basic data types
    if (typeof this._data === 'string') {
      return new Blob([this._data]).size;
    }
    
    if (this._data instanceof ArrayBuffer) {
      return this._data.byteLength;
    }
    
    // Rough estimate for objects
    return JSON.stringify(this._data).length * 2;
  }

  /**
   * Virtual method: Asset-specific disposal logic
   * Subclasses can override for custom cleanup
   */
  protected onDispose(): void {
    // Default: no special disposal needed
  }

  /**
   * Virtual method: Asset-specific validation logic
   * Subclasses can override for custom validation
   */
  protected onValidate(): boolean {
    // Default: data exists and is not null/undefined
    return this._data != null;
  }
}

/**
 * Image Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export class ImageAsset extends Asset {
  private imageElement: HTMLImageElement | null = null;

  constructor(metadata: IAssetMetadata) {
    super({
      ...metadata,
      type: AssetType.IMAGE,
      mimeType: metadata.mimeType || 'image/png'
    });
  }

  protected async onLoad(options?: IAssetLoadOptions): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Setup timeout with default options
      const loadOptions = options || { timeout: 30000, priority: 'normal' };
      const timeout = loadOptions.timeout || 30000;
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${this._metadata.path}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.imageElement = img;
        
        // Report progress
        if (options && options.onProgress) {
          options.onProgress(1.0);
        }
        
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${this._metadata.path}`));
      };

      // Start loading
      if (options && options.onProgress) {
        options.onProgress(0.0);
      }
      
      img.src = this._metadata.path;
    });
  }

  protected calculateSize(): number {
    if (this.imageElement) {
      // Estimate based on image dimensions and bit depth
      const width = this.imageElement.naturalWidth || this.imageElement.width;
      const height = this.imageElement.naturalHeight || this.imageElement.height;
      return width * height * 4; // Assuming RGBA
    }
    
    return super.calculateSize();
  }

  protected onDispose(): void {
    if (this.imageElement) {
      this.imageElement.src = '';
      this.imageElement = null;
    }
  }

  protected onValidate(): boolean {
    return super.onValidate() && 
           this.imageElement != null && 
           this.imageElement.complete &&
           this.imageElement.naturalWidth > 0;
  }

  public clone(): ImageAsset {
    return new ImageAsset(this._metadata);
  }

  // Image-specific methods (additional capabilities allowed by LSP)
  public getDimensions(): { width: number; height: number } {
    if (!this.imageElement) {
      throw new Error('Image must be loaded to get dimensions');
    }
    
    return {
      width: this.imageElement.naturalWidth || this.imageElement.width,
      height: this.imageElement.naturalHeight || this.imageElement.height
    };
  }

  public getImageElement(): HTMLImageElement {
    if (!this.imageElement) {
      throw new Error('Image must be loaded to get element');
    }
    
    return this.imageElement;
  }
}

/**
 * Audio Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export class AudioAsset extends Asset {
  private audioElement: HTMLAudioElement | null = null;

  constructor(metadata: IAssetMetadata) {
    super({
      ...metadata,
      type: AssetType.AUDIO,
      mimeType: metadata.mimeType || 'audio/mpeg'
    });
  }

  protected async onLoad(options?: IAssetLoadOptions): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      // Setup timeout with default options
      const loadOptions = options || { timeout: 60000, priority: 'normal' };
      const timeout = loadOptions.timeout || 60000; // Audio files can be larger
      const timeoutId = setTimeout(() => {
        reject(new Error(`Audio load timeout: ${this._metadata.path}`));
      }, timeout);

      const onCanPlayThrough = () => {
        clearTimeout(timeoutId);
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        
        this.audioElement = audio;
        
        if (options && options.onProgress) {
          options.onProgress(1.0);
        }
        
        resolve(audio);
      };

      const onError = () => {
        clearTimeout(timeoutId);
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        audio.removeEventListener('error', onError);
        reject(new Error(`Failed to load audio: ${this._metadata.path}`));
      };

      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onError);

      // Progress tracking for audio is limited in browsers
      if (options && options.onProgress) {
        options.onProgress(0.0);
        audio.addEventListener('progress', () => {
          if (audio.buffered.length > 0) {
            const progress = audio.buffered.end(0) / audio.duration;
            if (options && options.onProgress) {
              options.onProgress(Math.min(progress, 0.9)); // Don't report 100% until canplaythrough
            }
          }
        });
      }

      // Start loading
      audio.src = this._metadata.path;
      audio.load();
    });
  }

  protected calculateSize(): number {
    if (this.audioElement && this.audioElement.duration) {
      // Estimate based on duration and bit rate (rough estimate)
      const duration = this.audioElement.duration;
      const estimatedBitrate = 128000; // 128 kbps default estimate
      return Math.floor((duration * estimatedBitrate) / 8);
    }
    
    return super.calculateSize();
  }

  protected onDispose(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
  }

  protected onValidate(): boolean {
    return super.onValidate() && 
           this.audioElement != null && 
           this.audioElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
  }

  public clone(): AudioAsset {
    return new AudioAsset(this._metadata);
  }

  // Audio-specific methods (additional capabilities allowed by LSP)
  public getDuration(): number {
    if (!this.audioElement) {
      throw new Error('Audio must be loaded to get duration');
    }
    
    return this.audioElement.duration;
  }

  public getAudioElement(): HTMLAudioElement {
    if (!this.audioElement) {
      throw new Error('Audio must be loaded to get element');
    }
    
    return this.audioElement;
  }

  public async play(): Promise<void> {
    if (!this.audioElement) {
      throw new Error('Audio must be loaded to play');
    }
    
    return this.audioElement.play();
  }

  public pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }
}

/**
 * JSON Data Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export class JSONAsset extends Asset {
  constructor(metadata: IAssetMetadata) {
    super({
      ...metadata,
      type: AssetType.JSON,
      mimeType: metadata.mimeType || 'application/json'
    });
  }

  protected async onLoad(options?: IAssetLoadOptions): Promise<any> {
    // Setup timeout with default options
    const loadOptions = options || { timeout: 10000, priority: 'normal' };
    const timeout = loadOptions.timeout || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Report progress
      if (options && options.onProgress) {
        options.onProgress(0.0);
      }

      const response = await fetch(this._metadata.path, {
        signal: controller.signal,
        headers: options && options.headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (options && options.onProgress) {
        options.onProgress(0.5);
      }

      const jsonData = await response.json();

      if (options && options.onProgress) {
        options.onProgress(1.0);
      }

      return jsonData;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected onValidate(): boolean {
    try {
      // Validate that data is valid JSON by attempting to stringify it
      JSON.stringify(this._data);
      return super.onValidate();
    } catch {
      return false;
    }
  }

  public clone(): JSONAsset {
    return new JSONAsset(this._metadata);
  }

  // JSON-specific methods (additional capabilities allowed by LSP)
  public query(path: string): any {
    if (!this.isLoaded()) {
      throw new Error('JSON asset must be loaded to query');
    }

    // Simple dot notation path traversal
    const parts = path.split('.');
    let current = this._data;

    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  public getKeys(): string[] {
    if (!this.isLoaded()) {
      throw new Error('JSON asset must be loaded to get keys');
    }

    if (typeof this._data !== 'object' || this._data === null) {
      return [];
    }

    return Object.keys(this._data);
  }
}

/**
 * Text Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export class TextAsset extends Asset {
  constructor(metadata: IAssetMetadata) {
    super({
      ...metadata,
      type: AssetType.TEXT,
      mimeType: metadata.mimeType || 'text/plain'
    });
  }

  protected async onLoad(options?: IAssetLoadOptions): Promise<string> {
    // Setup timeout with default options
    const loadOptions = options || { timeout: 10000, priority: 'normal' };
    const timeout = loadOptions.timeout || 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      if (options && options.onProgress) {
        options.onProgress(0.0);
      }

      const response = await fetch(this._metadata.path, {
        signal: controller.signal,
        headers: options && options.headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (options && options.onProgress) {
        options.onProgress(0.5);
      }

      const textData = await response.text();

      if (options && options.onProgress) {
        options.onProgress(1.0);
      }

      return textData;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected calculateSize(): number {
    if (typeof this._data === 'string') {
      return new Blob([this._data]).size;
    }
    
    return super.calculateSize();
  }

  protected onValidate(): boolean {
    return super.onValidate() && typeof this._data === 'string';
  }

  public clone(): TextAsset {
    return new TextAsset(this._metadata);
  }

  // Text-specific methods (additional capabilities allowed by LSP)
  public getLineCount(): number {
    if (!this.isLoaded()) {
      throw new Error('Text asset must be loaded to get line count');
    }

    return this._data.split('\n').length;
  }

  public getLines(): string[] {
    if (!this.isLoaded()) {
      throw new Error('Text asset must be loaded to get lines');
    }

    return this._data.split('\n');
  }

  public search(pattern: string | RegExp): number[] {
    if (!this.isLoaded()) {
      throw new Error('Text asset must be loaded to search');
    }

    const lines = this.getLines();
    const matches: number[] = [];
    
    lines.forEach((line, index) => {
      if (typeof pattern === 'string') {
        if (line.includes(pattern)) {
          matches.push(index);
        }
      } else {
        if (pattern.test(line)) {
          matches.push(index);
        }
      }
    });

    return matches;
  }
}
