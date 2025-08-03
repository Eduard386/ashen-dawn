/**
 * LSP (Liskov Substitution Principle) System Index
 * Exports all LSP-compliant components
 */
export * from '../combat/LSPCombatSystem';
export * from '../services/LSPServiceBase';
export * from '../assets/LSPAssetSystem';
export * from '../validation/LSPValidators';
export * from '../processors/PolymorphicProcessors';
/**
 * LSP System Utilities
 */
export declare class LSPSystem {
    /**
     * Validate LSP compliance for a collection of base/subclass pairs
     */
    static validateCollectionCompliance<T>(baseClass: new (...args: any[]) => T, subClasses: (new (...args: any[]) => T)[], constructorArgs: any[]): Promise<boolean>;
    /**
     * Create a polymorphic processor for any collection
     */
    static createProcessor<T>(items: T[]): any;
    /**
     * Get system information
     */
    static getSystemInfo(): {
        name: string;
        version: string;
        description: string;
        components: string[];
        features: string[];
    };
}
