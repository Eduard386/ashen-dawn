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
export declare class ServiceRegistry {
    private services;
    private initialized;
    constructor();
    /**
     * Initialize default game services
     */
    private initializeDefaultServices;
    /**
     * Register a service instance
     */
    registerService<T>(key: string, service: T): void;
    /**
     * Get a registered service
     */
    getService<T>(key: string): T | null;
    /**
     * Get player service
     */
    getPlayerService(): PlayerService;
    /**
     * Get weapon service
     */
    getWeaponService(): WeaponService;
    /**
     * Get enemy service
     */
    getEnemyService(): EnemyService;
    /**
     * Get combat service
     */
    getCombatService(): CombatService;
    /**
     * Check if a service is registered
     */
    hasService(key: string): boolean;
    /**
     * Unregister a service
     */
    unregisterService(key: string): boolean;
    /**
     * Get all registered service keys
     */
    getRegisteredServices(): string[];
    /**
     * Get service registry statistics
     */
    getRegistryStats(): {
        totalServices: number;
        registeredServices: string[];
        initialized: boolean;
    };
    /**
     * Clear all services (for testing)
     */
    clearServices(): void;
    /**
     * Reinitialize all default services
     */
    reinitialize(): void;
    /**
     * Check if registry is properly initialized
     */
    isInitialized(): boolean;
    /**
     * Validate that all required services are available
     */
    validateServices(): {
        valid: boolean;
        missing: string[];
        available: string[];
    };
}
