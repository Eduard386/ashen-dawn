import { GameStateService } from '../services/GameStateService';

/**
 * Legacy Bridge - Provides compatibility layer between legacy JS code and TypeScript services
 * This allows gradual migration without breaking existing functionality
 */
export class LegacyBridge {
  private static instance: LegacyBridge;
  private gameState: GameStateService;

  private constructor() {
    this.gameState = GameStateService.getInstance();
  }

  public static getInstance(): LegacyBridge {
    if (!LegacyBridge.instance) {
      LegacyBridge.instance = new LegacyBridge();
    }
    return LegacyBridge.instance;
  }

  /**
   * Initialize the bridge with legacy GameData
   */
  public initialize(legacyGameData?: any): void {
    this.gameState.initializeGame(legacyGameData);
    console.log('Legacy bridge initialized - TypeScript services active');
  }

  /**
   * Legacy GameData compatibility - returns data in original format
   */
  public getGameData(): any {
    return this.gameState.getLegacyGameData();
  }

  /**
   * Legacy GameData compatibility - updates from original format
   */
  public setGameData(legacyData: any): void {
    this.gameState.updateFromLegacy(legacyData);
  }

  /**
   * Legacy save/load compatibility
   */
  public saveGame(): void {
    this.gameState.saveGame();
  }

  public loadGame(): boolean {
    return this.gameState.loadGame();
  }

  /**
   * Player health management (legacy compatible)
   */
  public updatePlayerHealth(newHealth: number): void {
    this.gameState.getPlayerService().updateHealth(newHealth);
  }

  public getPlayerHealth(): number {
    const player = this.gameState.getPlayer();
    return player ? player.health : 0;
  }

  public getPlayerMaxHealth(): number {
    const player = this.gameState.getPlayer();
    return player ? player.maxHealth : 0;
  }

  /**
   * Experience and leveling (legacy compatible)
   */
  public addExperience(exp: number): boolean {
    return this.gameState.getPlayerService().addExperience(exp);
  }

  public getPlayerExperience(): number {
    const player = this.gameState.getPlayer();
    return player ? player.experience : 0;
  }

  public getPlayerLevel(): number {
    const player = this.gameState.getPlayer();
    return player ? player.levelCount : 1;
  }

  /**
   * Weapon management (legacy compatible)
   */
  public getCurrentWeapon(): string {
    const player = this.gameState.getPlayer();
    return player ? player.currentWeapon.replace('_', ' ') : 'Baseball bat';
  }

  public switchWeapon(weaponName: string): boolean {
    const standardizedName = weaponName.toLowerCase().replace(/\s+/g, '_');
    return this.gameState.getPlayerService().switchWeapon(standardizedName);
  }

  public addWeapon(weaponName: string): void {
    const standardizedName = weaponName.toLowerCase().replace(/\s+/g, '_');
    this.gameState.getPlayerService().addWeapon(standardizedName);
  }

  public getPlayerWeapons(): string[] {
    const player = this.gameState.getPlayer();
    if (!player) return [];
    
    return player.weapons.map(weapon => weapon.replace('_', ' '));
  }

  /**
   * Ammo management (legacy compatible)
   */
  public getAmmo(ammoType: string): number {
    const player = this.gameState.getPlayer();
    if (!player) return 0;
    
    const standardizedType = ammoType.replace(/\s+/g, '_') as keyof typeof player.inventory.ammo;
    return player.inventory.ammo[standardizedType] || 0;
  }

  public addAmmo(ammoType: string, amount: number): void {
    const standardizedType = ammoType.replace(/\s+/g, '_') as any;
    this.gameState.getPlayerService().addAmmo(standardizedType, amount);
  }

  public useAmmo(ammoType: string, amount: number): boolean {
    const standardizedType = ammoType.replace(/\s+/g, '_') as any;
    return this.gameState.getPlayerService().useAmmo(standardizedType, amount);
  }

  /**
   * Medical items (legacy compatible)
   */
  public getMedicalItem(itemType: string): number {
    const player = this.gameState.getPlayer();
    if (!player) return 0;
    
    const standardizedType = itemType.replace(/\s+/g, '_') as keyof typeof player.inventory.med;
    return player.inventory.med[standardizedType] || 0;
  }

  public useMedicalItem(itemType: string): boolean {
    const standardizedType = itemType.replace(/\s+/g, '_') as any;
    return this.gameState.getPlayerService().useMedicalItem(standardizedType);
  }

  /**
   * Combat system (enhanced with TypeScript services)
   */
  public calculatePlayerAttack(weaponName: string, enemyData: any): any {
    const player = this.gameState.getPlayer();
    const weapon = this.gameState.getWeaponService().getWeapon(weaponName.toLowerCase().replace(/\s+/g, '_'));
    
    if (!player || !weapon) {
      return { isHit: false, damage: 0, message: 'Invalid weapon or player' };
    }

    // Convert legacy enemy to TypeScript interface
    const enemy = this.gameState.getEnemyService().convertLegacyEnemy(enemyData);
    
    return this.gameState.getCombatService().calculatePlayerAttack(player, weapon, enemy);
  }

  public calculateEnemyAttack(enemyData: any): any {
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
  public spawnEnemyGroup(enemyName: string): any[] {
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
  public setCurrentScene(sceneName: string): void {
    this.gameState.setCurrentScene(sceneName);
  }

  public getCurrentScene(): string {
    return this.gameState.getCurrentScene();
  }

  /**
   * Check if TypeScript services are initialized
   */
  public isInitialized(): boolean {
    return this.gameState.isInitialized();
  }

  /**
   * Reset game to defaults
   */
  public resetGame(): void {
    this.gameState.resetGame();
  }

  /**
   * Force reset for testing (doesn't reinitialize)
   */
  public forceReset(): void {
    this.gameState.forceReset();
  }

  /**
   * Get all services for advanced usage
   */
  public getServices() {
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
  (window as any).LegacyBridge = LegacyBridge;
}
