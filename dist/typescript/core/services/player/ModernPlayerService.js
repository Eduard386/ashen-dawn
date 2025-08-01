import { PlayerDataManager } from './PlayerDataManager.js';
import { HealthManager } from './HealthManager.js';
import { ExperienceManager } from './ExperienceManager.js';
import { EquipmentManager } from './EquipmentManager.js';
import { LegacyPlayerConverter } from './LegacyPlayerConverter.js';
/**
 * Modern Player Service - Orchestrates player-related managers
 * Uses composition and delegation to separate concerns following SRP
 */
export class ModernPlayerService {
    constructor() {
        this.healthManager = null;
        this.experienceManager = null;
        this.equipmentManager = null;
        this.dataManager = new PlayerDataManager();
        this.legacyConverter = new LegacyPlayerConverter();
    }
    static getInstance() {
        if (!ModernPlayerService.instance) {
            ModernPlayerService.instance = new ModernPlayerService();
        }
        return ModernPlayerService.instance;
    }
    /**
     * Initialize player from legacy data
     */
    initializeFromLegacy(legacyData) {
        const data = legacyData || this.legacyConverter.getDefaultLegacyData();
        const playerData = this.legacyConverter.convertFromLegacy(data);
        // Initialize data manager
        this.dataManager.initializePlayer(playerData);
        // Initialize specialized managers with player data
        this.healthManager = new HealthManager(playerData);
        this.experienceManager = new ExperienceManager(playerData);
        this.equipmentManager = new EquipmentManager(playerData);
        return playerData;
    }
    /**
     * Get current player data
     */
    getPlayer() {
        return this.dataManager.getPlayerData();
    }
    /**
     * Get health manager
     */
    getHealthManager() {
        if (!this.healthManager) {
            throw new Error('Player not initialized');
        }
        return this.healthManager;
    }
    /**
     * Get experience manager
     */
    getExperienceManager() {
        if (!this.experienceManager) {
            throw new Error('Player not initialized');
        }
        return this.experienceManager;
    }
    /**
     * Get equipment manager
     */
    getEquipmentManager() {
        if (!this.equipmentManager) {
            throw new Error('Player not initialized');
        }
        return this.equipmentManager;
    }
    /**
     * Get legacy converter
     */
    getLegacyConverter() {
        return this.legacyConverter;
    }
    // Convenience methods that delegate to appropriate managers
    /**
     * Update player health (delegates to HealthManager)
     */
    updateHealth(newHealth) {
        this.getHealthManager().updateHealth(newHealth);
    }
    /**
     * Add experience (delegates to ExperienceManager)
     */
    addExperience(experience) {
        const leveledUp = this.getExperienceManager().addExperience(experience);
        // If leveled up, update max health
        if (leveledUp) {
            this.getHealthManager().updateMaxHealth(this.getExperienceManager().getCurrentLevel());
        }
        return leveledUp;
    }
    /**
     * Use medical item (delegates to HealthManager)
     */
    useMedicalItem(itemType) {
        return this.getHealthManager().useMedicalItem(itemType);
    }
    /**
     * Switch weapon (delegates to EquipmentManager)
     */
    switchWeapon(weaponName) {
        return this.getEquipmentManager().switchWeapon(weaponName);
    }
    /**
     * Add weapon (delegates to EquipmentManager)
     */
    addWeapon(weaponName) {
        this.getEquipmentManager().addWeapon(weaponName);
    }
    /**
     * Add ammo to inventory
     */
    addAmmo(ammoType, amount) {
        const player = this.getPlayer();
        if (!player)
            return;
        player.inventory.ammo[ammoType] += amount;
    }
    /**
     * Use ammo from inventory
     */
    useAmmo(ammoType, amount) {
        const player = this.getPlayer();
        if (!player || player.inventory.ammo[ammoType] < amount) {
            return false;
        }
        player.inventory.ammo[ammoType] -= amount;
        return true;
    }
    /**
     * Convert to legacy format for saving/compatibility
     */
    toLegacyFormat() {
        const player = this.getPlayer();
        if (!player)
            return null;
        return this.legacyConverter.convertToLegacy(player);
    }
    /**
     * Check if player is initialized
     */
    isInitialized() {
        return this.dataManager.isInitialized();
    }
    /**
     * Reset player service
     */
    reset() {
        this.dataManager.resetPlayerData();
        this.healthManager = null;
        this.experienceManager = null;
        this.equipmentManager = null;
    }
    /**
     * Get comprehensive player status
     */
    getPlayerStatus() {
        if (!this.isInitialized())
            return null;
        const healthMgr = this.getHealthManager();
        const expMgr = this.getExperienceManager();
        const equipMgr = this.getEquipmentManager();
        return {
            isAlive: !healthMgr.isDead(),
            health: healthMgr.getHealth(),
            maxHealth: healthMgr.getMaxHealth(),
            level: expMgr.getCurrentLevel(),
            experience: expMgr.getExperience(),
            experienceToNext: expMgr.getExperienceToNextLevel(),
            currentWeapon: equipMgr.getCurrentWeapon(),
            currentArmor: equipMgr.getCurrentArmor()
        };
    }
}
//# sourceMappingURL=ModernPlayerService.js.map