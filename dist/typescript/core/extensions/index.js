/**
 * Core Extensions Module
 * Entry point for the Open/Closed Principle extension system
 */
// Export all extension system components
export * from './PluginSystem';
export * from './EventSystem';
export * from './FactorySystem';
export * from './StrategySystem';
export * from './ExtensionManager';
// Re-export commonly used types and classes
export { BasePlugin, PluginManager, EventBus, BaseEvent, EventTypes, RegistryFactory, FactoryBuilder, AbstractStrategy, StrategyContext, StrategyRegistry, ExtensionManager, GlobalExtensionManager, Extension, Plugin, Strategy, Factory } from './ExtensionManager';
//# sourceMappingURL=index.js.map