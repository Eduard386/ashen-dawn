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
  private services: Map<string, any> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeDefaultServices();
  }

  /**
   * Initialize default game services
   */
  private initializeDefaultServices(): void {
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
  public registerService<T>(key: string, service: T): void {
    if (this.services.has(key)) {
      console.warn(`Service '${key}' is already registered. Overwriting.`);
    }
    this.services.set(key, service);
  }

  /**
   * Get a registered service
   */
  public getService<T>(key: string): T | null {
    const service = this.services.get(key);
    if (!service) {
      console.error(`Service '${key}' is not registered`);
      return null;
    }
    return service as T;
  }

  /**
   * Get player service
   */
  public getPlayerService(): PlayerService {
    const service = this.getService<PlayerService>('player');
    if (!service) {
      throw new Error('PlayerService not available');
    }
    return service;
  }

  /**
   * Get weapon service
   */
  public getWeaponService(): WeaponService {
    const service = this.getService<WeaponService>('weapon');
    if (!service) {
      throw new Error('WeaponService not available');
    }
    return service;
  }

  /**
   * Get enemy service
   */
  public getEnemyService(): EnemyService {
    const service = this.getService<EnemyService>('enemy');
    if (!service) {
      throw new Error('EnemyService not available');
    }
    return service;
  }

  /**
   * Get combat service
   */
  public getCombatService(): CombatService {
    const service = this.getService<CombatService>('combat');
    if (!service) {
      throw new Error('CombatService not available');
    }
    return service;
  }

  /**
   * Check if a service is registered
   */
  public hasService(key: string): boolean {
    return this.services.has(key);
  }

  /**
   * Unregister a service
   */
  public unregisterService(key: string): boolean {
    return this.services.delete(key);
  }

  /**
   * Get all registered service keys
   */
  public getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get service registry statistics
   */
  public getRegistryStats(): {
    totalServices: number;
    registeredServices: string[];
    initialized: boolean;
  } {
    return {
      totalServices: this.services.size,
      registeredServices: this.getRegisteredServices(),
      initialized: this.initialized
    };
  }

  /**
   * Clear all services (for testing)
   */
  public clearServices(): void {
    this.services.clear();
    this.initialized = false;
  }

  /**
   * Reinitialize all default services
   */
  public reinitialize(): void {
    this.clearServices();
    this.initializeDefaultServices();
  }

  /**
   * Check if registry is properly initialized
   */
  public isInitialized(): boolean {
    return this.initialized && this.services.size > 0;
  }

  /**
   * Validate that all required services are available
   */
  public validateServices(): {
    valid: boolean;
    missing: string[];
    available: string[];
  } {
    const requiredServices = ['player', 'weapon', 'enemy', 'combat'];
    const missing: string[] = [];
    const available: string[] = [];

    requiredServices.forEach(service => {
      if (this.hasService(service)) {
        available.push(service);
      } else {
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
