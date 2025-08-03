/**
 * LSP-Compliant Combat System
 * Demonstrates Liskov Substitution Principle with polymorphic combat entities
 */

/**
 * Combat Result Interface
 * Standardized result format for all combat operations
 */
export interface ICombatResult {
  /** Success status of the operation */
  readonly success: boolean;
  
  /** Damage dealt (if applicable) */
  readonly damage: number;
  
  /** Critical hit flag */
  readonly critical: boolean;
  
  /** Status effects applied */
  readonly statusEffects: string[];
  
  /** Combat message */
  readonly message: string;
  
  /** Additional metadata */
  readonly metadata: Record<string, any>;
}

/**
 * Combat Status Interface
 * Standardized status information for combat entities
 */
export interface ICombatStatus {
  /** Current health points */
  readonly health: number;
  
  /** Maximum health points */
  readonly maxHealth: number;
  
  /** Combat readiness flag */
  readonly canAct: boolean;
  
  /** Active status effects */
  readonly statusEffects: string[];
  
  /** Combat statistics */
  readonly stats: {
    readonly strength: number;
    readonly defense: number;
    readonly agility: number;
    readonly accuracy: number;
  };
}

/**
 * Combat Action Interface
 * Standardized action format for combat operations
 */
export interface ICombatAction {
  /** Action type identifier */
  readonly type: string;
  
  /** Action intensity/power */
  readonly intensity: number;
  
  /** Target specification */
  readonly target?: any;
  
  /** Action metadata */
  readonly metadata: Record<string, any>;
}

/**
 * Abstract Base Combat Entity
 * 
 * LSP Contract:
 * - All subclasses must be substitutable for this base class
 * - Methods must honor the same preconditions and postconditions
 * - Behavioral contracts must be preserved
 */
export abstract class CombatEntity {
  protected _health: number;
  protected _maxHealth: number;
  protected _statusEffects: string[] = [];
  protected _stats: {
    strength: number;
    defense: number;
    agility: number;
    accuracy: number;
  };

  constructor(
    maxHealth: number,
    stats: ICombatStatus['stats']
  ) {
    // Precondition: maxHealth must be positive
    if (maxHealth <= 0) {
      throw new Error('MaxHealth must be positive');
    }
    
    this._maxHealth = maxHealth;
    this._health = maxHealth;
    this._stats = { 
      strength: stats.strength,
      defense: stats.defense,
      agility: stats.agility,
      accuracy: stats.accuracy
    };
  }

  /**
   * Perform an attack action
   * 
   * LSP Contract:
   * - Precondition: target must be a valid CombatEntity, this entity must be alive
   * - Postcondition: returns valid ICombatResult, may modify target's health
   * - Invariant: this entity's state remains valid
   */
  public abstract attack(target: CombatEntity): ICombatResult;

  /**
   * Take damage from an attack
   * 
   * LSP Contract:
   * - Precondition: damage must be non-negative
   * - Postcondition: health is reduced by at most the damage amount
   * - Invariant: health never goes below 0
   */
  public takeDamage(damage: number): ICombatResult {
    // Precondition validation
    if (damage < 0) {
      throw new Error('Damage cannot be negative');
    }

    const actualDamage = Math.min(damage, this._health);
    this._health -= actualDamage;

    // Ensure invariant: health >= 0
    this._health = Math.max(0, this._health);

    return {
      success: true,
      damage: actualDamage,
      critical: false,
      statusEffects: [],
      message: `${this.getName()} took ${actualDamage} damage`,
      metadata: {
        remainingHealth: this._health,
        wasKilled: this._health === 0
      }
    };
  }

  /**
   * Check if entity is alive
   * 
   * LSP Contract:
   * - Postcondition: returns true if health > 0, false otherwise
   * - Pure function: no side effects
   */
  public isAlive(): boolean {
    return this._health > 0;
  }

  /**
   * Get current combat status
   * 
   * LSP Contract:
   * - Postcondition: returns valid ICombatStatus with current state
   * - Pure function: no side effects
   */
  public getStatus(): ICombatStatus {
    return {
      health: this._health,
      maxHealth: this._maxHealth,
      canAct: this.isAlive() && !this._statusEffects.includes('stunned'),
      statusEffects: [...this._statusEffects],
      stats: { ...this._stats }
    };
  }

