import { IWeapon } from '../../interfaces/IWeapon.js';

/**
 * Weapon Registry - Single Responsibility: Weapon Storage and Retrieval
 * 
 * Responsible ONLY for:
 * - Storing weapon definitions
 * - Retrieving weapons by name
 * - Managing weapon database state
 * 
 * NOT responsible for:
 * - Weapon classification logic
 * - Damage calculations
 * - Legacy data conversion
 * - Complex querying/filtering
 */
export class WeaponRegistry {
  private weapons: Map<string, IWeapon> = new Map();
  private registrationHistory: Array<{ name: string, timestamp: number }> = [];

  /**
   * Register a weapon in the registry
   */
  public registerWeapon(weapon: IWeapon): void {
    this.weapons.set(weapon.name, { ...weapon }); // Deep copy to prevent external mutations
    this.registrationHistory.push({
      name: weapon.name,
      timestamp: Date.now()
    });
  }

  /**
   * Register multiple weapons at once
   */
  public registerWeapons(weapons: IWeapon[]): void {
    weapons.forEach(weapon => this.registerWeapon(weapon));
  }

  /**
   * Get weapon by name
   */
  public getWeapon(name: string): IWeapon | null {
    const weapon = this.weapons.get(name);
    return weapon ? { ...weapon } : null; // Return copy to prevent mutation
  }

  /**
   * Check if weapon exists in registry
   */
  public hasWeapon(name: string): boolean {
    return this.weapons.has(name);
  }

  /**
   * Get all weapon names
   */
  public getWeaponNames(): string[] {
    return Array.from(this.weapons.keys());
  }

  /**
   * Get all weapons (as copies)
   */
  public getAllWeapons(): IWeapon[] {
    return Array.from(this.weapons.values()).map(weapon => ({ ...weapon }));
  }

  /**
   * Remove weapon from registry
   */
  public removeWeapon(name: string): boolean {
    return this.weapons.delete(name);
  }

  /**
   * Clear all weapons
   */
  public clearWeapons(): void {
    this.weapons.clear();
    this.registrationHistory = [];
  }

  /**
   * Get weapon count
   */
  public getWeaponCount(): number {
    return this.weapons.size;
  }

  /**
   * Validate weapon data structure
   */
  public validateWeapon(weapon: IWeapon): boolean {
    return !!(
      weapon.name &&
      typeof weapon.name === 'string' &&
      weapon.skill &&
      weapon.ammoType &&
      weapon.damage &&
      typeof weapon.damage.min === 'number' &&
      typeof weapon.damage.max === 'number' &&
      weapon.damage.min <= weapon.damage.max &&
      typeof weapon.cooldown === 'number' &&
      weapon.cooldown >= 0 &&
      typeof weapon.clipSize === 'number' &&
      weapon.clipSize > 0 &&
      typeof weapon.shotsPerAttack === 'number' &&
      weapon.shotsPerAttack > 0
    );
  }

  /**
   * Get registration statistics
   */
  public getRegistrationStats(): {
    totalWeapons: number;
    registrationHistory: Array<{ name: string, timestamp: number }>;
    oldestRegistration: number | null;
    newestRegistration: number | null;
  } {
    const timestamps = this.registrationHistory.map(entry => entry.timestamp);
    
    return {
      totalWeapons: this.weapons.size,
      registrationHistory: [...this.registrationHistory],
      oldestRegistration: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestRegistration: timestamps.length > 0 ? Math.max(...timestamps) : null
    };
  }

  /**
   * Export weapons for backup/serialization
   */
  public exportWeapons(): Record<string, IWeapon> {
    const exported: Record<string, IWeapon> = {};
    this.weapons.forEach((weapon, name) => {
      exported[name] = { ...weapon };
    });
    return exported;
  }

  /**
   * Import weapons from backup/serialization
   */
  public importWeapons(weaponData: Record<string, IWeapon>): {
    imported: number;
    failed: number;
    errors: string[];
  } {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    Object.values(weaponData).forEach(weapon => {
      if (this.validateWeapon(weapon)) {
        this.registerWeapon(weapon);
        imported++;
      } else {
        failed++;
        errors.push(`Invalid weapon data for: ${weapon.name || 'unknown'}`);
      }
    });

    return { imported, failed, errors };
  }
}
