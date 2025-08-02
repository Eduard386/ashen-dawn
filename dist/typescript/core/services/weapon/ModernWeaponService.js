import { WeaponRegistry } from './WeaponRegistry.js';
import { WeaponQueryEngine } from './WeaponQueryEngine.js';
import { WeaponClassifier } from './WeaponClassifier.js';
import { WeaponDamageCalculator } from './WeaponDamageCalculator.js';
import { LegacyWeaponConverter } from './LegacyWeaponConverter.js';
import { WeaponDatabaseLoader } from './WeaponDatabaseLoader.js';
/**
 * Modern Weapon Service - Single Responsibility: Weapon System Orchestration
 *
 * Responsible ONLY for:
 * - Coordinating weapon system components
 * - Providing unified weapon system interface
 * - Managing component initialization and lifecycle
 *
 * NOT responsible for:
 * - Direct weapon storage (delegated to registry)
 * - Complex queries (delegated to query engine)
 * - Damage calculations (delegated to calculator)
 * - Classification logic (delegated to classifier)
 * - Legacy conversion (delegated to converter)
 * - Data loading (delegated to loader)
 */
export class ModernWeaponService {
    constructor() {
        this.initialized = false;
        // Initialize components with dependency injection
        this.weaponRegistry = new WeaponRegistry();
        this.queryEngine = new WeaponQueryEngine(this.weaponRegistry);
        this.classifier = new WeaponClassifier(this.weaponRegistry);
        this.damageCalculator = new WeaponDamageCalculator(this.weaponRegistry);
        this.legacyConverter = new LegacyWeaponConverter();
        this.databaseLoader = new WeaponDatabaseLoader(this.weaponRegistry);
    }
    static getInstance() {
        if (!ModernWeaponService.instance) {
            ModernWeaponService.instance = new ModernWeaponService();
        }
        return ModernWeaponService.instance;
    }
    /**
     * Initialize the weapon service with default data
     */
    async initializeService() {
        if (this.initialized) {
            console.log('Weapon service already initialized');
            return;
        }
        try {
            // Load default weapons using the database loader
            const loadResult = this.databaseLoader.loadDefaultWeapons();
            if (loadResult.loaded > 0) {
                this.initialized = true;
                console.log(`Weapon service initialized successfully with ${loadResult.loaded} weapons`);
                if (loadResult.failed > 0) {
                    console.warn(`${loadResult.failed} weapons failed to load:`, loadResult.errors);
                }
            }
            else {
                throw new Error('Failed to load any weapons');
            }
        }
        catch (error) {
            console.error('Failed to initialize weapon service:', error);
            throw error;
        }
    }
    /**
     * Check if service is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    // === WEAPON REGISTRY OPERATIONS ===
    /**
     * Get weapon by name
     */
    getWeapon(name) {
        return this.weaponRegistry.getWeapon(name);
    }
    /**
     * Get all weapons
     */
    getAllWeapons() {
        return this.weaponRegistry.getAllWeapons();
    }
    /**
     * Check if weapon exists
     */
    hasWeapon(name) {
        return this.weaponRegistry.hasWeapon(name);
    }
    /**
     * Register new weapon
     */
    registerWeapon(weapon) {
        this.weaponRegistry.registerWeapon(weapon);
    }
    // === WEAPON QUERY OPERATIONS ===
    /**
     * Get weapons by skill type
     */
    getWeaponsBySkill(skill) {
        return this.queryEngine.getWeaponsBySkill(skill);
    }
    /**
     * Get weapons by ammo type
     */
    getWeaponsByAmmoType(ammoType) {
        return this.queryEngine.getWeaponsByAmmoType(ammoType);
    }
    /**
     * Search weapons by name
     */
    searchWeapons(pattern) {
        return this.queryEngine.searchWeaponsByName(pattern);
    }
    /**
     * Get top weapons by criteria
     */
    getTopWeapons(count, sortBy = 'damage') {
        return this.queryEngine.getTopWeapons(count, sortBy);
    }
    // === WEAPON CLASSIFICATION OPERATIONS ===
    /**
     * Check if weapon is ranged
     */
    isRangedWeapon(weaponName) {
        return this.classifier.isRangedWeapon(weaponName);
    }
    /**
     * Check if weapon is melee
     */
    isMeleeWeapon(weaponName) {
        return this.classifier.isMeleeWeapon(weaponName);
    }
    /**
     * Get weapon classification
     */
    getWeaponClassification(weaponName) {
        return this.classifier.getWeaponClassification(weaponName);
    }
    /**
     * Check if weapon is automatic
     */
    isAutomaticWeapon(weaponName) {
        return this.classifier.isAutomaticWeapon(weaponName);
    }
    // === DAMAGE CALCULATION OPERATIONS ===
    /**
     * Get weapon damage range as string
     */
    getDamageRangeString(weaponName) {
        return this.damageCalculator.getDamageRangeString(weaponName);
    }
    /**
     * Calculate average damage for weapon
     */
    getAverageDamage(weaponName) {
        return this.damageCalculator.getAverageDamage(weaponName);
    }
    /**
     * Calculate damage per second
     */
    getDamagePerSecond(weaponName) {
        return this.damageCalculator.getDamagePerSecond(weaponName);
    }
    /**
     * Compare damage between weapons
     */
    compareDamage(weapon1, weapon2) {
        return this.damageCalculator.compareDamage(weapon1, weapon2);
    }
    /**
     * Get all weapon damage statistics
     */
    getAllWeaponDamageStats() {
        return this.damageCalculator.getAllWeaponDamageStats();
    }
    // === LEGACY CONVERSION OPERATIONS ===
    /**
     * Convert legacy weapon name to standardized format
     */
    convertLegacyName(legacyName) {
        return this.legacyConverter.convertLegacyName(legacyName);
    }
    /**
     * Check if name is in legacy format
     */
    isLegacyFormat(weaponName) {
        return this.legacyConverter.isLegacyFormat(weaponName);
    }
    /**
     * Convert legacy weapon data
     */
    convertLegacyWeaponData(legacyData) {
        return this.legacyConverter.convertLegacyWeaponData(legacyData);
    }
    // === SYSTEM STATUS AND MANAGEMENT ===
    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            weaponCount: this.weaponRegistry.getWeaponCount(),
            components: {
                registry: !!this.weaponRegistry,
                queryEngine: !!this.queryEngine,
                classifier: !!this.classifier,
                damageCalculator: !!this.damageCalculator,
                legacyConverter: !!this.legacyConverter,
                databaseLoader: !!this.databaseLoader
            },
            statistics: {
                registrationStats: this.weaponRegistry.getRegistrationStats(),
                queryStats: this.queryEngine.getQueryStats(),
                classificationStats: this.classifier.getClassificationStats(),
                calculationStats: this.damageCalculator.getCalculationStats(),
                conversionStats: this.legacyConverter.getConversionStats(),
                loadingStats: this.databaseLoader.getLoadingStats()
            }
        };
    }
    /**
     * Validate all components are working correctly
     */
    validateAllComponents() {
        try {
            // Test each component
            const testWeapon = this.weaponRegistry.getWeapon('9mm_pistol');
            if (!testWeapon)
                return false;
            const queryResult = this.queryEngine.getWeaponsBySkill('small_guns');
            if (!Array.isArray(queryResult))
                return false;
            const classification = this.classifier.getWeaponClassification('9mm_pistol');
            if (!classification.exists)
                return false;
            const damage = this.damageCalculator.getAverageDamage('9mm_pistol');
            if (damage <= 0)
                return false;
            const converted = this.legacyConverter.convertLegacyName('9mm pistol');
            if (!converted)
                return false;
            return true;
        }
        catch (error) {
            console.error('Component validation failed:', error);
            return false;
        }
    }
    /**
     * Get individual component instances (for advanced usage)
     */
    getWeaponRegistry() {
        return this.weaponRegistry;
    }
    getQueryEngine() {
        return this.queryEngine;
    }
    getClassifier() {
        return this.classifier;
    }
    getDamageCalculator() {
        return this.damageCalculator;
    }
    getLegacyConverter() {
        return this.legacyConverter;
    }
    getDatabaseLoader() {
        return this.databaseLoader;
    }
    /**
     * Reset the entire weapon system
     */
    resetSystem() {
        this.weaponRegistry.clearWeapons();
        this.queryEngine.clearQueryHistory();
        this.classifier.clearCache();
        this.damageCalculator.clearCalculationHistory();
        this.legacyConverter.clearConversionHistory();
        this.databaseLoader.clearLoadingHistory();
        this.initialized = false;
    }
    /**
     * Export weapon system data for backup
     */
    exportSystemData() {
        return {
            weapons: this.weaponRegistry.exportWeapons(),
            statistics: this.getSystemStatus().statistics,
            timestamp: Date.now()
        };
    }
    /**
     * Import weapon system data from backup
     */
    importSystemData(data) {
        this.resetSystem();
        return this.weaponRegistry.importWeapons(data.weapons);
    }
}
//# sourceMappingURL=ModernWeaponService.js.map