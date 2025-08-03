/**
 * Core Extensions Module
 * Entry point for the Open/Closed Principle extension system
 */
export * from './PluginSystem';
export * from './EventSystem';
export * from './FactorySystem';
export * from './StrategySystem';
export * from './ExtensionManager';
export { IPlugin, BasePlugin, PluginManager, IEvent, IEventListener, EventBus, BaseEvent, EventTypes, IFactory, IRegistryFactory, RegistryFactory, FactoryBuilder, IStrategy, IStrategyContext, AbstractStrategy, StrategyContext, StrategyRegistry, IExtensionManager, ExtensionManager, GlobalExtensionManager, Extension, Plugin, Strategy, Factory } from './ExtensionManager';
