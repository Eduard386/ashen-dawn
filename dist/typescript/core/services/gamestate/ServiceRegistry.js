import { PlayerService } from '../PlayerService.js';
import { WeaponService } from '../WeaponService.js';
import { EnemyService } from '../EnemyService.js';
import { CombatService } from '../CombatService.js';
/**
 * ServiceRegistry - Single Responsibility: Service Locator and Instance Management
 *
 * Handles the registration, retrieval, and management of game service instances.
 * Implements the Service Locator pattern to decouple service dependencies.
 *
 * SRP Compliance:
 * ✅ Only manages service registration and lookup
 * ✅ Does not handle service logic or business rules
 * ✅ Focused purely on dependency injection and service location
 */
export class ServiceRegistry {
    constructor() {
        this.services = new Map();
        this.initialized = false;
        this.initializeDefaultServices();
    }
    /**
     * Initialize default game services
     */
    initializeDefaultServices() {
        if (this.initialized) {
            return;
        }
        // Register core services
        this.registerService('player', PlayerService.getInstance());
        this.registerService('weapon', WeaponService.getInstance());
        this.registerService('enemy', EnemyService.getInstance());
        this.registerService('combat', CombatService.getInstance());
        this.initialized = true;
    }
    /**
     * Register a service instance
     */
    registerService(key, service) {
        if (this.services.has(key)) {
            console.warn(`Service '${key}' is already registered. Overwriting.`);
        }
        this.services.set(key, service);
    }
    /**
     * Get a registered service
     */
    getService(key) {
        const service = this.services.get(key);
        if (!service) {
            console.error(`Service '${key}' is not registered`);
            return null;
        }
        return service;
    }
    /**
     * Get player service
     */
    getPlayerService() {
        const service = this.getService('player');
        if (!service) {
            throw new Error('PlayerService not available');
        }
        return service;
    }
    /**
     * Get weapon service
     */
    getWeaponService() {
        const service = this.getService('weapon');
        if (!service) {
            throw new Error('WeaponService not available');
        }
        return service;
    }
    /**
     * Get enemy service
     */
    getEnemyService() {
        const service = this.getService('enemy');
        if (!service) {
            throw new Error('EnemyService not available');
        }
        return service;
    }
    /**
     * Get combat service
     */
    getCombatService() {
        const service = this.getService('combat');
        if (!service) {
            throw new Error('CombatService not available');
        }
        return service;
    }
    /**
     * Check if a service is registered
     */
    hasService(key) {
        return this.services.has(key);
    }
    /**
     * Unregister a service
     */
    unregisterService(key) {
        return this.services.delete(key);
    }
    /**
     * Get all registered service keys
     */
    getRegisteredServices() {
        return Array.from(this.services.keys());
    }
    /**
     * Get service registry statistics
     */
    getRegistryStats() {
        return {
            totalServices: this.services.size,
            registeredServices: this.getRegisteredServices(),
            initialized: this.initialized
        };
    }
    /**
     * Clear all services (for testing)
     */
    clearServices() {
        this.services.clear();
        this.initialized = false;
    }
    /**
     * Reinitialize all default services
     */
    reinitialize() {
        this.clearServices();
        this.initializeDefaultServices();
    }
    /**
     * Check if registry is properly initialized
     */
    isInitialized() {
        return this.initialized && this.services.size > 0;
    }
    /**
     * Validate that all required services are available
     */
    validateServices() {
        const requiredServices = ['player', 'weapon', 'enemy', 'combat'];
        const missing = [];
        const available = [];
        requiredServices.forEach(service => {
            if (this.hasService(service)) {
                available.push(service);
            }
            else {
                missing.push(service);
            }
        });
        return {
            valid: missing.length === 0,
            missing,
            available
        };
    }
}
//# sourceMappingURL=ServiceRegistry.js.map