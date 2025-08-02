/**
 * Enemy Service SRP Components
 * Exporting all specialized enemy management components
 */
export { EnemyTemplateManager, IEnemyTemplate } from './EnemyTemplateManager';
export { EnemyInstanceFactory, IEnemyInstance } from './EnemyInstanceFactory';
export { EnemySpawnManager, ISpawnConfig, ISpawnResult } from './EnemySpawnManager';
export { EnemyHealthManager, HealthStatus, IDamageResult, IHealingResult } from './EnemyHealthManager';
export { LegacyEnemyConverter, IConversionResult } from './LegacyEnemyConverter';
export { EnemySpriteManager, SpriteSelectionStrategy, ISpriteSelectionResult, ISpriteMetadata } from './EnemySpriteManager';
export { ModernEnemyService } from './ModernEnemyService';
