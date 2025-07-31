import { IPlayerCharacter, IPlayerSkills, IInventory } from '../interfaces/IPlayer.js';

/**
 * Pure TypeScript Game Data Service - Core game state management
 * Manages game state with clean TypeScript architecture
 */
export class GameDataService {
  private static instance: GameDataService;
  private gameData: any = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): GameDataService {
    if (!GameDataService.instance) {
      GameDataService.instance = new GameDataService();
    }
    return GameDataService.instance;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get default game data structure
   */
  private getDefaultGameData(): any {
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
  public init(): void {
    if (!this.gameData) {
      this.gameData = JSON.parse(JSON.stringify(this.getDefaultGameData()));
      this.initialized = true;
    }
  }

  /**
   * Get game data
   */
  public get(): any {
    if (!this.gameData) {
      this.init();
    }
    return this.gameData;
  }

  /**
   * Set game data
   */
  public set(data: any): void {
    this.gameData = data;
  }

  /**
   * Reset game data
   */
  public reset(): void {
    this.gameData = JSON.parse(JSON.stringify(this.getDefaultGameData()));
  }

  /**
   * Get default data copy
   */
  public getDefault(): any {
    return JSON.parse(JSON.stringify(this.getDefaultGameData()));
  }

  /**
   * Save to localStorage
   */
  public save(): void {
    if (this.gameData) {
      localStorage.setItem('gameData', JSON.stringify(this.gameData));
    }
  }

  /**
   * Load from localStorage
   */
  public load(): boolean {
    try {
      const savedData = localStorage.getItem('gameData');
      if (savedData) {
        this.gameData = JSON.parse(savedData);
        return true;
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
    return false;
  }

  /**
   * Check if game data exists
   */
  public exists(): boolean {
    return this.gameData !== null;
  }

  /**
   * Get player level count
   */
  public getLevel(): number {
    return this.get().levelCount;
  }

  /**
   * Get player health
   */
  public getHealth(): number {
    return this.get().health;
  }

  /**
   * Set player health
   */
  public setHealth(health: number): void {
    const data = this.get();
    data.health = Math.max(0, health);
    this.set(data);
  }

  /**
   * Get player experience
   */
  public getExperience(): number {
    return this.get().experience;
  }

  /**
   * Add experience
   */
  public addExperience(exp: number): void {
    const data = this.get();
    data.experience += exp;
    this.set(data);
  }

  /**
   * Get current weapon
   */
  public getCurrentWeapon(): string {
    return this.get().current_weapon;
  }

  /**
   * Set current weapon
   */
  public setCurrentWeapon(weapon: string): void {
    const data = this.get();
    data.current_weapon = weapon;
    this.set(data);
  }

  /**
   * Get weapons array
   */
  public getWeapons(): string[] {
    return this.get().weapons;
  }

  /**
   * Add weapon
   */
  public addWeapon(weapon: string): void {
    const data = this.get();
    if (!data.weapons.includes(weapon)) {
      data.weapons.push(weapon);
      this.set(data);
    }
  }

  /**
   * Get medical items
   */
  public getMedicalItems(): any {
    return this.get().med;
  }

  /**
   * Use medical item
   */
  public useMedicalItem(itemType: string): boolean {
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
  public addMedicalItem(itemType: string, amount: number = 1): void {
    const data = this.get();
    data.med[itemType] = (data.med[itemType] || 0) + amount;
    this.set(data);
  }

  /**
   * Get ammo
   */
  public getAmmo(): any {
    return this.get().ammo;
  }

  /**
   * Use ammo
   */
  public useAmmo(ammoType: string, amount: number = 1): boolean {
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
  public addAmmo(ammoType: string, amount: number): void {
    const data = this.get();
    data.ammo[ammoType] = (data.ammo[ammoType] || 0) + amount;
    this.set(data);
  }

  /**
   * Calculate required experience for level
   */
  public getRequiredExperience(level: number): number {
    // Same formula as in legacy
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 100;
  }

  /**
   * Calculate current player level from experience
   */
  public calculateLevel(): number {
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
  public updateLevelCount(): void {
    const data = this.get();
    data.levelCount = this.calculateLevel();
    this.set(data);
  }

  /**
   * Get current armor
   */
  public getCurrentArmor(): string {
    return this.get().current_armor;
  }

  /**
   * Set current armor
   */
  public setCurrentArmor(armor: string): void {
    const data = this.get();
    data.current_armor = armor;
    this.set(data);
  }

  /**
   * Get enemies to create
   */
  public getEnemiesToCreate(): any[] {
    return this.get().enemiesToCreate;
  }

  /**
   * Set enemies to create
   */
  public setEnemiesToCreate(enemies: any[]): void {
    const data = this.get();
    data.enemiesToCreate = enemies;
    this.set(data);
  }

  /**
   * Get level loot
   */
  public getLevelLoot(): any[] {
    return this.get().levelLoot;
  }

  /**
   * Set level loot
   */
  public setLevelLoot(loot: any[]): void {
    const data = this.get();
    data.levelLoot = loot;
    this.set(data);
  }

  /**
   * Get armor loot
   */
  public getArmorLoot(): any {
    return this.get().armorLoot;
  }

  /**
   * Set armor loot
   */
  public setArmorLoot(armor: any): void {
    const data = this.get();
    data.armorLoot = armor;
    this.set(data);
  }

  /**
   * Get skills
   */
  public getSkills(): any {
    return this.get().skills;
  }

  /**
   * Update skill
   */
  public updateSkill(skillName: string, value: number): void {
    const data = this.get();
    data.skills[skillName] = value;
    this.set(data);
  }
}
