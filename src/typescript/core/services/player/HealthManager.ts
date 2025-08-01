import { IPlayerCharacter, IInventory } from '../../interfaces/IPlayer.js';
import { IHealthManager } from '../../interfaces/IPlayerSegregated.js';

/**
 * Health Manager - Single Responsibility: Player health and medical items
 * Manages player health, healing, and medical item consumption
 */
export class HealthManager implements IHealthManager {
  private playerData: IPlayerCharacter;

  constructor(playerData: IPlayerCharacter) {
    this.playerData = playerData;
  }

  /**
   * Get current health
   */
  public getHealth(): number {
    return this.playerData.health;
  }

  /**
   * Get maximum health
   */
  public getMaxHealth(): number {
    return this.playerData.maxHealth;
  }

  /**
   * Update health to specific value
   */
  public updateHealth(newHealth: number): void {
    this.playerData.health = Math.max(0, Math.min(newHealth, this.playerData.maxHealth));
  }

  /**
   * Heal player by amount
   */
  public heal(amount: number): number {
    const oldHealth = this.playerData.health;
    this.updateHealth(this.playerData.health + amount);
    return this.playerData.health - oldHealth; // Return actual healing amount
  }

  /**
   * Deal damage to player
   */
  public takeDamage(damage: number): number {
    const oldHealth = this.playerData.health;
    this.updateHealth(this.playerData.health - damage);
    return oldHealth - this.playerData.health; // Return actual damage taken
  }

  /**
   * Check if player is dead
   */
  public isDead(): boolean {
    return this.playerData.health <= 0;
  }

  /**
   * Get health percentage (0-100)
   */
  public getHealthPercentage(): number {
    return this.playerData.maxHealth > 0 ? (this.playerData.health / this.playerData.maxHealth) * 100 : 0;
  }

  /**
   * Use medical item and apply healing
   */
  public useMedicalItem(itemType: keyof IInventory['med']): boolean {
    if (this.playerData.inventory.med[itemType] <= 0) {
      return false;
    }

    // Consume the item
    this.playerData.inventory.med[itemType]--;
    
    // Apply healing effects based on item type
    const healingAmount = this.getMedicalItemHealingAmount(itemType);
    this.heal(healingAmount);
    
    return true;
  }

  /**
   * Check if medical item is available
   */
  public hasMedicalItem(itemType: keyof IInventory['med']): boolean {
    return this.playerData.inventory.med[itemType] > 0;
  }

  /**
   * Get medical item count
   */
  public getMedicalItemCount(itemType: keyof IInventory['med']): number {
    return this.playerData.inventory.med[itemType];
  }

  /**
   * Get all medical items
   */
  public getAllMedicalItems(): IInventory['med'] {
    return { ...this.playerData.inventory.med };
  }

  /**
   * Calculate healing amount for medical item
   */
  private getMedicalItemHealingAmount(itemType: keyof IInventory['med']): number {
    const healingValues: Record<keyof IInventory['med'], number> = {
      first_aid_kit: 20,
      jet: 0,        // Temporary boost, no healing
      buffout: 0,    // Temporary strength boost, no healing
      mentats: 0,    // Temporary intelligence boost, no healing
      psycho: 0      // Temporary damage boost, no healing
    };
    
    return healingValues[itemType] || 0;
  }

  /**
   * Calculate max health based on level and endurance
   * Formula: 15 + (2 * endurance) + (3 * level)
   */
  public static calculateMaxHealth(level: number, endurance: number = 5): number {
    return 15 + (2 * endurance) + (3 * level);
  }

  /**
   * Update max health when level changes
   */
  public updateMaxHealth(newLevel: number): void {
    // Assume endurance of 5 if not available (legacy compatibility)
    const endurance = 5; // Could be extracted from player stats if available
    this.playerData.maxHealth = HealthManager.calculateMaxHealth(newLevel, endurance);
    
    // Ensure current health doesn't exceed new max
    if (this.playerData.health > this.playerData.maxHealth) {
      this.playerData.health = this.playerData.maxHealth;
    }
  }
}
