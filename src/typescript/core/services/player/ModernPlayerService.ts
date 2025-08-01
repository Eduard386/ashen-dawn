import { IPlayerCharacter } from '../../interfaces/IPlayer.js';
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
  private static instance: ModernPlayerService;
  
  private dataManager: PlayerDataManager;
  private healthManager: HealthManager | null = null;
  private experienceManager: ExperienceManager | null = null;
  private equipmentManager: EquipmentManager | null = null;
  private legacyConverter: LegacyPlayerConverter;

  private constructor() {
    this.dataManager = new PlayerDataManager();
    this.legacyConverter = new LegacyPlayerConverter();
  }

  public static getInstance(): ModernPlayerService {
    if (!ModernPlayerService.instance) {
      ModernPlayerService.instance = new ModernPlayerService();
    }
    return ModernPlayerService.instance;
  }

  /**
   * Initialize player from legacy data
   */
  public initializeFromLegacy(legacyData?: any): IPlayerCharacter {
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
  public getPlayer(): IPlayerCharacter | null {
    return this.dataManager.getPlayerData();
  }

  /**
   * Get health manager
   */
  public getHealthManager(): HealthManager {
    if (!this.healthManager) {
      throw new Error('Player not initialized');
    }
    return this.healthManager;
  }

  /**
   * Get experience manager  
   */
  public getExperienceManager(): ExperienceManager {
    if (!this.experienceManager) {
      throw new Error('Player not initialized');
    }
    return this.experienceManager;
  }

  /**
   * Get equipment manager
   */
  public getEquipmentManager(): EquipmentManager {
    if (!this.equipmentManager) {
      throw new Error('Player not initialized');
    }
    return this.equipmentManager;
  }

  /**
   * Get legacy converter
   */
  public getLegacyConverter(): LegacyPlayerConverter {
    return this.legacyConverter;
  }

  // Convenience methods that delegate to appropriate managers

  /**
   * Update player health (delegates to HealthManager)
   */
  public updateHealth(newHealth: number): void {
    this.getHealthManager().updateHealth(newHealth);
  }

  /**
   * Add experience (delegates to ExperienceManager)
   */
  public addExperience(experience: number): boolean {
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
  public useMedicalItem(itemType: keyof IPlayerCharacter['inventory']['med']): boolean {
    return this.getHealthManager().useMedicalItem(itemType);
  }

  /**
   * Switch weapon (delegates to EquipmentManager)
   */
  public switchWeapon(weaponName: string): boolean {
    return this.getEquipmentManager().switchWeapon(weaponName);
  }

  /**
   * Add weapon (delegates to EquipmentManager)
   */
  public addWeapon(weaponName: string): void {
    this.getEquipmentManager().addWeapon(weaponName);
  }

  /**
   * Add ammo to inventory
   */
  public addAmmo(ammoType: keyof IPlayerCharacter['inventory']['ammo'], amount: number): void {
    const player = this.getPlayer();
    if (!player) return;
    
    player.inventory.ammo[ammoType] += amount;
  }

  /**
   * Use ammo from inventory
   */
  public useAmmo(ammoType: keyof IPlayerCharacter['inventory']['ammo'], amount: number): boolean {
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
  public toLegacyFormat(): any | null {
    const player = this.getPlayer();
    if (!player) return null;
    
    return this.legacyConverter.convertToLegacy(player);
  }

  /**
   * Check if player is initialized
   */
  public isInitialized(): boolean {
    return this.dataManager.isInitialized();
  }

  /**
   * Reset player service
   */
  public reset(): void {
    this.dataManager.resetPlayerData();
    this.healthManager = null;
    this.experienceManager = null;
    this.equipmentManager = null;
  }

  /**
   * Get comprehensive player status
   */
  public getPlayerStatus(): {
    isAlive: boolean;
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
    experienceToNext: number;
    currentWeapon: string;
    currentArmor: string;
  } | null {
    if (!this.isInitialized()) return null;

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
