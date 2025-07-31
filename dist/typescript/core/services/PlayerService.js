/**
 * Player Service - Manages player character data and operations
 * Bridges between legacy JavaScript GameData and new TypeScript interfaces
 */
export class PlayerService {
    constructor() {
        this.playerData = null;
    }
    static getInstance() {
        if (!PlayerService.instance) {
            PlayerService.instance = new PlayerService();
        }
        return PlayerService.instance;
    }
    /**
     * Initialize player from legacy GameData format
     */
    initializeFromLegacy(legacyData) {
        // Convert legacy format to TypeScript interface
        const playerData = {
            id: crypto.randomUUID(),
            levelCount: legacyData.levelCount || 1,
            health: legacyData.health || 30,
            maxHealth: this.calculateMaxHealth(legacyData.levelCount || 1),
            experience: legacyData.experience || 0,
            skills: this.convertLegacySkills(legacyData.skills || {}),
            currentWeapon: this.convertWeaponName(legacyData.current_weapon || 'baseball_bat'),
            currentArmor: this.convertArmorName(legacyData.current_armor || 'leather_jacket'),
            weapons: (legacyData.weapons || []).map((weapon) => this.convertWeaponName(weapon)),
            inventory: this.convertLegacyInventory(legacyData)
        };
        this.playerData = playerData;
        return playerData;
    }
    /**
     * Get current player data
     */
    getPlayer() {
        return this.playerData;
    }
    /**
     * Update player health
     */
    updateHealth(newHealth) {
        if (this.playerData) {
            this.playerData.health = Math.max(0, Math.min(newHealth, this.playerData.maxHealth));
        }
    }
    /**
     * Add experience and handle level up
     */
    addExperience(experience) {
        if (!this.playerData)
            return false;
        this.playerData.experience += experience;
        const requiredExp = this.getRequiredExperience(this.playerData.levelCount);
        if (this.playerData.experience >= requiredExp) {
            this.levelUp();
            return true; // Level up occurred
        }
        return false;
    }
    /**
     * Use medical item
     */
    useMedicalItem(itemType) {
        if (!this.playerData || this.playerData.inventory.med[itemType] <= 0) {
            return false;
        }
        this.playerData.inventory.med[itemType]--;
        // Apply healing effects
        switch (itemType) {
            case 'first_aid_kit':
                this.updateHealth(this.playerData.health + 20);
                break;
            case 'jet':
                // Temporary boost (would need effect system)
                break;
            case 'buffout':
                // Temporary strength boost
                break;
            case 'mentats':
                // Temporary intelligence boost
                break;
            case 'psycho':
                // Temporary damage boost
                break;
        }
        return true;
    }
    /**
     * Add weapon to inventory
     */
    addWeapon(weaponName) {
        if (this.playerData && !this.playerData.weapons.includes(weaponName)) {
            this.playerData.weapons.push(weaponName);
        }
    }
    /**
     * Switch current weapon
     */
    switchWeapon(weaponName) {
        if (this.playerData && this.playerData.weapons.includes(weaponName)) {
            this.playerData.currentWeapon = weaponName;
            return true;
        }
        return false;
    }
    /**
     * Add ammo to inventory
     */
    addAmmo(ammoType, amount) {
        if (this.playerData) {
            this.playerData.inventory.ammo[ammoType] += amount;
        }
    }
    /**
     * Use ammo from inventory
     */
    useAmmo(ammoType, amount) {
        if (this.playerData && this.playerData.inventory.ammo[ammoType] >= amount) {
            this.playerData.inventory.ammo[ammoType] -= amount;
            return true;
        }
        return false;
    }
    /**
     * Convert legacy GameData back to legacy format for saving
     */
    toLegacyFormat() {
        if (!this.playerData)
            return null;
        return {
            levelCount: this.playerData.levelCount,
            health: this.playerData.health,
            experience: this.playerData.experience,
            skills: this.playerData.skills,
            current_weapon: this.playerData.currentWeapon.replace('_', ' '),
            current_armor: this.playerData.currentArmor.replace('_', ' '),
            weapons: this.playerData.weapons.map(w => w.replace('_', ' ')),
            med: this.playerData.inventory.med,
            ammo: this.playerData.inventory.ammo
        };
    }
    // Private helper methods
    calculateMaxHealth(level) {
        return 30 + (level - 1) * 5; // Base 30 + 5 per level
    }
    convertLegacySkills(legacySkills) {
        return {
            small_guns: legacySkills.small_guns || 75,
            big_guns: legacySkills.big_guns || 75,
            energy_weapons: legacySkills.energy_weapons || 75,
            melee_weapons: legacySkills.melee_weapons || 75,
            pyrotechnics: legacySkills.pyrotechnics || 75,
            lockpick: legacySkills.lockpick || 75,
            science: legacySkills.science || 75,
            repair: legacySkills.repair || 75,
            medicine: legacySkills.medcine || legacySkills.medicine || 75, // Handle typo in legacy
            barter: legacySkills.barter || 75,
            speech: legacySkills.speech || 75,
            surviving: legacySkills.surviving || 75
        };
    }
    convertLegacyInventory(legacyData) {
        return {
            med: {
                first_aid_kit: legacyData.med?.first_aid_kit || 0,
                jet: legacyData.med?.jet || 0,
                buffout: legacyData.med?.buffout || 0,
                mentats: legacyData.med?.mentats || 0,
                psycho: legacyData.med?.psycho || 0
            },
            ammo: {
                mm_9: legacyData.ammo?.mm_9 || 0,
                magnum_44: legacyData.ammo?.magnum_44 || 0,
                mm_12: legacyData.ammo?.mm_12 || 0,
                mm_5_45: legacyData.ammo?.mm_5_45 || 0,
                energy_cell: legacyData.ammo?.energy_cell || 0,
                frag_grenade: legacyData.ammo?.frag_grenade || 0
            }
        };
    }
    convertWeaponName(legacyName) {
        return legacyName.toLowerCase().replace(/\s+/g, '_');
    }
    convertArmorName(legacyName) {
        return legacyName.toLowerCase().replace(/\s+/g, '_');
    }
    getRequiredExperience(level) {
        return level * 100; // Simple progression: 100 XP per level
    }
    levelUp() {
        if (!this.playerData)
            return;
        this.playerData.levelCount++;
        this.playerData.maxHealth = this.calculateMaxHealth(this.playerData.levelCount);
        this.playerData.health = this.playerData.maxHealth; // Full heal on level up
        // Reset experience for next level
        const requiredExp = this.getRequiredExperience(this.playerData.levelCount - 1);
        this.playerData.experience -= requiredExp;
    }
}
//# sourceMappingURL=PlayerService.js.map