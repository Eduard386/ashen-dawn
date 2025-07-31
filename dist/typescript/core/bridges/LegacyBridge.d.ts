import { GameStateService } from '../services/GameStateService.js';
/**
 * Legacy Bridge - Provides compatibility layer between legacy JS code and TypeScript services
 * This allows gradual migration without breaking existing functionality
 */
export declare class LegacyBridge {
    private static instance;
    private gameState;
    private constructor();
    static getInstance(): LegacyBridge;
    /**
     * Initialize the bridge with legacy GameData
     */
    initialize(legacyGameData?: any): void;
    /**
     * Legacy GameData compatibility - returns data in original format
     */
    getGameData(): any;
    /**
     * Legacy GameData compatibility - updates from original format
     */
    setGameData(legacyData: any): void;
    /**
     * Legacy save/load compatibility
     */
    saveGame(): void;
    loadGame(): boolean;
    /**
     * Player health management (legacy compatible)
     */
    updatePlayerHealth(newHealth: number): void;
    getPlayerHealth(): number;
    getPlayerMaxHealth(): number;
    /**
     * Experience and leveling (legacy compatible)
     */
    addExperience(exp: number): boolean;
    getPlayerExperience(): number;
    getPlayerLevel(): number;
    /**
     * Weapon management (legacy compatible)
     */
    getCurrentWeapon(): string;
    switchWeapon(weaponName: string): boolean;
    addWeapon(weaponName: string): void;
    getPlayerWeapons(): string[];
    /**
     * Ammo management (legacy compatible)
     */
    getAmmo(ammoType: string): number;
    addAmmo(ammoType: string, amount: number): void;
    useAmmo(ammoType: string, amount: number): boolean;
    /**
     * Medical items (legacy compatible)
     */
    getMedicalItem(itemType: string): number;
    useMedicalItem(itemType: string): boolean;
    /**
     * Combat system (enhanced with TypeScript services)
     */
    calculatePlayerAttack(weaponName: string, enemyData: any): any;
    calculateEnemyAttack(enemyData: any): any;
    /**
     * Enemy management
     */
    spawnEnemyGroup(enemyName: string): any[];
    /**
     * Scene management
     */
    setCurrentScene(sceneName: string): void;
    getCurrentScene(): string;
    /**
     * Check if TypeScript services are initialized
     */
    isInitialized(): boolean;
    /**
     * Reset game to defaults
     */
    resetGame(): void;
    /**
     * Force reset for testing (doesn't reinitialize)
     */
    forceReset(): void;
    /**
     * Get all services for advanced usage
     */
    getServices(): {
        gameState: GameStateService;
        player: import("../services/PlayerService.js").PlayerService;
        weapon: import("../services/WeaponService.js").WeaponService;
        enemy: import("../services/EnemyService.js").EnemyService;
        combat: import("../services/CombatService.js").CombatService;
    };
}
