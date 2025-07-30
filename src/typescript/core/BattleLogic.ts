import { LegacyBridge } from '../core/bridges/LegacyBridge';
import { IEnemy } from '../core/interfaces/IEnemy';
import { IWeapon } from '../core/interfaces/IWeapon';
import { ICombatResult } from '../core/interfaces/ICombat';

/**
 * Battle Logic - Core battle mechanics separated from Phaser UI
 * This allows testing battle functionality without UI dependencies
 */
export class BattleLogic {
  private bridge: LegacyBridge;
  private currentEnemies: IEnemy[] = [];
  private selectedEnemyIndex: number = 0;
  private playerTurn: boolean = true;
  private combatLog: string[] = [];
  private weaponCooldowns: Map<string, number> = new Map();

  constructor() {
    this.bridge = LegacyBridge.getInstance();
  }

  /**
   * Initialize battle with enemy type
   */
  public initializeBattle(enemyType: string): void {
    console.log('🚀 Battle Logic initialized with TypeScript services');
    
    // Initialize TypeScript services if not already done
    if (!this.bridge.isInitialized()) {
      this.bridge.initialize();
    }

    // Spawn enemies
    this.spawnEnemies(enemyType);
    
    // Start combat
    this.startCombat();
  }

  /**
   * Get current battle state
   */
  public getBattleState(): {
    enemies: IEnemy[];
    selectedEnemyIndex: number;
    playerTurn: boolean;
    combatLog: string[];
    playerHealth: number;
    playerMaxHealth: number;
    currentWeapon: string;
  } {
    return {
      enemies: [...this.currentEnemies],
      selectedEnemyIndex: this.selectedEnemyIndex,
      playerTurn: this.playerTurn,
      combatLog: [...this.combatLog],
      playerHealth: this.bridge.getPlayerHealth(),
      playerMaxHealth: this.bridge.getPlayerMaxHealth(),
      currentWeapon: this.bridge.getCurrentWeapon()
    };
  }

  private spawnEnemies(enemyType: string): void {
    const enemyService = this.bridge.getServices().enemy;
    this.currentEnemies = enemyService.spawnEnemyGroup(enemyType);
    
    console.log(`💀 Spawned ${this.currentEnemies.length} ${enemyType}:`, 
      this.currentEnemies.map(e => `${e.name} (${e.currentHealth}HP)`));
    
    // Select first enemy by default
    if (this.currentEnemies.length > 0) {
      this.selectEnemy(0);
    }
  }

  private startCombat(): void {
    this.addToCombatLog('⚔️ Combat begins!');
    this.addToCombatLog(`You face ${this.currentEnemies.length} enemies.`);
    this.playerTurn = true;
  }

  public selectEnemy(index: number): boolean {
    if (index < 0 || index >= this.currentEnemies.length) {
      return false;
    }
    
    this.selectedEnemyIndex = index;
    const enemy = this.currentEnemies[index];
    this.addToCombatLog(`🎯 Targeting: ${enemy.name} (${enemy.currentHealth}/${enemy.defence.health} HP)`);
    return true;
  }

  public switchWeapon(weaponName: string): boolean {
    const switched = this.bridge.switchWeapon(weaponName);
    if (switched) {
      this.addToCombatLog(`🔫 Switched to ${weaponName}`);
    } else {
      this.addToCombatLog(`❌ Cannot switch to ${weaponName}`);
    }
    return switched;
  }

  public performAttack(): { success: boolean; defeated: boolean; victory: boolean } {
    if (!this.playerTurn) {
      return { success: false, defeated: false, victory: false };
    }
    
    const selectedEnemy = this.currentEnemies[this.selectedEnemyIndex];
    if (!selectedEnemy || !this.bridge.getServices().enemy.isAlive(selectedEnemy)) {
      this.addToCombatLog('❌ No valid target selected');
      return { success: false, defeated: false, victory: false };
    }
    
    const currentWeapon = this.bridge.getCurrentWeapon();
    
    // Check weapon cooldown
    const cooldownKey = currentWeapon;
    const currentTime = Date.now();
    const lastUsed = this.weaponCooldowns.get(cooldownKey) || 0;
    const weaponService = this.bridge.getServices().weapon;
    const weapon = weaponService.getWeapon(currentWeapon.toLowerCase().replace(/\s+/g, '_'));
    
    if (weapon && currentTime - lastUsed < weapon.cooldown) {
      const remaining = Math.ceil((weapon.cooldown - (currentTime - lastUsed)) / 1000);
      this.addToCombatLog(`⏰ ${currentWeapon} cooldown: ${remaining}s remaining`);
      return { success: false, defeated: false, victory: false };
    }
    
    // Perform attack using TypeScript combat service
    const combatService = this.bridge.getServices().combat;
    const player = this.bridge.getServices().gameState.getPlayer();
    
    if (!player || !weapon) {
      this.addToCombatLog('❌ Attack failed: Invalid player or weapon');
      return { success: false, defeated: false, victory: false };
    }
    
    // Check and consume ammo
    if (!combatService.canUseWeapon(player, weapon)) {
      this.addToCombatLog(`❌ Not enough ammo for ${currentWeapon}`);
      return { success: false, defeated: false, victory: false };
    }
    
    combatService.consumeAmmo(player, weapon);
    
    // Calculate attack result
    const attackResult = combatService.calculatePlayerAttack(player, weapon, selectedEnemy);
    
    this.processAttackResult(attackResult, selectedEnemy);
    
    // Set weapon cooldown
    this.weaponCooldowns.set(cooldownKey, currentTime);
    
    // Check if enemy is defeated
    let enemyDefeated = false;
    if (selectedEnemy.currentHealth <= 0) {
      enemyDefeated = true;
      this.handleEnemyDefeated(selectedEnemy);
    }
    
    // Check if all enemies defeated
    const aliveEnemies = this.currentEnemies.filter(e => 
      this.bridge.getServices().enemy.isAlive(e));
    
    if (aliveEnemies.length === 0) {
      this.handleVictory();
      return { success: true, defeated: enemyDefeated, victory: true };
    } else if (enemyDefeated) {
      // Select next alive enemy
      this.selectNextAliveEnemy();
    }
    
    // End player turn
    this.endPlayerTurn();
    
    return { success: true, defeated: enemyDefeated, victory: false };
  }

