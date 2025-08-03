/**
 * Strategy Pattern Infrastructure
 * Provides flexible algorithm selection and extension
 */
/**
 * Chain Execution Modes
 */
export var ChainExecutionMode;
(function (ChainExecutionMode) {
    /** Execute first applicable strategy only */
    ChainExecutionMode["FIRST_MATCH"] = "first_match";
    /** Execute all applicable strategies in order */
    ChainExecutionMode["ALL_APPLICABLE"] = "all_applicable";
    /** Execute until one strategy succeeds */
    ChainExecutionMode["UNTIL_SUCCESS"] = "until_success";
    /** Execute strategies based on priority */
    ChainExecutionMode["PRIORITY_ORDER"] = "priority_order";
})(ChainExecutionMode || (ChainExecutionMode = {}));
/**
 * Abstract Strategy Base Class
 */
export class AbstractStrategy {
    constructor(name, description, priority = 0, metadata = {}) {
        this.name = name;
        this.description = description;
        this.priority = priority;
        this.metadata = metadata;
    }
    canHandle(input) {
        // Default implementation - override for specific logic
        return true;
    }
    getMetadata() {
        return { ...this.metadata };
    }
    setMetadata(key, value) {
        this.metadata[key] = value;
    }
}
/**
 * Strategy Context Implementation
 */
export class StrategyContext {
    constructor(selector) {
        this.strategies = new Map();
        this.strategySelector = selector || new PriorityStrategySelector();
    }
    addStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
    }
    removeStrategy(strategyName) {
        this.strategies.delete(strategyName);
    }
    async execute(input) {
        const applicableStrategies = this.getApplicableStrategies(input);
        const selectedStrategy = this.strategySelector.selectStrategy(applicableStrategies, input);
        if (!selectedStrategy) {
            throw new Error('No applicable strategy found for input');
        }
        return await selectedStrategy.execute(input);
    }
    async executeWith(strategyName, input) {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Strategy '${strategyName}' not found`);
        }
        if (!strategy.canHandle(input)) {
            throw new Error(`Strategy '${strategyName}' cannot handle the provided input`);
        }
        return await strategy.execute(input);
    }
    getStrategies() {
        return Array.from(this.strategies.values());
    }
    getApplicableStrategies(input) {
        return Array.from(this.strategies.values()).filter(strategy => strategy.canHandle(input));
    }
    setStrategySelector(selector) {
        this.strategySelector = selector;
    }
}
/**
 * Priority-based Strategy Selector
 */
export class PriorityStrategySelector {
    selectStrategy(strategies, input) {
        if (strategies.length === 0) {
            return undefined;
        }
        // Sort by priority (highest first) and select the first one
        return strategies.sort((a, b) => b.priority - a.priority)[0];
    }
}
/**
 * Random Strategy Selector
 */
export class RandomStrategySelector {
    selectStrategy(strategies, input) {
        if (strategies.length === 0) {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * strategies.length);
        return strategies[randomIndex];
    }
}
/**
 * Weighted Strategy Selector
 */
export class WeightedStrategySelector {
    selectStrategy(strategies, input) {
        if (strategies.length === 0) {
            return undefined;
        }
        // Use priority as weight
        const totalWeight = strategies.reduce((sum, strategy) => sum + Math.max(1, strategy.priority), 0);
        let random = Math.random() * totalWeight;
        for (const strategy of strategies) {
            random -= Math.max(1, strategy.priority);
            if (random <= 0) {
                return strategy;
            }
        }
        return strategies[strategies.length - 1];
    }
}
/**
 * Strategy Chain Implementation
 */
export class StrategyChain {
    constructor() {
        this.strategies = [];
        this.executionMode = ChainExecutionMode.FIRST_MATCH;
    }
    addStrategy(strategy) {
        this.strategies.push(strategy);
        return this;
    }
    setExecutionMode(mode) {
        this.executionMode = mode;
    }
    async execute(input) {
        const applicableStrategies = this.strategies.filter(strategy => strategy.canHandle(input));
        if (applicableStrategies.length === 0) {
            throw new Error('No applicable strategies in chain');
        }
        switch (this.executionMode) {
            case ChainExecutionMode.FIRST_MATCH:
                return await applicableStrategies[0].execute(input);
            case ChainExecutionMode.PRIORITY_ORDER:
                const sortedStrategies = applicableStrategies.sort((a, b) => b.priority - a.priority);
                return await sortedStrategies[0].execute(input);
            case ChainExecutionMode.UNTIL_SUCCESS:
                return await this.executeUntilSuccess(applicableStrategies, input);
            case ChainExecutionMode.ALL_APPLICABLE:
                return await this.executeAll(applicableStrategies, input);
            default:
                throw new Error(`Unsupported execution mode: ${this.executionMode}`);
        }
    }
    async executeUntilSuccess(strategies, input) {
        let lastError;
        for (const strategy of strategies) {
            try {
                return await strategy.execute(input);
            }
            catch (error) {
                lastError = error;
                continue;
            }
        }
        throw lastError || new Error('All strategies failed');
    }
    async executeAll(strategies, input) {
        const results = [];
        for (const strategy of strategies) {
            try {
                const result = await strategy.execute(input);
                results.push(result);
            }
            catch (error) {
                console.warn(`Strategy ${strategy.name} failed:`, error);
            }
        }
        // Return the last successful result, or throw if none succeeded
        if (results.length === 0) {
            throw new Error('All strategies failed');
        }
        return results[results.length - 1];
    }
}
/**
 * Strategy Registry
 * Central registry for managing strategies across the application
 */
export class StrategyRegistry {
    constructor() {
        this.contexts = new Map();
        this.chains = new Map();
    }
    /**
     * Register a strategy context for a domain
     */
    registerContext(domain, context) {
        this.contexts.set(domain, context);
    }
    /**
     * Get strategy context for a domain
     */
    getContext(domain) {
        return this.contexts.get(domain);
    }
    /**
     * Register a strategy to a domain
     */
    registerStrategy(domain, strategy) {
        let context = this.contexts.get(domain);
        if (!context) {
            context = new StrategyContext();
            this.contexts.set(domain, context);
        }
        context.addStrategy(strategy);
    }
    /**
     * Register a strategy chain for a domain
     */
    registerChain(domain, chain) {
        this.chains.set(domain, chain);
    }
    /**
     * Get strategy chain for a domain
     */
    getChain(domain) {
        return this.chains.get(domain);
    }
    /**
     * Execute strategy in a domain
     */
    async executeStrategy(domain, input) {
        const context = this.getContext(domain);
        if (!context) {
            throw new Error(`No strategy context registered for domain: ${domain}`);
        }
        return await context.execute(input);
    }
    /**
     * Get all registered domains
     */
    getDomains() {
        const contextDomains = Array.from(this.contexts.keys());
        const chainDomains = Array.from(this.chains.keys());
        return Array.from(new Set([...contextDomains, ...chainDomains]));
    }
}
//# sourceMappingURL=StrategySystem.js.map