/**
 * EncounterManager - Single Responsibility: Battle Encounter Management
 *
 * Manages encounter data, battle transitions, and encounter-related state.
 * Handles encounter setup, data persistence during battle transitions.
 *
 * SRP Compliance:
 * ✅ Only handles encounter data and battle transitions
 * ✅ Does not handle combat logic or game state
 * ✅ Focused purely on encounter management and transition data
 */
export interface EncounterData {
    enemyType: string;
    playerLevel: number;
    encounterType?: 'random' | 'scripted' | 'boss';
    difficulty?: 'easy' | 'normal' | 'hard' | 'nightmare';
    location?: string;
    rewards?: {
        experience: number;
        loot: string[];
        special?: any;
    };
    conditions?: {
        timeLimit?: number;
        specialRules?: string[];
    };
}
export declare class EncounterManager {
    private currentEncounter;
    private encounterHistory;
    private maxHistorySize;
    private encounterCallbacks;
    private encounterTemplates;
    constructor();
    /**
     * Set encounter data for battle transition
     */
    setEncounterData(data: EncounterData): boolean;
    /**
     * Get current encounter data
     */
    getEncounterData(): EncounterData | null;
    /**
     * Update encounter data (for dynamic encounters)
     */
    updateEncounterData(updates: Partial<EncounterData>): boolean;
    /**
     * Clear current encounter data
     */
    clearEncounterData(): void;
    /**
     * Create encounter from template
     */
    createEncounterFromTemplate(templateName: string, overrides?: Partial<EncounterData>): EncounterData | null;
    /**
     * Register encounter template
     */
    registerEncounterTemplate(name: string, template: Partial<EncounterData>): void;
    /**
     * Get encounter template
     */
    getEncounterTemplate(name: string): Partial<EncounterData> | null;
    /**
     * Get all encounter template names
     */
    getEncounterTemplateNames(): string[];
    /**
     * Remove encounter template
     */
    removeEncounterTemplate(name: string): boolean;
    /**
     * Get encounter history
     */
    getEncounterHistory(): EncounterData[];
    /**
     * Get last encounter
     */
    getLastEncounter(): EncounterData | null;
    /**
     * Clear encounter history
     */
    clearEncounterHistory(): void;
    /**
     * Set maximum history size
     */
    setMaxHistorySize(size: number): void;
    /**
     * Check if encounter is active
     */
    hasActiveEncounter(): boolean;
    /**
     * Get encounter statistics
     */
    getEncounterStats(): {
        hasActiveEncounter: boolean;
        historySize: number;
        maxHistorySize: number;
        templateCount: number;
        callbackCount: {
            before: number;
            after: number;
        };
        encounterTypes: string[];
    };
    /**
     * Register encounter callback
     */
    onEncounter(event: 'before' | 'after', callback: (encounter: EncounterData) => void): void;
    /**
     * Remove encounter callback
     */
    removeEncounterCallback(event: 'before' | 'after', callback: (encounter: EncounterData) => void): boolean;
    /**
     * Clear all encounter callbacks
     */
    clearEncounterCallbacks(): void;
    /**
     * Generate random encounter
     */
    generateRandomEncounter(playerLevel: number, location?: string): EncounterData;
    /**
     * Validate encounter data
     */
    validateEncounterData(data: EncounterData): boolean;
    /**
     * Initialize default encounter templates
     */
    private initializeEncounterTemplates;
    /**
     * Add encounter to history
     */
    private addToHistory;
    /**
     * Trim history to maximum size
     */
    private trimHistory;
    /**
     * Execute encounter callbacks
     */
    private executeCallbacks;
}
