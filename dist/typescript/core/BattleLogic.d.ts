import { LegacyBridge } from '../core/bridges/LegacyBridge.js';
/**
 * Battle Logic - Core battle mechanics separated from Phaser UI
 * This allows testing battle functionality without UI dependencies
 */
export declare class BattleLogic {
    private bridge;
    private currentEnemies;
    private selectedEnemyIndex;
    private playerTurn;
    private combatLog;
    private weaponCooldowns;
    constructor();
    /**
     * Initialize battle with enemy type
     */
    initializeBattle(enemyType: string): void;
    /**
     * Get current battle state
     */
    getBattleState(): {
        enemies: any[];
        selectedEnemyIndex: number;
        playerTurn: boolean;
        combatLog: string[];
        playerHealth: number;
        playerMaxHealth: number;
        currentWeapon: string;
    };
    private spawnEnemies;
    private startCombat;
    selectEnemy(index: number): boolean;
    switchWeapon(weaponName: string): boolean;
    performAttack(): {
        success: boolean;
        defeated: boolean;
        victory: boolean;
    };
    private processAttackResult;
    private handleEnemyDefeated;
    private selectNextAliveEnemy;
    private endPlayerTurn;
    /**
     * Manually trigger enemy turns (useful for testing)
     */
    triggerEnemyTurns(): void;
    private performEnemyTurns;
    useItem(itemType: string): boolean;
    attemptRetreat(): boolean;
    private handleVictory;
    private handleDefeat;
    private addToCombatLog;
    getBridge(): LegacyBridge;
}
