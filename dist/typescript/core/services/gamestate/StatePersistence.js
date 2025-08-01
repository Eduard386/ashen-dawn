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
export class StatePersistence {
    constructor(storageKey) {
        this.storageKey = 'gameData';
        this.backupKey = 'gameDataBackup';
        this.compressionEnabled = false;
        if (storageKey) {
            this.storageKey = storageKey;
        }
    }
    /**
     * Save game data to localStorage
     */
    saveGameData(gameData) {
        try {
            if (!gameData) {
                console.error('Cannot save: no game data provided');
                return false;
            }
            // Create backup of current save before overwriting
            this.createBackup();
            // Serialize and save
            const serializedData = this.serializeData(gameData);
            localStorage.setItem(this.storageKey, serializedData);
            console.log('Game data saved successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }
    /**
     * Load game data from localStorage
     */
    loadGameData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                console.log('No saved game data found');
                return null;
            }
            const gameData = this.deserializeData(savedData);
            console.log('Game data loaded successfully');
            return gameData;
        }
        catch (error) {
            console.error('Failed to load game data:', error);
            // Try to load from backup
            return this.loadBackup();
        }
    }
    /**
     * Check if save data exists
     */
    hasSaveData() {
        return localStorage.getItem(this.storageKey) !== null;
    }
    /**
     * Delete save data
     */
    deleteSaveData() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Save data deleted successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to delete save data:', error);
            return false;
        }
    }
    /**
     * Create backup of current save data
     */
    createBackup() {
        try {
            const currentData = localStorage.getItem(this.storageKey);
            if (currentData) {
                localStorage.setItem(this.backupKey, currentData);
                console.log('Backup created successfully');
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Failed to create backup:', error);
            return false;
        }
    }
    /**
     * Load backup data
     */
    loadBackup() {
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (!backupData) {
                console.log('No backup data found');
                return null;
            }
            const gameData = this.deserializeData(backupData);
            console.log('Backup data loaded successfully');
            return gameData;
        }
        catch (error) {
            console.error('Failed to load backup data:', error);
            return null;
        }
    }
    /**
     * Restore from backup
     */
    restoreFromBackup() {
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (!backupData) {
                console.error('No backup data available for restore');
                return false;
            }
            localStorage.setItem(this.storageKey, backupData);
            console.log('Game restored from backup successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to restore from backup:', error);
            return false;
        }
    }
    /**
     * Get save data size information
     */
    getSaveDataInfo() {
        const saveData = localStorage.getItem(this.storageKey);
        const backupData = localStorage.getItem(this.backupKey);
        return {
            exists: saveData !== null,
            size: saveData ? saveData.length : 0,
            backupExists: backupData !== null,
            backupSize: backupData ? backupData.length : 0,
            lastModified: this.getLastModified()
        };
    }
    /**
     * Export save data as downloadable file
     */
    exportSaveData() {
        try {
            const saveData = localStorage.getItem(this.storageKey);
            if (!saveData) {
                console.error('No save data to export');
                return null;
            }
            return saveData;
        }
        catch (error) {
            console.error('Failed to export save data:', error);
            return null;
        }
    }
    /**
     * Import save data from file content
     */
    importSaveData(fileContent) {
        try {
            // Validate the imported data
            const gameData = this.deserializeData(fileContent);
            if (!gameData) {
                console.error('Invalid save data format');
                return false;
            }
            // Create backup before importing
            this.createBackup();
            // Import the data
            localStorage.setItem(this.storageKey, fileContent);
            console.log('Save data imported successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }
    /**
     * Clear all storage data (save and backup)
     */
    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            console.log('All save data cleared');
            return true;
        }
        catch (error) {
            console.error('Failed to clear all data:', error);
            return false;
        }
    }
    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        const saveData = localStorage.getItem(this.storageKey);
        const backupData = localStorage.getItem(this.backupKey);
        return {
            totalSize: (saveData?.length || 0) + (backupData?.length || 0),
            saveDataSize: saveData?.length || 0,
            backupSize: backupData?.length || 0,
            compressionEnabled: this.compressionEnabled,
            storageKey: this.storageKey
        };
    }
    /**
     * Enable or disable compression (placeholder for future implementation)
     */
    setCompression(enabled) {
        this.compressionEnabled = enabled;
    }
    // Private helper methods
    /**
     * Serialize data to string
     */
    serializeData(data) {
        if (this.compressionEnabled) {
            // Future: implement compression
            return JSON.stringify(data);
        }
        return JSON.stringify(data);
    }
    /**
     * Deserialize data from string
     */
    deserializeData(serializedData) {
        if (this.compressionEnabled) {
            // Future: implement decompression
            return JSON.parse(serializedData);
        }
        return JSON.parse(serializedData);
    }
    /**
     * Get last modified timestamp (approximation)
     */
    getLastModified() {
        try {
            // localStorage doesn't provide modification times
            // This is a placeholder for future enhancement
            return new Date();
        }
        catch {
            return null;
        }
    }
    /**
     * Validate save data structure
     */
    validateSaveData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        // Basic validation - could be expanded
        const requiredFields = ['health', 'experience', 'skills'];
        return requiredFields.every(field => data.hasOwnProperty(field));
    }
}
//# sourceMappingURL=StatePersistence.js.map