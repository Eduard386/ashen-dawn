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
export {
  // Plugin System
  IPlugin,
  BasePlugin,
  PluginManager,
  
  // Event System
  IEvent,
  IEventListener,
  EventBus,
  BaseEvent,
  EventTypes,
  
  // Factory System
  IFactory,
  IRegistryFactory,
  RegistryFactory,
  FactoryBuilder,
  
  // Strategy System
  IStrategy,
  IStrategyContext,
  AbstractStrategy,
  StrategyContext,
  StrategyRegistry,
  
  // Extension Manager
  IExtensionManager,
  ExtensionManager,
  GlobalExtensionManager,
  Extension,
  Plugin,
  Strategy,
  Factory
} from './ExtensionManager';