  /**
   * Apply a status effect
   * 
   * LSP Contract:
   * - Precondition: effect must be a valid string
   * - Postcondition: effect is added to statusEffects if not already present
   */
  public applyStatusEffect(effect: string): void {
    if (!effect || typeof effect !== 'string') {
      throw new Error('Status effect must be a non-empty string');
    }

    if (!this._statusEffects.includes(effect)) {
      this._statusEffects.push(effect);
    }
  }

  /**
   * Remove a status effect
   * 
   * LSP Contract:
   * - Precondition: effect must be a valid string
   * - Postcondition: effect is removed from statusEffects if present
   */
  public removeStatusEffect(effect: string): void {
    const index = this._statusEffects.indexOf(effect);
    if (index !== -1) {
      this._statusEffects.splice(index, 1);
    }
  }

  /**
   * Heal the entity
   * 
   * LSP Contract:
   * - Precondition: healAmount must be non-negative
   * - Postcondition: health is increased by at most healAmount, never exceeds maxHealth
   * - Invariant: health <= maxHealth
   */
  public heal(healAmount: number): ICombatResult {
    if (healAmount < 0) {
      throw new Error('Heal amount cannot be negative');
    }

    const actualHeal = Math.min(healAmount, this._maxHealth - this._health);
    this._health += actualHeal;

    // Ensure invariant: health <= maxHealth
    this._health = Math.min(this._health, this._maxHealth);

    return {
      success: true,
      damage: -actualHeal, // Negative damage indicates healing
      critical: false,
      statusEffects: [],
      message: `${this.getName()} healed for ${actualHeal} points`,
      metadata: {
        currentHealth: this._health,
        wasFullyHealed: this._health === this._maxHealth
      }
    };
  }

  /**
   * Get entity name for display purposes
   * Abstract method that subclasses must implement
   */
  public abstract getName(): string;

  /**
   * Check if this entity can perform the given action
   * 
   * LSP Contract:
   * - Precondition: action must be a valid ICombatAction
   * - Postcondition: returns boolean indicating action validity
   * - Pure function: no side effects
   */
  public canPerformAction(action: ICombatAction): boolean {
    if (!action || !action.type) {
      return false;
    }

    // Base requirements: must be alive and not stunned
    return this.isAlive() && !this._statusEffects.includes('stunned');
  }

  /**
   * Get the entity's effective stats considering status effects
   * 
   * LSP Contract:
   * - Postcondition: returns modified stats based on current status effects
   * - Pure function: no side effects
   */
  public getEffectiveStats(): ICombatStatus['stats'] {
    let effectiveStats = { ...this._stats };

    // Apply status effect modifiers
    if (this._statusEffects.includes('weakened')) {
      effectiveStats.strength = Math.floor(effectiveStats.strength * 0.7);
    }
    if (this._statusEffects.includes('buffed')) {
      effectiveStats.strength = Math.floor(effectiveStats.strength * 1.3);
    }
    if (this._statusEffects.includes('slowed')) {
      effectiveStats.agility = Math.floor(effectiveStats.agility * 0.7);
    }

    return effectiveStats;
  }

  /**
   * Calculate damage for an attack action
   * Protected method for subclasses to use in attack implementations
   * 
   * LSP Contract:
   * - Precondition: action must be valid attack action
   * - Postcondition: returns non-negative damage value
   */
  protected calculateDamage(action: ICombatAction): number {
    const stats = this.getEffectiveStats();
    const baseDamage = stats.strength * action.intensity;
    
    // Add some randomization (10% variance)
    const variance = baseDamage * 0.1;
    const randomFactor = (Math.random() * 2 - 1) * variance;
    
    return Math.max(0, Math.floor(baseDamage + randomFactor));
  }

  /**
   * Calculate hit chance for an attack action
   * Protected method for subclasses to use in attack implementations
   * 
   * LSP Contract:
   * - Precondition: target must be valid CombatEntity, action must be valid
   * - Postcondition: returns value between 0 and 1
   */
  protected calculateHitChance(target: CombatEntity, action: ICombatAction): number {
    const attackerStats = this.getEffectiveStats();
    const targetStats = target.getEffectiveStats();
    
    // Base accuracy vs target agility
    const baseChance = attackerStats.accuracy / (attackerStats.accuracy + targetStats.agility);
    
    // Ensure result is between 0 and 1
    return Math.max(0, Math.min(1, baseChance));
  }

