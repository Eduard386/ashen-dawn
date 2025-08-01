// Phase 3 SRP: Single Responsibility Combat Services
// Export all decomposed combat service components

export { HitChanceCalculator } from './HitChanceCalculator.js';
export { DamageCalculator } from './DamageCalculator.js';
export { AmmoManager } from './AmmoManager.js';
export { ArmorCalculator, type IArmorInfo } from './ArmorCalculator.js';
export { ExperienceCalculator, type IExperienceCalculation } from './ExperienceCalculator.js';
export { CombatMessageGenerator } from './CombatMessageGenerator.js';
export { ModernCombatService } from './ModernCombatService.js';

// Re-export types for convenience
export type {
  ICombatResult,
  IDamageCalculation,
  IHitCalculation,
  ICriticalCalculation
} from '../../interfaces/ICombatSegregated.js';
