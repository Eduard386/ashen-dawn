import { PlayerService } from './PlayerService.js';
import { WeaponService } from './WeaponService.js';
import { EnemyService } from './EnemyService.js';
import { CombatService } from './CombatService.js';
/**
 * Game State Service - Central state management
 * Coordinates between all other services and manages save/load
 */
export class GameStateService {
    constructor() {
        this.currentScene = 'MainMenu';
        this.gameInitialized = false;
        this.encounterData = null;
        this.playerService = PlayerService.getInstance();
        this.weaponService = WeaponService.getInstance();
        this.enemyService = EnemyService.getInstance();
        this.combatService = CombatService.getInstance();
    }
    static getInstance() {
        if (!GameStateService.instance) {
            GameStateService.instance = new GameStateService();
        }
        return GameStateService.instance;
    }
    /**
     * Initialize game from legacy GameData
     */
    initializeGame(legacyGameData) {
        if (this.gameInitialized) {
            console.warn('Game already initialized');
            return;
        }
        // Load from localStorage if no data provided
        const gameData = legacyGameData || this.loadGameData();
        // Initialize player
        this.playerService.initializeFromLegacy(gameData);
        this.gameInitialized = true;
        console.log('Game initialized with TypeScript services');
    }
    /**
     * Get current player
     */
    getPlayer() {
        return this.playerService.getPlayer();
    }
    /**
     * Get player service
     */
    getPlayerService() {
        return this.playerService;
    }
    /**
     * Get weapon service
     */
    getWeaponService() {
        return this.weaponService;
    }
    /**
     * Get enemy service
     */
    getEnemyService() {
        return this.enemyService;
    }
    /**
     * Get combat service
     */
    getCombatService() {
        return this.combatService;
    }
    /**
     * Save game state
     */
    saveGame() {
        const player = this.playerService.getPlayer();
        if (!player) {
            console.error('Cannot save game: no player data');
            return;
        }
        // Convert back to legacy format for compatibility
        const legacyData = this.playerService.toLegacyFormat();
        if (legacyData) {
            localStorage.setItem('gameData', JSON.stringify(legacyData));
            console.log('Game saved successfully');
        }
    }
    /**
     * Load game state
     */
    loadGame() {
        try {
            const savedData = this.loadGameData();
            if (savedData) {
                this.playerService.initializeFromLegacy(savedData);
                console.log('Game loaded successfully');
                return true;
            }
        }
        catch (error) {
            console.error('Failed to load game:', error);
        }
        return false;
    }
    /**
     * Reset game to default state
     */
    resetGame() {
        localStorage.removeItem('gameData');
        this.gameInitialized = false;
        // Reinitialize with default data
        this.initializeGame(this.getDefaultGameData());
        console.log('Game reset to default state');
    }
    /**
     * Force reset without reinitializing (for testing)
     */
    forceReset() {
        localStorage.removeItem('gameData');
        this.gameInitialized = false;
        this.playerService = PlayerService.getInstance();
    }
    /**
     * Check if game is initialized
     */
    isInitialized() {
        return this.gameInitialized;
    }
    /**
     * Set current scene
     */
    setCurrentScene(sceneName) {
        this.currentScene = sceneName;
    }
    /**
     * Get current scene
     */
    getCurrentScene() {
        return this.currentScene;
    }
    /**
     * Bridge method: Get legacy format for compatibility
     */
    getLegacyGameData() {
        return this.playerService.toLegacyFormat();
    }
    /**
     * Bridge method: Update from legacy format
     */
    updateFromLegacy(legacyData) {
        this.playerService.initializeFromLegacy(legacyData);
    }
    // Private helper methods
    loadGameData() {
        try {
            const savedData = localStorage.getItem('gameData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        }
        catch (error) {
            console.error('Failed to parse saved game data:', error);
        }
        // Return default data if no save found
        return this.getDefaultGameData();
    }
    getDefaultGameData() {
        return {
            levelCount: 1,
            health: 30,
            experience: 0,
            skills: {
                small_guns: 75,
                big_guns: 75,
                energy_weapons: 75,
                melee_weapons: 75,
                pyrotechnics: 75,
                lockpick: 75,
                science: 75,
                repair: 75,
                medicine: 75, // Fixed typo from legacy
                barter: 75,
                speech: 75,
                surviving: 75
            },
            current_weapon: 'Baseball bat',
            current_armor: 'Leather Jacket',
            weapons: ['Baseball bat', '9mm pistol'],
            med: {
                first_aid_kit: 0,
                jet: 0,
                buffout: 0,
                mentats: 0,
                psycho: 0
            },
            ammo: {
                mm_9: 500,
                magnum_44: 12,
                mm_12: 0,
                mm_5_45: 0,
                energy_cell: 0,
                frag_grenade: 0
            },
            enemiesToCreate: [],
            levelLoot: [],
            armorLoot: null
        };
    }
    /**
     * Set encounter data for battle transitions
     */
    setEncounterData(data) {
        this.encounterData = data;
    }
    /**
     * Get encounter data for battle transitions
     */
    getEncounterData() {
        return this.encounterData;
    }
    /**
     * Clear encounter data after battle
     */
    clearEncounterData() {
        this.encounterData = null;
    }
}
//# sourceMappingURL=GameStateService.js.map