import { GameDataService } from './services/GameDataService.js';
/**
 * Simplified Battle Logic - Direct integration with services
 */
export declare class BattleLogic {
    private gameDataService;
    private currentEnemies;
    private selectedEnemyIndex;
    private playerTurn;
    private combatLog;
    constructor();
    initializeBattle(enemyType: string): void;
    getBattleState(): {
        enemies: any[];
        selectedEnemyIndex: number;
        playerTurn: boolean;
        combatLog: string[];
        playerHealth: any;
        playerMaxHealth: any;
        currentWeapon: any;
    };
    selectEnemy(index: number): boolean;
    switchWeapon(weaponName: string): boolean;
    performAttack(): {
        success: boolean;
        defeated: boolean;
        victory: boolean;
    };
    triggerEnemyTurns(): void;
    useItem(itemType: string): boolean;
    attemptRetreat(): boolean;
    getBridge(): {
        isInitialized: () => boolean;
        getServices: () => {
            gameData: GameDataService;
        };
    };
    getServices(): {
        gameData: GameDataService;
    };
}