  /**
   * Determine if an attack is critical
   * Protected method for subclasses to use in attack implementations
   * 
   * LSP Contract:
   * - Postcondition: returns boolean based on random chance
   */
  protected isCriticalHit(): boolean {
    const critChance = this.getEffectiveStats().agility * 0.01; // 1% per agility point
    return Math.random() < critChance;
  }
}

/**
 * Player Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export class PlayerCombatant extends CombatEntity {
  private playerName: string;
  private experience: number = 0;
  private level: number = 1;

  constructor(
    playerName: string,
    maxHealth: number,
    stats: ICombatStatus['stats']
  ) {
    super(maxHealth, stats);
    this.playerName = playerName;
  }

  public getName(): string {
    return this.playerName;
  }

  /**
   * Player attack implementation
   * Maintains LSP contract with potential for critical hits and experience gain
   */
  public attack(target: CombatEntity): ICombatResult {
    // Honor base class preconditions
    if (!target || !this.isAlive()) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Attack failed - invalid conditions',
        metadata: {}
      };
    }

    const action: ICombatAction = {
      type: 'basic_attack',
      intensity: 1.0,
      metadata: {}
    };

    if (!this.canPerformAction(action)) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Cannot perform action',
        metadata: {}
      };
    }

    const hitChance = this.calculateHitChance(target, action);
    const hit = Math.random() < hitChance;

    if (!hit) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: `${this.getName()} missed the attack!`,
        metadata: { hitChance }
      };
    }

    let damage = this.calculateDamage(action);
    const critical = this.isCriticalHit();

    if (critical) {
      damage = Math.floor(damage * 1.5);
    }

    // Apply damage to target (honoring their takeDamage contract)
    const damageResult = target.takeDamage(damage);

    // Player-specific: gain experience
    this.gainExperience(Math.floor(damage * 0.1));

    return {
      success: true,
      damage,
      critical,
      statusEffects: [],
      message: `${this.getName()} ${critical ? 'critically ' : ''}attacks for ${damage} damage!`,
      metadata: {
        experience: this.experience,
        level: this.level,
        targetKilled: !target.isAlive()
      }
    };
  }

  /**
   * Player-specific method: gain experience
   * Doesn't break LSP as it's an additional capability
   */
  public gainExperience(amount: number): void {
    this.experience += amount;
    
    // Simple level up system
    const newLevel = Math.floor(this.experience / 100) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      // Level up increases stats (strengthens postconditions, allowed by LSP)
      this._stats.strength += 2;
      this._stats.defense += 1;
      this._stats.agility += 1;
      this._stats.accuracy += 1;
    }
  }

  public getLevel(): number {
    return this.level;
  }

  public getExperience(): number {
    return this.experience;
  }
}

