/**
 * Weapon Service SRP Implementation - Export Index
 *
 * This module exports all Single Responsibility Principle compliant
 * weapon service components and their interfaces.
 */
export { WeaponRegistry } from './WeaponRegistry.js';
export { WeaponQueryEngine } from './WeaponQueryEngine.js';
export { WeaponClassifier, type WeaponClassification } from './WeaponClassifier.js';
export { WeaponDamageCalculator, type DamageComparison, type WeaponDamageStats } from './WeaponDamageCalculator.js';
export { LegacyWeaponConverter } from './LegacyWeaponConverter.js';
export { WeaponDatabaseLoader } from './WeaponDatabaseLoader.js';
export { ModernWeaponService } from './ModernWeaponService.js';
export type { WeaponSkillType, AmmoType } from '../../types/GameTypes.js';
export type { IWeapon } from '../../interfaces/IWeapon.js';