  private processAttackResult(result: ICombatResult, enemy: IEnemy): void {
    this.addToCombatLog(result.message);
    
    if (result.isHit) {
      // Apply damage
      enemy.currentHealth = result.remainingHealth;
    }
  }

  private handleEnemyDefeated(enemy: IEnemy): void {
    this.addToCombatLog(`💀 ${enemy.name} defeated!`);
    
    // Award experience
    const player = this.bridge.getServices().gameState.getPlayer();
    if (player) {
      const expGained = this.bridge.getServices().combat
        .calculateExperienceGain(enemy, player.levelCount);
      
      const leveledUp = this.bridge.addExperience(expGained);
      this.addToCombatLog(`✨ Gained ${expGained} experience`);
      
      if (leveledUp) {
        this.addToCombatLog(`🎉 Level up! Now level ${this.bridge.getPlayerLevel()}`);
      }
    }
  }

  private selectNextAliveEnemy(): void {
    for (let i = 0; i < this.currentEnemies.length; i++) {
      if (this.bridge.getServices().enemy.isAlive(this.currentEnemies[i])) {
        this.selectEnemy(i);
        break;
      }
    }
  }

  private endPlayerTurn(): void {
    this.playerTurn = false;
    
    // Don't automatically perform enemy turns in testing mode
    // This allows tests to control when enemy turns happen
    if (process.env.NODE_ENV !== 'test') {
      // Delay enemy turns in real game
      setTimeout(() => {
        this.performEnemyTurns();
      }, 1000);
    }
  }

  /**
   * Manually trigger enemy turns (useful for testing)
   */
  public triggerEnemyTurns(): void {
    this.performEnemyTurns();
  }

  private performEnemyTurns(): void {
    const aliveEnemies = this.currentEnemies.filter(e => 
      this.bridge.getServices().enemy.isAlive(e));
    
    for (const enemy of aliveEnemies) {
      const combatService = this.bridge.getServices().combat;
      const player = this.bridge.getServices().gameState.getPlayer();
      
      if (player) {
        const attackResult = combatService.calculateEnemyAttack(enemy, player);
        
        this.addToCombatLog(attackResult.message);
        
        if (attackResult.isHit) {
          this.bridge.updatePlayerHealth(attackResult.remainingHealth);
          
          // Check if player is defeated
          if (attackResult.remainingHealth <= 0) {
            this.handleDefeat();
            return;
          }
        }
      }
    }
    
    // All enemies have acted, start player turn
    this.playerTurn = true;
    this.addToCombatLog('--- Your Turn ---');
  }

  public useItem(itemType: string): boolean {
    const used = this.bridge.useMedicalItem(itemType);
    if (used) {
      this.addToCombatLog(`💊 Used ${itemType}`);
      this.endPlayerTurn();
      return true;
    } else {
      this.addToCombatLog(`❌ No ${itemType} available`);
      return false;
    }
  }

  public attemptRetreat(): boolean {
    // 75% chance to escape
    if (Math.random() < 0.75) {
      this.addToCombatLog('🏃 Successfully retreated!');
      return true;
    } else {
      this.addToCombatLog('❌ Failed to retreat!');
      this.endPlayerTurn();
      return false;
    }
  }

  private handleVictory(): void {
    this.addToCombatLog('🎉 Victory! All enemies defeated!');
  }

  private handleDefeat(): void {
    this.addToCombatLog('💀 You have been defeated...');
  }

  private addToCombatLog(message: string): void {
    this.combatLog.push(message);
    
    // Keep only last 20 messages
    if (this.combatLog.length > 20) {
      this.combatLog.shift();
    }
  }

  public getBridge(): LegacyBridge {
    return this.bridge;
  }
}
