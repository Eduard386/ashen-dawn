/**
 * StatePersistence - Single Responsibility: Save/Load Game State
 *
 * Handles all game state persistence operations including localStorage management,
 * JSON serialization/deserialization, and backup/restore functionality.
 *
 * SRP Compliance:
 * ✅ Only handles data persistence and storage operations
 * ✅ Does not handle game logic or state validation
 * ✅ Focused purely on save/load operations and storage management
 */
export declare class StatePersistence {
    private readonly storageKey;
    private readonly backupKey;
    private compressionEnabled;
    constructor(storageKey?: string);
    /**
     * Save game data to localStorage
     */
    saveGameData(gameData: any): boolean;
    /**
     * Load game data from localStorage
     */
    loadGameData(): any | null;
    /**
     * Check if save data exists
     */
    hasSaveData(): boolean;
    /**
     * Delete save data
     */
    deleteSaveData(): boolean;
    /**
     * Create backup of current save data
     */
    createBackup(): boolean;
    /**
     * Load backup data
     */
    loadBackup(): any | null;
    /**
     * Restore from backup
     */
    restoreFromBackup(): boolean;
    /**
     * Get save data size information
     */
    getSaveDataInfo(): {
        exists: boolean;
        size: number;
        backupExists: boolean;
        backupSize: number;
        lastModified: Date | null;
    };
    /**
     * Export save data as downloadable file
     */
    exportSaveData(): string | null;
    /**
     * Import save data from file content
     */
    importSaveData(fileContent: string): boolean;
    /**
     * Clear all storage data (save and backup)
     */
    clearAllData(): boolean;
    /**
     * Get storage usage statistics
     */
    getStorageStats(): {
        totalSize: number;
        saveDataSize: number;
        backupSize: number;
        compressionEnabled: boolean;
        storageKey: string;
    };
    /**
     * Enable or disable compression (placeholder for future implementation)
     */
    setCompression(enabled: boolean): void;
    /**
     * Serialize data to string
     */
    private serializeData;
    /**
     * Deserialize data from string
     */
    private deserializeData;
    /**
     * Get last modified timestamp (approximation)
     */
    private getLastModified;
    /**
     * Validate save data structure
     */
    private validateSaveData;
}
