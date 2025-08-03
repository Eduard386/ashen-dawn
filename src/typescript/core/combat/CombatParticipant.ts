/**
 * Extended Combat Interfaces
 * Provides comprehensive interfaces for combat participants
 */

import { ICombatant as BaseICombatant } from '../interfaces/IEnemy';

/**
 * Extended Combat Participant Interface
 */
export interface IExtendedCombatant extends BaseICombatant {
  // Basic identification and naming
  getName(): string;
  getDisplayName(): string;
  
  // Action Points management
  getCurrentAP(): number;
  getMaxAP(): number;
  spendAP(amount: number): boolean;
  restoreAP(amount: number): void;
  
  // Weapon-related methods
  getWeaponSkill(): number;
  getWeaponRange(): number;
  getWeaponDamage(): number;
  getDamageBonus(): number;
  getWeaponName(): string;
  getWeaponAmmoType(): string;
  hasAmmo(ammoType: string, amount: number): boolean;
  consumeAmmo(ammoType: string, amount: number): boolean;
  
  // Defense capabilities
  getDefenseValue(): number;
  getArmorClass(): number;
  getDamageThreshold(): number;
  getDamageResistance(): number;
  
  // Skills and abilities
  getSkill(skillName: string): number;
  hasSkill(skillName: string): boolean;
  getSkillBonus(skillName: string): number;
  
  // Status and conditions
  isAlive(): boolean;
  isConscious(): boolean;
  canAct(): boolean;
  hasStatusEffect(effectName: string): boolean;
  
  // Combat positioning
  getPosition(): { x: number; y: number };
  setPosition(x: number, y: number): void;
  getDistanceTo(other: IExtendedCombatant): number;
  
  // Equipment management
  hasItem(itemId: string): boolean;
  getItemCount(itemId: string): number;
  useItem(itemId: string): boolean;
  
  // Experience and progression
  getLevel(): number;
  giveExperience(amount: number): void;
}

/**
 * Combat Participant Factory
 * Creates combat participants from various sources
 */
export interface ICombatantFactory {
  createFromPlayer(playerData: any): IExtendedCombatant;
  createFromEnemy(enemyData: any): IExtendedCombatant;
  createFromNPC(npcData: any): IExtendedCombatant;
}

/**
 * Basic Combat Participant Implementation
 * Provides default implementations for combat interface methods
 */
export abstract class BaseCombatant implements IExtendedCombatant {
  protected id: string;
  protected name: string;
  protected health: number;
  protected maxHealth: number;
  protected currentAP: number;
  protected maxAP: number;
  protected position: { x: number; y: number };
  protected skills: Map<string, number> = new Map();
  protected statusEffects: Set<string> = new Set();
  protected inventory: Map<string, number> = new Map();
  
  // Abstract properties that must be implemented
  abstract defence: any;
  
  constructor(id: string, name: string, health: number, maxHealth: number) {
    this.id = id;
    this.name = name;
    this.health = health;
    this.maxHealth = maxHealth;
    this.currentAP = 10; // Default action points
    this.maxAP = 10;
    this.position = { x: 0, y: 0 };
  }

  // Base ICombatant implementation
  public getId(): string {
    return this.id;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public getSkillValue(skill: string): number {
    return this.skills.get(skill) || 0;
  }

  // Extended interface implementation
  public getName(): string {
    return this.name;
  }

  public getDisplayName(): string {
    return this.name;
  }

  public getCurrentAP(): number {
    return this.currentAP;
  }

  public getMaxAP(): number {
    return this.maxAP;
  }

  public spendAP(amount: number): boolean {
    if (this.currentAP >= amount) {
      this.currentAP -= amount;
      return true;
    }
    return false;
  }

  public restoreAP(amount: number): void {
    this.currentAP = Math.min(this.maxAP, this.currentAP + amount);
  }

  // Default weapon implementations (should be overridden)
  public getWeaponSkill(): number {
    return this.getSkill('small_guns') || 50;
  }

  public getWeaponRange(): number {
    return 10; // Default range
  }

  public getWeaponDamage(): number {
    return 10; // Default damage
  }

  public getDamageBonus(): number {
    return Math.floor(this.getSkill('strength') / 10);
  }

  public getWeaponName(): string {
    return 'Fists';
  }

  public getWeaponAmmoType(): string {
    return 'none';
  }

  public hasAmmo(ammoType: string, amount: number): boolean {
    if (ammoType === 'none') return true;
    return (this.inventory.get(ammoType) || 0) >= amount;
  }

  public consumeAmmo(ammoType: string, amount: number): boolean {
    if (ammoType === 'none') return true;
    const current = this.inventory.get(ammoType) || 0;
    if (current >= amount) {
      this.inventory.set(ammoType, current - amount);
      return true;
    }
    return false;
  }

  // Default defense implementations
  public getDefenseValue(): number {
    return this.getArmorClass() + this.getSkill('dodge');
  }

  public getArmorClass(): number {
    return this.defence?.armorClass || 0;
  }

  public getDamageThreshold(): number {
    return this.defence?.damageThreshold || 0;
  }

  public getDamageResistance(): number {
    return this.defence?.damageResistance || 0;
  }

  // Skills implementation
  public getSkill(skillName: string): number {
    return this.skills.get(skillName) || 0;
  }

  public hasSkill(skillName: string): boolean {
    return this.skills.has(skillName);
  }

  public getSkillBonus(skillName: string): number {
    return Math.floor(this.getSkill(skillName) / 10);
  }

  public setSkill(skillName: string, value: number): void {
    this.skills.set(skillName, value);
  }

  // Status implementations
  public isAlive(): boolean {
    return this.health > 0;
  }

  public isConscious(): boolean {
    return this.health > 0;
  }

  public canAct(): boolean {
    return this.isAlive() && this.isConscious() && this.currentAP > 0;
  }

  public hasStatusEffect(effectName: string): boolean {
    return this.statusEffects.has(effectName);
  }

  public addStatusEffect(effectName: string): void {
    this.statusEffects.add(effectName);
  }

  public removeStatusEffect(effectName: string): void {
    this.statusEffects.delete(effectName);
  }

  // Position implementation
  public getPosition(): { x: number; y: number } {
    return { ...this.position };
  }

  public setPosition(x: number, y: number): void {
    this.position = { x, y };
  }

  public getDistanceTo(other: IExtendedCombatant): number {
    const otherPos = other.getPosition();
    const dx = this.position.x - otherPos.x;
    const dy = this.position.y - otherPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Inventory implementation
  public hasItem(itemId: string): boolean {
    return (this.inventory.get(itemId) || 0) > 0;
  }

  public getItemCount(itemId: string): number {
    return this.inventory.get(itemId) || 0;
  }

  public useItem(itemId: string): boolean {
    const count = this.inventory.get(itemId) || 0;
    if (count > 0) {
      this.inventory.set(itemId, count - 1);
      return true;
    }
    return false;
  }

  public addItem(itemId: string, quantity: number = 1): void {
    const current = this.inventory.get(itemId) || 0;
    this.inventory.set(itemId, current + quantity);
  }

  // Experience implementation (default)
  public getLevel(): number {
    return 1; // Override in derived classes
  }

  public giveExperience(amount: number): void {
    // Override in derived classes
  }

  // Healing
  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
