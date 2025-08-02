/**
 * Enemy Service SRP Components
 * Exporting all specialized enemy management components
 */

// Template Management
export { EnemyTemplateManager, IEnemyTemplate } from './EnemyTemplateManager';

// Instance Creation
export { EnemyInstanceFactory, IEnemyInstance } from './EnemyInstanceFactory';

// Spawn Management
export { EnemySpawnManager, ISpawnConfig, ISpawnResult } from './EnemySpawnManager';

// Health Management
export { 
  EnemyHealthManager, 
  HealthStatus, 
  IDamageResult, 
  IHealingResult 
} from './EnemyHealthManager';

// Legacy Conversion
export { LegacyEnemyConverter, IConversionResult } from './LegacyEnemyConverter';

// Sprite Management
export { 
  EnemySpriteManager, 
  SpriteSelectionStrategy, 
  ISpriteSelectionResult,
  ISpriteMetadata
} from './EnemySpriteManager';

// Main Orchestrator
export { ModernEnemyService } from './ModernEnemyService';
