import { GameDataService } from './services/GameDataService.js';
/**
 * Simplified Battle Logic - Direct integration with services
 */
export class BattleLogic {
    constructor() {
        this.currentEnemies = [];
        this.selectedEnemyIndex = 0;
        this.playerTurn = true;
        this.combatLog = [];
        this.gameDataService = GameDataService.getInstance();
    }
    initializeBattle(enemyType) {
        console.log('🚀 Simplified Battle Logic initialized');
        if (!this.gameDataService.isInitialized()) {
            this.gameDataService.init();
        }
        this.currentEnemies = [{
                name: enemyType,
                currentHealth: 20,
                maxHealth: 20,
                defence: { health: 20, ac: 5, threshold: 0, resistance: 0 },
                attack: { hit_chance: 50, damage: { min: 2, max: 5 }, shots: 1 }
            }];
        this.selectedEnemyIndex = 0;
        this.playerTurn = true;
        this.combatLog = ['Battle started!'];
    }
    getBattleState() {
        const gameData = this.gameDataService.get();
        return {
            enemies: [...this.currentEnemies],
            selectedEnemyIndex: this.selectedEnemyIndex,
            playerTurn: this.playerTurn,
            combatLog: [...this.combatLog],
            playerHealth: gameData?.health || 100,
            playerMaxHealth: gameData?.health || 100,
            currentWeapon: gameData?.current_weapon || 'baseball_bat'
        };
    }
    selectEnemy(index) {
        if (index >= 0 && index < this.currentEnemies.length) {
            this.selectedEnemyIndex = index;
            return true;
        }
        return false;
    }
    switchWeapon(weaponName) {
        const gameData = this.gameDataService.get();
        if (gameData) {
            gameData.current_weapon = weaponName.toLowerCase().replace(/\s+/g, '_');
            this.gameDataService.set(gameData);
            return true;
        }
        return false;
    }
    performAttack() {
        if (!this.playerTurn || this.currentEnemies.length === 0) {
            return { success: false, defeated: false, victory: false };
        }
        const target = this.currentEnemies[this.selectedEnemyIndex];
        if (!target || target.currentHealth <= 0) {
            return { success: false, defeated: false, victory: false };
        }
        const hitChance = Math.random() * 100;
        if (hitChance < 70) {
            const damage = Math.floor(Math.random() * 10) + 5;
            target.currentHealth -= damage;
            this.combatLog.push(`Hit ${target.name} for ${damage} damage!`);
            if (target.currentHealth <= 0) {
                target.currentHealth = 0;
                this.combatLog.push(`${target.name} defeated!`);
                this.currentEnemies.splice(this.selectedEnemyIndex, 1);
                return {
                    success: true,
                    defeated: true,
                    victory: this.currentEnemies.length === 0
                };
            }
        }
        else {
            this.combatLog.push(`Missed ${target.name}!`);
        }
        this.playerTurn = false;
        return { success: true, defeated: false, victory: false };
    }
    triggerEnemyTurns() {
        // Enemy turn logic
        this.playerTurn = true;
    }
    useItem(itemType) {
        const gameData = this.gameDataService.get();
        if (!gameData?.med?.[itemType] || gameData.med[itemType] <= 0) {
            return false;
        }
        gameData.med[itemType]--;
        if (itemType === 'first_aid_kit') {
            const healing = Math.floor(Math.random() * 11) + 10;
            gameData.health = Math.min(gameData.health + healing, 100);
            this.combatLog.push(`Used First Aid Kit, healed ${healing} HP`);
        }
        this.gameDataService.set(gameData);
        return true;
    }
    attemptRetreat() {
        const retreatChance = Math.random() * 100;
        if (retreatChance < 80) {
            this.combatLog.push('Successfully retreated from battle!');
            return true;
        }
        else {
            this.combatLog.push('Failed to retreat!');
            return false;
        }
    }
    // Compatibility methods for tests
    getBridge() {
        return {
            isInitialized: () => this.gameDataService.isInitialized(),
            getServices: () => ({ gameData: this.gameDataService })
        };
    }
    getServices() {
        return {
            gameData: this.gameDataService
        };
    }
}
//# sourceMappingURL=BattleLogic.js.map