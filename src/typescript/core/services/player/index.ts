// Phase 3 SRP: Single Responsibility Player Services
// Export all decomposed player service components

export { PlayerDataManager } from './PlayerDataManager.js';
export { HealthManager } from './HealthManager.js';
export { ExperienceManager } from './ExperienceManager.js';
export { EquipmentManager } from './EquipmentManager.js';
export { LegacyPlayerConverter } from './LegacyPlayerConverter.js';
export { ModernPlayerService } from './ModernPlayerService.js';

// Re-export types for convenience
export type {
  IHealthManager,
  IExperienceManager,
  IEquipmentManager
} from '../../interfaces/IPlayerSegregated.js';
