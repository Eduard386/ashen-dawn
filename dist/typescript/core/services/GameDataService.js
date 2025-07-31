/**
 * Pure TypeScript Game Data Service - Core game state management
 * Manages game state with clean TypeScript architecture
 */
export class GameDataService {
    constructor() {
        this.gameData = null;
        this.initialized = false;
    }
    static getInstance() {
        if (!GameDataService.instance) {
            GameDataService.instance = new GameDataService();
        }
        return GameDataService.instance;
    }
    isInitialized() {
        return this.initialized;
    }
    /**
     * Get default game data structure
     */
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
                medcine: 75, // Keep typo for data compatibility
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
     * Initialize game data
     */
    init() {
        if (!this.gameData) {
            this.gameData = JSON.parse(JSON.stringify(this.getDefaultGameData()));
            this.initialized = true;
        }
    }
    /**
     * Get game data
     */
    get() {
        if (!this.gameData) {
            this.init();
        }
        return this.gameData;
    }
    /**
     * Set game data
     */
    set(data) {
        this.gameData = data;
    }
    /**
     * Reset game data
     */
    reset() {
        this.gameData = JSON.parse(JSON.stringify(this.getDefaultGameData()));
    }
    /**
     * Get default data copy
     */
    getDefault() {
        return JSON.parse(JSON.stringify(this.getDefaultGameData()));
    }
    /**
     * Save to localStorage
     */
    save() {
        if (this.gameData) {
            localStorage.setItem('gameData', JSON.stringify(this.gameData));
        }
    }
    /**
     * Load from localStorage
     */
    load() {
        try {
            const savedData = localStorage.getItem('gameData');
            if (savedData) {
                this.gameData = JSON.parse(savedData);
                return true;
            }
        }
        catch (error) {
            console.error('Failed to load game data:', error);
        }
        return false;
    }
    /**
     * Check if game data exists
     */
    exists() {
        return this.gameData !== null;
    }
    /**
     * Get player level count
     */
    getLevel() {
        return this.get().levelCount;
    }
    /**
     * Get player health
     */
    getHealth() {
        return this.get().health;
    }
    /**
     * Set player health
     */
    setHealth(health) {
        const data = this.get();
        data.health = Math.max(0, health);
        this.set(data);
    }
    /**
     * Get player experience
     */
    getExperience() {
        return this.get().experience;
    }
    /**
     * Add experience
     */
    addExperience(exp) {
        const data = this.get();
        data.experience += exp;
        this.set(data);
    }
    /**
     * Get current weapon
     */
    getCurrentWeapon() {
        return this.get().current_weapon;
    }
    /**
     * Set current weapon
     */
    setCurrentWeapon(weapon) {
        const data = this.get();
        data.current_weapon = weapon;
        this.set(data);
    }
    /**
     * Get weapons array
     */
    getWeapons() {
        return this.get().weapons;
    }
    /**
     * Add weapon
     */
    addWeapon(weapon) {
        const data = this.get();
        if (!data.weapons.includes(weapon)) {
            data.weapons.push(weapon);
            this.set(data);
        }
    }
    /**
     * Get medical items
     */
    getMedicalItems() {
        return this.get().med;
    }
    /**
     * Use medical item
     */
    useMedicalItem(itemType) {
        const data = this.get();
        if (data.med[itemType] > 0) {
            data.med[itemType]--;
            this.set(data);
            return true;
        }
        return false;
    }
    /**
     * Add medical item
     */
    addMedicalItem(itemType, amount = 1) {
        const data = this.get();
        data.med[itemType] = (data.med[itemType] || 0) + amount;
        this.set(data);
    }
    /**
     * Get ammo
     */
    getAmmo() {
        return this.get().ammo;
    }
    /**
     * Use ammo
     */
    useAmmo(ammoType, amount = 1) {
        const data = this.get();
        if (data.ammo[ammoType] >= amount) {
            data.ammo[ammoType] -= amount;
            this.set(data);
            return true;
        }
        return false;
    }
    /**
     * Add ammo
     */
    addAmmo(ammoType, amount) {
        const data = this.get();
        data.ammo[ammoType] = (data.ammo[ammoType] || 0) + amount;
        this.set(data);
    }
    /**
     * Calculate required experience for level
     */
    getRequiredExperience(level) {
        // Same formula as in legacy
        if (level <= 1)
            return 0;
        return Math.pow(level - 1, 2) * 100;
    }
    /**
     * Calculate current player level from experience
     */
    calculateLevel() {
        const exp = this.getExperience();
        let level = 1;
        while (this.getRequiredExperience(level + 1) <= exp) {
            level++;
        }
        return level;
    }
    /**
     * Update level count
     */
    updateLevelCount() {
        const data = this.get();
        data.levelCount = this.calculateLevel();
        this.set(data);
    }
    /**
     * Get current armor
     */
    getCurrentArmor() {
        return this.get().current_armor;
    }
    /**
     * Set current armor
     */
    setCurrentArmor(armor) {
        const data = this.get();
        data.current_armor = armor;
        this.set(data);
    }
    /**
     * Get enemies to create
     */
    getEnemiesToCreate() {
        return this.get().enemiesToCreate;
    }
    /**
     * Set enemies to create
     */
    setEnemiesToCreate(enemies) {
        const data = this.get();
        data.enemiesToCreate = enemies;
        this.set(data);
    }
    /**
     * Get level loot
     */
    getLevelLoot() {
        return this.get().levelLoot;
    }
    /**
     * Set level loot
     */
    setLevelLoot(loot) {
        const data = this.get();
        data.levelLoot = loot;
        this.set(data);
    }
    /**
     * Get armor loot
     */
    getArmorLoot() {
        return this.get().armorLoot;
    }
    /**
     * Set armor loot
     */
    setArmorLoot(armor) {
        const data = this.get();
        data.armorLoot = armor;
        this.set(data);
    }
    /**
     * Get skills
     */
    getSkills() {
        return this.get().skills;
    }
    /**
     * Update skill
     */
    updateSkill(skillName, value) {
        const data = this.get();
        data.skills[skillName] = value;
        this.set(data);
    }
}
//# sourceMappingURL=GameDataService.js.map