/**
 * Enemy Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export class EnemyCombatant extends CombatEntity {
  private enemyType: string;
  private aggressionLevel: number;
  private rewardExp: number;

  constructor(
    enemyType: string,
    maxHealth: number,
    stats: ICombatStatus['stats'],
    aggressionLevel: number = 0.5,
    rewardExp: number = 10
  ) {
    super(maxHealth, stats);
    this.enemyType = enemyType;
    this.aggressionLevel = Math.max(0, Math.min(1, aggressionLevel));
    this.rewardExp = rewardExp;
  }

  public getName(): string {
    return this.enemyType;
  }

  /**
   * Enemy attack implementation
   * Maintains LSP contract with AI-driven behavior
   */
  public attack(target: CombatEntity): ICombatResult {
    // Honor base class preconditions
    if (!target || !this.isAlive()) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Attack failed - invalid conditions',
        metadata: {}
      };
    }

    // Enemy-specific: choose attack type based on aggression
    const attackIntensity = 0.8 + (this.aggressionLevel * 0.4);
    const action: ICombatAction = {
      type: this.aggressionLevel > 0.7 ? 'aggressive_attack' : 'basic_attack',
      intensity: attackIntensity,
      metadata: { aggressionLevel: this.aggressionLevel }
    };

    if (!this.canPerformAction(action)) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Cannot perform action',
        metadata: {}
      };
    }

    const hitChance = this.calculateHitChance(target, action);
    const hit = Math.random() < hitChance;

    if (!hit) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: `${this.getName()} missed the attack!`,
        metadata: { hitChance, aggressionLevel: this.aggressionLevel }
      };
    }

    let damage = this.calculateDamage(action);
    const critical = this.isCriticalHit();

    if (critical) {
      damage = Math.floor(damage * 1.5);
    }

    // Apply damage to target (honoring their takeDamage contract)
    const damageResult = target.takeDamage(damage);

    return {
      success: true,
      damage,
      critical,
      statusEffects: [],
      message: `${this.getName()} ${critical ? 'critically ' : ''}attacks for ${damage} damage!`,
      metadata: {
        aggressionLevel: this.aggressionLevel,
        rewardExp: this.rewardExp,
        targetKilled: !target.isAlive()
      }
    };
  }

  /**
   * Enemy-specific method: get reward experience
   * Doesn't break LSP as it's an additional capability
   */
  public getRewardExperience(): number {
    return this.rewardExp;
  }

  /**
   * Enemy-specific method: increase aggression
   * Doesn't break LSP as it's an additional capability
   */
  public increaseAggression(amount: number): void {
    this.aggressionLevel = Math.min(1, this.aggressionLevel + amount);
  }
}

/**
 * NPC Combat Entity Implementation
 * Must maintain LSP compliance with CombatEntity
 */
export class NPCCombatant extends CombatEntity {
  private npcName: string;
  private faction: string;
  private isHostile: boolean;

  constructor(
    npcName: string,
    faction: string,
    maxHealth: number,
    stats: ICombatStatus['stats'],
    isHostile: boolean = false
  ) {
    super(maxHealth, stats);
    this.npcName = npcName;
    this.faction = faction;
    this.isHostile = isHostile;
  }

  public getName(): string {
    return this.npcName;
  }

  /**
   * NPC attack implementation
   * Maintains LSP contract with faction-based behavior
   */
  public attack(target: CombatEntity): ICombatResult {
    // Honor base class preconditions
    if (!target || !this.isAlive()) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Attack failed - invalid conditions',
        metadata: {}
      };
    }

    // NPC-specific: only attack if hostile or provoked
    if (!this.isHostile && !this._statusEffects.includes('provoked')) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: `${this.getName()} refuses to attack (not hostile)`,
        metadata: { faction: this.faction, isHostile: this.isHostile }
      };
    }

    const action: ICombatAction = {
      type: 'defensive_attack',
      intensity: 0.7, // NPCs attack more cautiously
      metadata: { faction: this.faction }
    };

    if (!this.canPerformAction(action)) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: 'Cannot perform action',
        metadata: {}
      };
    }

    const hitChance = this.calculateHitChance(target, action);
    const hit = Math.random() < hitChance;

    if (!hit) {
      return {
        success: false,
        damage: 0,
        critical: false,
        statusEffects: [],
        message: `${this.getName()} missed the attack!`,
        metadata: { hitChance, faction: this.faction }
      };
    }

    let damage = this.calculateDamage(action);
    const critical = this.isCriticalHit();

    if (critical) {
      damage = Math.floor(damage * 1.5);
    }

    // Apply damage to target (honoring their takeDamage contract)
    const damageResult = target.takeDamage(damage);

    return {
      success: true,
      damage,
      critical,
      statusEffects: [],
      message: `${this.getName()} ${critical ? 'critically ' : ''}attacks for ${damage} damage!`,
      metadata: {
        faction: this.faction,
        isHostile: this.isHostile,
        targetKilled: !target.isAlive()
      }
    };
  }

  /**
   * NPC-specific method: set hostility
   * Doesn't break LSP as it's an additional capability
   */
  public setHostile(hostile: boolean): void {
    this.isHostile = hostile;
    if (hostile) {
      this.applyStatusEffect('provoked');
    } else {
      this.removeStatusEffect('provoked');
    }
  }

  public getFaction(): string {
    return this.faction;
  }

  public getIsHostile(): boolean {
    return this.isHostile;
  }
}
