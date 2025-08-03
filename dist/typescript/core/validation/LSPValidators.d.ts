/**
 * LSP Validation and Compliance Testing
 * Provides tools to validate Liskov Substitution Principle compliance
 */
/**
 * LSP Validation Result Interface
 */
export interface ILSPValidationResult {
    /** Overall compliance status */
    readonly compliant: boolean;
    /** Detailed test results */
    readonly results: ILSPTestResult[];
    /** Summary of violations */
    readonly violations: string[];
    /** Validation timestamp */
    readonly timestamp: Date;
    /** Performance metrics */
    readonly metrics: {
        readonly testsRun: number;
        readonly testsPassed: number;
        readonly testsFailed: number;
        readonly executionTime: number;
    };
}
/**
 * LSP Test Result Interface
 */
export interface ILSPTestResult {
    /** Test name */
    readonly name: string;
    /** Test success status */
    readonly passed: boolean;
    /** Test execution time */
    readonly duration: number;
    /** Error message if failed */
    readonly error?: string;
    /** Test metadata */
    readonly metadata: Record<string, any>;
}
/**
 * Contract Violation Interface
 */
export interface IContractViolation {
    /** Violation type */
    readonly type: 'precondition' | 'postcondition' | 'invariant' | 'behavioral';
    /** Method or property name */
    readonly member: string;
    /** Violation description */
    readonly description: string;
    /** Expected behavior */
    readonly expected: any;
    /** Actual behavior */
    readonly actual: any;
    /** Severity level */
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
}
/**
 * LSP Validator Class
 * Provides comprehensive LSP compliance testing
 */
export declare class LSPValidator {
    private testResults;
    private violations;
    /**
     * Validate substitutability between base class and subclass
     */
    validateSubstitution<T>(baseClassConstructor: new (...args: any[]) => T, subClassConstructor: new (...args: any[]) => T, constructorArgs: any[], testCases: ISubstitutionTestCase<T>[]): Promise<ILSPValidationResult>;
    /**
     * Validate contract preservation (preconditions, postconditions, invariants)
     */
    validateContractPreservation<T>(baseInstance: T, subInstance: T, contractSpecs: IContractSpec<T>[]): boolean;
    /**
     * Validate behavioral compatibility
     */
    validateBehaviorCompatibility<T>(baseInstance: T, subInstance: T, behaviorTests: IBehaviorTest<T>[]): boolean;
    /**
     * Run polymorphic collection tests
     */
    validatePolymorphicCollections<T>(baseClassConstructor: new (...args: any[]) => T, subClassConstructors: (new (...args: any[]) => T)[], constructorArgs: any[], collectionOperations: ICollectionOperation<T>[]): Promise<ILSPValidationResult>;
    private runSubstitutionTest;
    private runBehavioralTests;
    /**
     * Get appropriate test arguments for different method types
     */
    private getTestArgumentsForMethod;
    private runContractTests;
    private runCollectionOperation;
    private validatePreconditions;
    private validatePostconditions;
    private validateInvariants;
    private getCommonMethods;
    private getMethods;
}
/**
 * Supporting Interfaces for LSP Testing
 */
export interface ISubstitutionTestCase<T> {
    readonly name: string;
    execute(instance: T): any;
    validate(baseResult: any, subResult: any): boolean;
}
export interface IContractSpec<T> {
    readonly methodName: string;
    readonly preconditions: ((instance: T, ...args: any[]) => boolean)[];
    readonly postconditions: ((instance: T, result: any, ...args: any[]) => boolean)[];
    readonly invariants: ((instance: T) => boolean)[];
}
export interface IBehaviorTest<T> {
    readonly name: string;
    execute(instance: T): any;
    compare(baseResult: any, subResult: any): boolean;
}
export interface ICollectionOperation<T> {
    readonly name: string;
    execute(collection: T[]): any;
    validate(result: any): boolean;
}
/**
 * LSP Test Builder
 * Fluent interface for building LSP tests
 */
export declare class LSPTestBuilder<T> {
    private testCases;
    private contractSpecs;
    private behaviorTests;
    private collectionOperations;
    addSubstitutionTest(name: string, executor: (instance: T) => any, validator: (baseResult: any, subResult: any) => boolean): LSPTestBuilder<T>;
    addBehaviorTest(name: string, executor: (instance: T) => any, comparator: (baseResult: any, subResult: any) => boolean): LSPTestBuilder<T>;
    addCollectionOperation(name: string, operation: (collection: T[]) => any, validator: (result: any) => boolean): LSPTestBuilder<T>;
    getSubstitutionTests(): ISubstitutionTestCase<T>[];
    getBehaviorTests(): IBehaviorTest<T>[];
    getCollectionOperations(): ICollectionOperation<T>[];
}
/**
 * Common LSP Test Patterns
 */
export declare class LSPTestPatterns {
    /**
     * Create a basic method substitution test
     */
    static createMethodTest<T>(name: string, methodName: keyof T, args?: any[], resultValidator?: (baseResult: any, subResult: any) => boolean): ISubstitutionTestCase<T>;
    /**
     * Create a state preservation test
     */
    static createStateTest<T>(name: string, stateExtractor: (instance: T) => any, operation: (instance: T) => void, stateValidator: (beforeState: any, afterState: any) => boolean): ISubstitutionTestCase<T>;
    /**
     * Create a collection processing test
     */
    static createCollectionTest<T>(name: string, processor: (collection: T[]) => any, validator: (result: any, collection: T[]) => boolean): ICollectionOperation<T>;
}
