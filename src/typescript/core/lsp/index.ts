/**
 * LSP (Liskov Substitution Principle) System Index
 * Exports all LSP-compliant components
 */

// Combat System
export * from '../combat/LSPCombatSystem';

// Service System
export * from '../services/LSPServiceBase';

// Asset System
export * from '../assets/LSPAssetSystem';

// Validation System
export * from '../validation/LSPValidators';

// Polymorphic Processors
export * from '../processors/PolymorphicProcessors';

/**
 * LSP System Utilities
 */
export class LSPSystem {
  /**
   * Validate LSP compliance for a collection of base/subclass pairs
   */
  static async validateCollectionCompliance<T>(
    baseClass: new (...args: any[]) => T,
    subClasses: (new (...args: any[]) => T)[],
    constructorArgs: any[]
  ): Promise<boolean> {
    const { LSPValidator } = await import('../validation/LSPValidators');
    const validator = new LSPValidator();
    
    for (const SubClass of subClasses) {
      const result = await validator.validateSubstitution(
        baseClass,
        SubClass,
        constructorArgs,
        []
      );
      
      if (!result.compliant) {
        console.error(`LSP violation detected in ${SubClass.name}:`, result.violations);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Create a polymorphic processor for any collection
   */
  static createProcessor<T>(items: T[]) {
    const { ProcessorFactory } = require('../processors/PolymorphicProcessors');
    return ProcessorFactory.createAutoProcessor(items);
  }

  /**
   * Get system information
   */
  static getSystemInfo() {
    return {
      name: 'LSP System',
      version: '1.0.0',
      description: 'Liskov Substitution Principle implementation for Ashen Dawn',
      components: [
        'CombatEntity hierarchy',
        'ServiceBase hierarchy', 
        'Asset hierarchy',
        'LSP Validators',
        'Polymorphic Processors'
      ],
      features: [
        'Substitutable subclasses',
        'Contract preservation',
        'Behavioral compatibility',
        'Polymorphic collections',
        'Validation framework'
      ]
    };
  }
}
