/**
 * LSP-Compliant Asset System
 * Demonstrates Liskov Substitution Principle with polymorphic assets
 */
/**
 * Asset Status Enumeration
 */
export var AssetStatus;
(function (AssetStatus) {
    AssetStatus["UNLOADED"] = "unloaded";
    AssetStatus["LOADING"] = "loading";
    AssetStatus["LOADED"] = "loaded";
    AssetStatus["ERROR"] = "error";
    AssetStatus["DISPOSED"] = "disposed";
})(AssetStatus || (AssetStatus = {}));
/**
 * Asset Type Enumeration
 */
export var AssetType;
(function (AssetType) {
    AssetType["IMAGE"] = "image";
    AssetType["AUDIO"] = "audio";
    AssetType["VIDEO"] = "video";
    AssetType["JSON"] = "json";
    AssetType["TEXT"] = "text";
    AssetType["BINARY"] = "binary";
})(AssetType || (AssetType = {}));
/**
 * Abstract Base Asset Class
 *
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Loading behavior must honor the same preconditions and postconditions
 * - Size calculation must be consistent across implementations
 */
export class Asset {
    constructor(metadata) {
        this._status = AssetStatus.UNLOADED;
        this._data = null;
        this._loadResult = null;
        this._loadStartTime = 0;
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
    async load(options = {}) {
        // Honor precondition
        if (this._status === AssetStatus.DISPOSED) {
            throw new Error('Cannot load disposed asset');
        }
        // Idempotent behavior
        if (this._status === AssetStatus.LOADED && !(options && options.forceReload)) {
            return this._loadResult;
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
        }
        catch (error) {
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
    isLoaded() {
        return this._status === AssetStatus.LOADED;
    }
    /**
     * Get asset size in bytes
     *
     * LSP Contract:
     * - Postcondition: returns non-negative number
     * - Pure function: no side effects for loaded assets
     */
    getSize() {
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
    getMetadata() {
        return { ...this._metadata };
    }
    /**
     * Get current asset status
     *
     * LSP Contract:
     * - Postcondition: returns current AssetStatus
     * - Pure function: no side effects
     */
    getStatus() {
        return this._status;
    }
    /**
     * Get asset data (if loaded)
     *
     * LSP Contract:
     * - Precondition: asset must be loaded
     * - Postcondition: returns asset data or throws error
     */
    getData() {
        if (this._status !== AssetStatus.LOADED) {
            throw new Error('Asset must be loaded before accessing data');
        }
        return this._data;
    }
    /**
     * Get load result information
     *
     * LSP Contract:
     * - Postcondition: returns load result if load was attempted, null otherwise
     * - Pure function: no side effects
     */
    getLoadResult() {
        return this._loadResult;
    }
    /**
     * Dispose the asset and free resources
     *
     * LSP Contract:
     * - Postcondition: status is DISPOSED, data is cleared
     * - Must be idempotent: multiple calls should not cause issues
     */
    dispose() {
        if (this._status === AssetStatus.DISPOSED) {
            return; // Idempotent behavior
        }
        // Template method: subclasses can implement specific disposal logic
        this.onDispose();
        this._data = null;
        this._status = AssetStatus.DISPOSED;
    }
    /**
     * Validate asset data integrity
     *
     * LSP Contract:
     * - Precondition: asset must be loaded
     * - Postcondition: returns true if data is valid, false otherwise
     */
    validate() {
        if (this._status !== AssetStatus.LOADED) {
            return false;
        }
        return this.onValidate();
    }
    /**
     * Virtual method: Calculate actual asset size
     * Subclasses should override for accurate size calculation
     */
    calculateSize() {
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
    onDispose() {
        // Default: no special disposal needed
    }
    /**
     * Virtual method: Asset-specific validation logic
     * Subclasses can override for custom validation
     */
    onValidate() {
        // Default: data exists and is not null/undefined
        return this._data != null;
    }
}
/**
 * Image Asset Implementation
 * Must maintain LSP compliance with Asset base class
 */
export class ImageAsset extends Asset {
    constructor(metadata) {
        super({
            ...metadata,
            type: AssetType.IMAGE,
            mimeType: metadata.mimeType || 'image/png'
        });
        this.imageElement = null;
    }
    async onLoad(options) {
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
    calculateSize() {
        if (this.imageElement) {
            // Estimate based on image dimensions and bit depth
            const width = this.imageElement.naturalWidth || this.imageElement.width;
            const height = this.imageElement.naturalHeight || this.imageElement.height;
            return width * height * 4; // Assuming RGBA
        }
        return super.calculateSize();
    }
    onDispose() {
        if (this.imageElement) {
            this.imageElement.src = '';
            this.imageElement = null;
        }
    }
    onValidate() {
        return super.onValidate() &&
            this.imageElement != null &&
            this.imageElement.complete &&
            this.imageElement.naturalWidth > 0;
    }
    clone() {
        return new ImageAsset(this._metadata);
    }
    // Image-specific methods (additional capabilities allowed by LSP)
    getDimensions() {
        if (!this.imageElement) {
            throw new Error('Image must be loaded to get dimensions');
        }
        return {
            width: this.imageElement.naturalWidth || this.imageElement.width,
            height: this.imageElement.naturalHeight || this.imageElement.height
        };
    }
    getImageElement() {
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
    constructor(metadata) {
        super({
            ...metadata,
            type: AssetType.AUDIO,
            mimeType: metadata.mimeType || 'audio/mpeg'
        });
        this.audioElement = null;
    }
    async onLoad(options) {
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
    calculateSize() {
        if (this.audioElement && this.audioElement.duration) {
            // Estimate based on duration and bit rate (rough estimate)
            const duration = this.audioElement.duration;
            const estimatedBitrate = 128000; // 128 kbps default estimate
            return Math.floor((duration * estimatedBitrate) / 8);
        }
        return super.calculateSize();
    }
    onDispose() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
            this.audioElement = null;
        }
    }
    onValidate() {
        return super.onValidate() &&
            this.audioElement != null &&
            this.audioElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
    }
    clone() {
        return new AudioAsset(this._metadata);
    }
    // Audio-specific methods (additional capabilities allowed by LSP)
    getDuration() {
        if (!this.audioElement) {
            throw new Error('Audio must be loaded to get duration');
        }
        return this.audioElement.duration;
    }
    getAudioElement() {
        if (!this.audioElement) {
            throw new Error('Audio must be loaded to get element');
        }
        return this.audioElement;
    }
    async play() {
        if (!this.audioElement) {
            throw new Error('Audio must be loaded to play');
        }
        return this.audioElement.play();
    }
    pause() {
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
    constructor(metadata) {
        super({
            ...metadata,
            type: AssetType.JSON,
            mimeType: metadata.mimeType || 'application/json'
        });
    }
    async onLoad(options) {
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
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    onValidate() {
        try {
            // Validate that data is valid JSON by attempting to stringify it
            JSON.stringify(this._data);
            return super.onValidate();
        }
        catch {
            return false;
        }
    }
    clone() {
        return new JSONAsset(this._metadata);
    }
    // JSON-specific methods (additional capabilities allowed by LSP)
    query(path) {
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
    getKeys() {
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
    constructor(metadata) {
        super({
            ...metadata,
            type: AssetType.TEXT,
            mimeType: metadata.mimeType || 'text/plain'
        });
    }
    async onLoad(options) {
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
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    calculateSize() {
        if (typeof this._data === 'string') {
            return new Blob([this._data]).size;
        }
        return super.calculateSize();
    }
    onValidate() {
        return super.onValidate() && typeof this._data === 'string';
    }
    clone() {
        return new TextAsset(this._metadata);
    }
    // Text-specific methods (additional capabilities allowed by LSP)
    getLineCount() {
        if (!this.isLoaded()) {
            throw new Error('Text asset must be loaded to get line count');
        }
        return this._data.split('\n').length;
    }
    getLines() {
        if (!this.isLoaded()) {
            throw new Error('Text asset must be loaded to get lines');
        }
        return this._data.split('\n');
    }
    search(pattern) {
        if (!this.isLoaded()) {
            throw new Error('Text asset must be loaded to search');
        }
        const lines = this.getLines();
        const matches = [];
        lines.forEach((line, index) => {
            if (typeof pattern === 'string') {
                if (line.includes(pattern)) {
                    matches.push(index);
                }
            }
            else {
                if (pattern.test(line)) {
                    matches.push(index);
                }
            }
        });
        return matches;
    }
}
//# sourceMappingURL=LSPAssetSystem.js.map