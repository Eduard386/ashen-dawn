/**
 * Pure TypeScript Game Data Service - Core game state management
 * Manages game state with clean TypeScript architecture
 */
export declare class GameDataService {
    private static instance;
    private gameData;
    private initialized;
    private constructor();
    static getInstance(): GameDataService;
    isInitialized(): boolean;
    /**
     * Get default game data structure
     */
    private getDefaultGameData;
    /**
     * Initialize game data
     */
    init(): void;
    /**
     * Get game data
     */
    get(): any;
    /**
     * Set game data
     */
    set(data: any): void;
    /**
     * Reset game data
     */
    reset(): void;
    /**
     * Get default data copy
     */
    getDefault(): any;
    /**
     * Save to localStorage
     */
    save(): void;
    /**
     * Load from localStorage
     */
    load(): boolean;
    /**
     * Check if game data exists
     */
    exists(): boolean;
    /**
     * Get player level count
     */
    getLevel(): number;
    /**
     * Get player health
     */
    getHealth(): number;
    /**
     * Set player health
     */
    setHealth(health: number): void;
    /**
     * Get player experience
     */
    getExperience(): number;
    /**
     * Add experience
     */
    addExperience(exp: number): void;
    /**
     * Get current weapon
     */
    getCurrentWeapon(): string;
    /**
     * Set current weapon
     */
    setCurrentWeapon(weapon: string): void;
    /**
     * Get weapons array
     */
    getWeapons(): string[];
    /**
     * Add weapon
     */
    addWeapon(weapon: string): void;
    /**
     * Get medical items
     */
    getMedicalItems(): any;
    /**
     * Use medical item
     */
    useMedicalItem(itemType: string): boolean;
    /**
     * Add medical item
     */
    addMedicalItem(itemType: string, amount?: number): void;
    /**
     * Get ammo
     */
    getAmmo(): any;
    /**
     * Use ammo
     */
    useAmmo(ammoType: string, amount?: number): boolean;
    /**
     * Add ammo
     */
    addAmmo(ammoType: string, amount: number): void;
    /**
     * Calculate required experience for level
     */
    getRequiredExperience(level: number): number;
    /**
     * Calculate current player level from experience
     */
    calculateLevel(): number;
    /**
     * Update level count
     */
    updateLevelCount(): void;
    /**
     * Get current armor
     */
    getCurrentArmor(): string;
    /**
     * Set current armor
     */
    setCurrentArmor(armor: string): void;
    /**
     * Get enemies to create
     */
    getEnemiesToCreate(): any[];
    /**
     * Set enemies to create
     */
    setEnemiesToCreate(enemies: any[]): void;
    /**
     * Get level loot
     */
    getLevelLoot(): any[];
    /**
     * Set level loot
     */
    setLevelLoot(loot: any[]): void;
    /**
     * Get armor loot
     */
    getArmorLoot(): any;
    /**
     * Set armor loot
     */
    setArmorLoot(armor: any): void;
    /**
     * Get skills
     */
    getSkills(): any;
    /**
     * Update skill
     */
    updateSkill(skillName: string, value: number): void;
}
