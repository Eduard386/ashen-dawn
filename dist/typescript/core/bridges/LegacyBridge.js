import { GameDataService } from '../services/GameDataService.js';
/**
 * Simplified Legacy Bridge - Minimal compatibility layer
 * Most functionality moved directly to TypeScript services
 */
export class LegacyBridge {
    constructor() {
        this.gameDataService = GameDataService.getInstance();
    }
    static getInstance() {
        if (!LegacyBridge.instance) {
            LegacyBridge.instance = new LegacyBridge();
        }
        return LegacyBridge.instance;
    }
    /**
     * Essential initialization only
     */
    initialize(legacyGameData) {
        if (legacyGameData) {
            this.gameDataService.set(legacyGameData);
        }
        else {
            this.gameDataService.init();
        }
        console.log('🔗 Simplified Bridge - TypeScript services active');
    }
    /**
     * Core data access
     */
    getGameData() {
        return this.gameDataService.get();
    }
    setGameData(legacyData) {
        this.gameDataService.set(legacyData);
    }
    /**
     * Basic service access for testing
     */
    getServices() {
        return {
            gameData: this.gameDataService
        };
    }
    /**
     * Status check
     */
    isInitialized() {
        return this.gameDataService.isInitialized();
    }
    /**
     * Reset for testing
     */
    resetGame() {
        this.gameDataService.reset();
    }
}
// Global access for compatibility
if (typeof window !== 'undefined') {
    window.LegacyBridge = LegacyBridge;
}
//# sourceMappingURL=LegacyBridge.js.map