import { IPlayerCharacter } from '../../interfaces/IPlayer.js';

/**
 * Player Data Manager - Single Responsibility: Core player data management
 * Manages the central player data object and provides access to it
 */
export class PlayerDataManager {
  private playerData: IPlayerCharacter | null = null;

  /**
   * Initialize player data
   */
  public initializePlayer(playerData: IPlayerCharacter): void {
    this.playerData = playerData;
  }

  /**
   * Get current player data
   */
  public getPlayerData(): IPlayerCharacter | null {
    return this.playerData;
  }

  /**
   * Check if player is initialized
   */
  public isInitialized(): boolean {
    return this.playerData !== null;
  }

  /**
   * Update player data
   */
  public updatePlayerData(updates: Partial<IPlayerCharacter>): void {
    if (!this.playerData) {
      throw new Error('Player data not initialized');
    }

    Object.assign(this.playerData, updates);
  }

  /**
   * Get player ID
   */
  public getPlayerId(): string | null {
    return this.playerData?.id || null;
  }

  /**
   * Get player level
   */
  public getPlayerLevel(): number {
    return this.playerData?.levelCount || 1;
  }

  /**
   * Get player health
   */
  public getPlayerHealth(): number {
    return this.playerData?.health || 0;
  }

  /**
   * Get player experience
   */
  public getPlayerExperience(): number {
    return this.playerData?.experience || 0;
  }

  /**
   * Create a deep copy of player data (for saves/backups)
   */
  public clonePlayerData(): IPlayerCharacter | null {
    if (!this.playerData) {
      return null;
    }

    return JSON.parse(JSON.stringify(this.playerData));
  }

  /**
   * Reset player data
   */
  public resetPlayerData(): void {
    this.playerData = null;
  }

  /**
   * Validate player data structure
   */
  public validatePlayerData(): boolean {
    if (!this.playerData) {
      return false;
    }

    // Check required fields
    const requiredFields = ['id', 'levelCount', 'health', 'maxHealth', 'experience'];
    for (const field of requiredFields) {
      if (!(field in this.playerData)) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Check data types
    if (typeof this.playerData.id !== 'string') return false;
    if (typeof this.playerData.levelCount !== 'number') return false;
    if (typeof this.playerData.health !== 'number') return false;
    if (typeof this.playerData.maxHealth !== 'number') return false;
    if (typeof this.playerData.experience !== 'number') return false;

    // Check valid ranges
    if (this.playerData.health < 0) return false;
    if (this.playerData.maxHealth <= 0) return false;
    if (this.playerData.levelCount < 1) return false;
    if (this.playerData.experience < 0) return false;

    return true;
  }

  /**
   * Get player statistics summary
   */
  public getPlayerSummary(): {
    id: string;
    level: number;
    health: number;
    maxHealth: number;
    experience: number;
    currentWeapon: string;
    currentArmor: string;
  } | null {
    if (!this.playerData) {
      return null;
    }

    return {
      id: this.playerData.id,
      level: this.playerData.levelCount,
      health: this.playerData.health,
      maxHealth: this.playerData.maxHealth,
      experience: this.playerData.experience,
      currentWeapon: this.playerData.currentWeapon,
      currentArmor: this.playerData.currentArmor
    };
  }
}
