/**
 * Abstract Base Plugin Class
 * Provides common plugin functionality
 */
export class BasePlugin {
    constructor(id, name, version, description, dependencies = []) {
        this.enabled = true;
        this.initialized = false;
        this.id = id;
        this.name = name;
        this.version = version;
        this.description = description;
        this.dependencies = dependencies;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        await this.onInitialize();
        this.initialized = true;
    }
    async destroy() {
        if (!this.initialized) {
            return;
        }
        await this.onDestroy();
        this.initialized = false;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isInitialized() {
        return this.initialized;
    }
}
/**
 * Plugin Manager
 * Concrete implementation of plugin registry
 */
export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.configs = new Map();
        this.dependencyGraph = new Map();
    }
    register(plugin, config) {
        if (this.plugins.has(plugin.id)) {
            throw new Error(`Plugin ${plugin.id} is already registered`);
        }
        this.plugins.set(plugin.id, plugin);
        if (config) {
            this.configs.set(plugin.id, config);
        }
        this.dependencyGraph.set(plugin.id, plugin.dependencies);
    }
    unregister(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
            plugin.destroy();
        }
        this.plugins.delete(pluginId);
        this.configs.delete(pluginId);
        this.dependencyGraph.delete(pluginId);
    }
    getPlugin(pluginId) {
        return this.plugins.get(pluginId);
    }
    getPluginsByType(type) {
        const result = [];
        for (const plugin of this.plugins.values()) {
            if (plugin instanceof type) {
                result.push(plugin);
            }
        }
        return result;
    }
    async initializeAll() {
        const initOrder = this.resolveInitializationOrder();
        for (const pluginId of initOrder) {
            const plugin = this.plugins.get(pluginId);
            if (plugin && plugin.isEnabled()) {
                await plugin.initialize();
            }
        }
    }
    async destroyAll() {
        // Destroy in reverse order
        const initOrder = this.resolveInitializationOrder();
        for (let i = initOrder.length - 1; i >= 0; i--) {
            const plugin = this.plugins.get(initOrder[i]);
            if (plugin) {
                await plugin.destroy();
            }
        }
    }
    getRegisteredPlugins() {
        return Array.from(this.plugins.keys());
    }
    hasPlugin(pluginId) {
        return this.plugins.has(pluginId);
    }
    setPluginEnabled(pluginId, enabled) {
        const plugin = this.plugins.get(pluginId);
        if (plugin) {
            plugin.setEnabled(enabled);
        }
    }
    /**
     * Resolve plugin initialization order based on dependencies
     * Uses topological sort to handle dependencies
     */
    resolveInitializationOrder() {
        const visited = new Set();
        const visiting = new Set();
        const result = [];
        const visit = (pluginId) => {
            if (visiting.has(pluginId)) {
                throw new Error(`Circular dependency detected involving plugin: ${pluginId}`);
            }
            if (visited.has(pluginId)) {
                return;
            }
            visiting.add(pluginId);
            const dependencies = this.dependencyGraph.get(pluginId) || [];
            for (const depId of dependencies) {
                if (!this.plugins.has(depId)) {
                    throw new Error(`Plugin ${pluginId} depends on ${depId}, but ${depId} is not registered`);
                }
                visit(depId);
            }
            visiting.delete(pluginId);
            visited.add(pluginId);
            result.push(pluginId);
        };
        for (const pluginId of this.plugins.keys()) {
            visit(pluginId);
        }
        return result;
    }
}
//# sourceMappingURL=PluginSystem.js.map