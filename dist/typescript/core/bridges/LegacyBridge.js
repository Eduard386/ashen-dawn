import { GameStateService } from '../services/GameStateService.js';
/**
 * Legacy Bridge - Provides compatibility layer between legacy JS code and TypeScript services
 * This allows gradual migration without breaking existing functionality
 */
export class LegacyBridge {
    constructor() {
        this.gameState = GameStateService.getInstance();
    }
    static getInstance() {
        if (!LegacyBridge.instance) {
            LegacyBridge.instance = new LegacyBridge();
        }
        return LegacyBridge.instance;
    }
    /**
     * Initialize the bridge with legacy GameData
     */
    initialize(legacyGameData) {
        this.gameState.initializeGame(legacyGameData);
        console.log('Legacy bridge initialized - TypeScript services active');
    }
    /**
     * Legacy GameData compatibility - returns data in original format
     */
    getGameData() {
        return this.gameState.getLegacyGameData();
    }
    /**
     * Legacy GameData compatibility - updates from original format
     */
    setGameData(legacyData) {
        this.gameState.updateFromLegacy(legacyData);
    }
    /**
     * Legacy save/load compatibility
     */
    saveGame() {
        this.gameState.saveGame();
    }
    loadGame() {
        return this.gameState.loadGame();
    }
    /**
     * Player health management (legacy compatible)
     */
    updatePlayerHealth(newHealth) {
        this.gameState.getPlayerService().updateHealth(newHealth);
    }
    getPlayerHealth() {
        const player = this.gameState.getPlayer();
        return player ? player.health : 0;
    }
    getPlayerMaxHealth() {
        const player = this.gameState.getPlayer();
        return player ? player.maxHealth : 0;
    }
    /**
     * Experience and leveling (legacy compatible)
     */
    addExperience(exp) {
        return this.gameState.getPlayerService().addExperience(exp);
    }
    getPlayerExperience() {
        const player = this.gameState.getPlayer();
        return player ? player.experience : 0;
    }
    getPlayerLevel() {
        const player = this.gameState.getPlayer();
        return player ? player.levelCount : 1;
    }
    /**
     * Weapon management (legacy compatible)
     */
    getCurrentWeapon() {
        const player = this.gameState.getPlayer();
        return player ? player.currentWeapon.replace('_', ' ') : 'Baseball bat';
    }
    switchWeapon(weaponName) {
        const standardizedName = weaponName.toLowerCase().replace(/\s+/g, '_');
        return this.gameState.getPlayerService().switchWeapon(standardizedName);
    }
    addWeapon(weaponName) {
        const standardizedName = weaponName.toLowerCase().replace(/\s+/g, '_');
        this.gameState.getPlayerService().addWeapon(standardizedName);
    }
    getPlayerWeapons() {
        const player = this.gameState.getPlayer();
        if (!player)
            return [];
        return player.weapons.map(weapon => weapon.replace('_', ' '));
    }
    /**
     * Ammo management (legacy compatible)
     */
    getAmmo(ammoType) {
        const player = this.gameState.getPlayer();
        if (!player)
            return 0;
        const standardizedType = ammoType.replace(/\s+/g, '_');
        return player.inventory.ammo[standardizedType] || 0;
    }
    addAmmo(ammoType, amount) {
        const standardizedType = ammoType.replace(/\s+/g, '_');
        this.gameState.getPlayerService().addAmmo(standardizedType, amount);
    }
    useAmmo(ammoType, amount) {
        const standardizedType = ammoType.replace(/\s+/g, '_');
        return this.gameState.getPlayerService().useAmmo(standardizedType, amount);
    }
    /**
     * Medical items (legacy compatible)
     */
    getMedicalItem(itemType) {
        const player = this.gameState.getPlayer();
        if (!player)
            return 0;
        const standardizedType = itemType.replace(/\s+/g, '_');
        return player.inventory.med[standardizedType] || 0;
    }
    useMedicalItem(itemType) {
        const standardizedType = itemType.replace(/\s+/g, '_');
        return this.gameState.getPlayerService().useMedicalItem(standardizedType);
    }
    /**
     * Combat system (enhanced with TypeScript services)
     */
    calculatePlayerAttack(weaponName, enemyData) {
        const player = this.gameState.getPlayer();
        const weapon = this.gameState.getWeaponService().getWeapon(weaponName.toLowerCase().replace(/\s+/g, '_'));
        if (!player || !weapon) {
            return { isHit: false, damage: 0, message: 'Invalid weapon or player' };
        }
        // Convert legacy enemy to TypeScript interface
        const enemy = this.gameState.getEnemyService().convertLegacyEnemy(enemyData);
        return this.gameState.getCombatService().calculatePlayerAttack(player, weapon, enemy);
    }
    calculateEnemyAttack(enemyData) {
        const player = this.gameState.getPlayer();
        if (!player) {
            return { isHit: false, damage: 0, message: 'No player data' };
        }
        const enemy = this.gameState.getEnemyService().convertLegacyEnemy(enemyData);
        return this.gameState.getCombatService().calculateEnemyAttack(enemy, player);
    }
    /**
     * Enemy management
     */
    spawnEnemyGroup(enemyName) {
        const enemies = this.gameState.getEnemyService().spawnEnemyGroup(enemyName);
        // Convert back to legacy format for compatibility
        return enemies.map(enemy => ({
            name: enemy.name,
            type: enemy.type,
            maxLevel: enemy.maxLevel,
            defence: {
                health: enemy.defence.health,
                ac: enemy.defence.armorClass,
                threshold: enemy.defence.damageThreshold,
                resistance: enemy.defence.damageResistance
            },
            attack: {
                hit_chance: enemy.attack.hitChance,
                weapon: enemy.attack.weapon,
                damage: enemy.attack.damage,
                shots: enemy.attack.shots
            },
            currentHealth: enemy.currentHealth,
            experience: enemy.experience,
            title: enemy.sprites
        }));
    }
    /**
     * Scene management
     */
    setCurrentScene(sceneName) {
        this.gameState.setCurrentScene(sceneName);
    }
    getCurrentScene() {
        return this.gameState.getCurrentScene();
    }
    /**
     * Check if TypeScript services are initialized
     */
    isInitialized() {
        return this.gameState.isInitialized();
    }
    /**
     * Reset game to defaults
     */
    resetGame() {
        this.gameState.resetGame();
    }
    /**
     * Force reset for testing (doesn't reinitialize)
     */
    forceReset() {
        this.gameState.forceReset();
    }
    /**
     * Get all services for advanced usage
     */
    getServices() {
        return {
            gameState: this.gameState,
            player: this.gameState.getPlayerService(),
            weapon: this.gameState.getWeaponService(),
            enemy: this.gameState.getEnemyService(),
            combat: this.gameState.getCombatService()
        };
    }
}
// Make available globally for legacy JavaScript compatibility
if (typeof window !== 'undefined') {
    window.LegacyBridge = LegacyBridge;
}
//# sourceMappingURL=LegacyBridge.js.map