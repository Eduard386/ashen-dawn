import { GameDataService } from '../services/GameDataService.js';
/**
 * Simplified Legacy Bridge - Minimal compatibility layer
 * Most functionality moved directly to TypeScript services
 */
export declare class LegacyBridge {
    private static instance;
    private gameDataService;
    private constructor();
    static getInstance(): LegacyBridge;
    /**
     * Essential initialization only
     */
    initialize(legacyGameData?: any): void;
    /**
     * Core data access
     */
    getGameData(): any;
    setGameData(legacyData: any): void;
    /**
     * Basic service access for testing
     */
    getServices(): {
        gameData: GameDataService;
    };
    /**
     * Status check
     */
    isInitialized(): boolean;
    /**
     * Reset for testing
     */
    resetGame(): void;
}
