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

export class EncounterManager {
  private currentEncounter: EncounterData | null = null;
  private encounterHistory: EncounterData[] = [];
  private maxHistorySize: number = 20;
  private encounterCallbacks: Map<string, Array<(encounter: EncounterData) => void>> = new Map();
  private encounterTemplates: Map<string, Partial<EncounterData>> = new Map();

  constructor() {
    this.initializeEncounterTemplates();
  }

  /**
   * Set encounter data for battle transition
   */
  public setEncounterData(data: EncounterData): boolean {
    try {
      if (!this.validateEncounterData(data)) {
        console.error('Invalid encounter data provided');
        return false;
      }

      // Execute before-encounter callbacks
      this.executeCallbacks('before', data);

      // Store encounter data
      this.currentEncounter = { ...data };
      this.addToHistory(data);

      console.log(`Encounter set: ${data.enemyType} (Level ${data.playerLevel})`);
      return true;
    } catch (error) {
      console.error('Failed to set encounter data:', error);
      return false;
    }
  }

  /**
   * Get current encounter data
   */
  public getEncounterData(): EncounterData | null {
    return this.currentEncounter ? { ...this.currentEncounter } : null;
  }

  /**
   * Update encounter data (for dynamic encounters)
   */
  public updateEncounterData(updates: Partial<EncounterData>): boolean {
    if (!this.currentEncounter) {
      console.error('No active encounter to update');
      return false;
    }

    try {
      const updatedEncounter = { ...this.currentEncounter, ...updates };
      
      if (!this.validateEncounterData(updatedEncounter)) {
        console.error('Updated encounter data is invalid');
        return false;
      }

      this.currentEncounter = updatedEncounter;
      console.log('Encounter data updated successfully');
      return true;
    } catch (error) {
      console.error('Failed to update encounter data:', error);
      return false;
    }
  }

  /**
   * Clear current encounter data
   */
  public clearEncounterData(): void {
    if (this.currentEncounter) {
      // Execute after-encounter callbacks
      this.executeCallbacks('after', this.currentEncounter);
    }

    this.currentEncounter = null;
    console.log('Encounter data cleared');
  }

  /**
   * Create encounter from template
   */
  public createEncounterFromTemplate(templateName: string, overrides: Partial<EncounterData> = {}): EncounterData | null {
    const template = this.encounterTemplates.get(templateName);
    if (!template) {
      console.error(`Encounter template '${templateName}' not found`);
      return null;
    }

    try {
      const encounter: EncounterData = {
        enemyType: template.enemyType || 'Unknown',
        playerLevel: template.playerLevel || 1,
        ...template,
        ...overrides
      };

      if (!this.validateEncounterData(encounter)) {
        console.error('Created encounter data is invalid');
        return null;
      }

      return encounter;
    } catch (error) {
      console.error('Failed to create encounter from template:', error);
      return null;
    }
  }

  /**
   * Register encounter template
   */
  public registerEncounterTemplate(name: string, template: Partial<EncounterData>): void {
    this.encounterTemplates.set(name, template);
    console.log(`Encounter template '${name}' registered`);
  }

  /**
   * Get encounter template
   */
  public getEncounterTemplate(name: string): Partial<EncounterData> | null {
    return this.encounterTemplates.get(name) || null;
  }

  /**
   * Get all encounter template names
   */
  public getEncounterTemplateNames(): string[] {
    return Array.from(this.encounterTemplates.keys());
  }

  /**
   * Remove encounter template
   */
  public removeEncounterTemplate(name: string): boolean {
    return this.encounterTemplates.delete(name);
  }

  /**
   * Get encounter history
   */
  public getEncounterHistory(): EncounterData[] {
    return [...this.encounterHistory];
  }

  /**
   * Get last encounter
   */
  public getLastEncounter(): EncounterData | null {
    return this.encounterHistory.length > 0 
      ? { ...this.encounterHistory[this.encounterHistory.length - 1] }
      : null;
  }

  /**
   * Clear encounter history
   */
  public clearEncounterHistory(): void {
    this.encounterHistory = [];
    console.log('Encounter history cleared');
  }

  /**
   * Set maximum history size
   */
  public setMaxHistorySize(size: number): void {
    if (size < 0) {
      console.error('History size cannot be negative');
      return;
    }

    this.maxHistorySize = size;
    this.trimHistory();
  }

  /**
   * Check if encounter is active
   */
  public hasActiveEncounter(): boolean {
    return this.currentEncounter !== null;
  }

  /**
   * Get encounter statistics
   */
  public getEncounterStats(): {
    hasActiveEncounter: boolean;
    historySize: number;
    maxHistorySize: number;
    templateCount: number;
    callbackCount: {
      before: number;
      after: number;
    };
    encounterTypes: string[];
  } {
    const encounterTypes = new Set<string>();
    this.encounterHistory.forEach(encounter => {
      if (encounter.encounterType) {
        encounterTypes.add(encounter.encounterType);
      }
    });

    return {
      hasActiveEncounter: this.hasActiveEncounter(),
      historySize: this.encounterHistory.length,
      maxHistorySize: this.maxHistorySize,
      templateCount: this.encounterTemplates.size,
      callbackCount: {
        before: this.encounterCallbacks.get('before')?.length || 0,
        after: this.encounterCallbacks.get('after')?.length || 0
      },
      encounterTypes: Array.from(encounterTypes)
    };
  }

  /**
   * Register encounter callback
   */
  public onEncounter(event: 'before' | 'after', callback: (encounter: EncounterData) => void): void {
    if (!this.encounterCallbacks.has(event)) {
      this.encounterCallbacks.set(event, []);
    }
    this.encounterCallbacks.get(event)!.push(callback);
  }

  /**
   * Remove encounter callback
   */
  public removeEncounterCallback(event: 'before' | 'after', callback: (encounter: EncounterData) => void): boolean {
    const callbacks = this.encounterCallbacks.get(event);
    if (!callbacks) {
      return false;
    }

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all encounter callbacks
   */
  public clearEncounterCallbacks(): void {
    this.encounterCallbacks.clear();
  }

  /**
   * Generate random encounter
   */
  public generateRandomEncounter(playerLevel: number, location?: string): EncounterData {
    const enemyTypes = ['Raider', 'Cannibal', 'Mantis', 'Tribal Warrior'];
    const difficulties = ['easy', 'normal', 'hard'] as const;
    
    const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    return {
      enemyType: randomEnemy,
      playerLevel,
      encounterType: 'random',
      difficulty: randomDifficulty,
      location: location || 'Wasteland',
      rewards: {
        experience: playerLevel * 10,
        loot: ['Caps', 'Ammo'],
      }
    };
  }

  /**
   * Validate encounter data
   */
  public validateEncounterData(data: EncounterData): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Required fields
    if (!data.enemyType || typeof data.enemyType !== 'string') {
      return false;
    }

    if (typeof data.playerLevel !== 'number' || data.playerLevel < 1) {
      return false;
    }

    // Optional field validation
    if (data.encounterType && !['random', 'scripted', 'boss'].includes(data.encounterType)) {
      return false;
    }

    if (data.difficulty && !['easy', 'normal', 'hard', 'nightmare'].includes(data.difficulty)) {
      return false;
    }

    if (data.conditions?.timeLimit && (typeof data.conditions.timeLimit !== 'number' || data.conditions.timeLimit <= 0)) {
      return false;
    }

    return true;
  }

  // Private helper methods

  /**
   * Initialize default encounter templates
   */
  private initializeEncounterTemplates(): void {
    this.encounterTemplates.set('basic_raider', {
      enemyType: 'Raider',
      encounterType: 'random',
      difficulty: 'normal',
      rewards: {
        experience: 50,
        loot: ['Caps', 'Leather Armor']
      }
    });

    this.encounterTemplates.set('cannibal_ambush', {
      enemyType: 'Cannibal',
      encounterType: 'scripted',
      difficulty: 'hard',
      rewards: {
        experience: 75,
        loot: ['Meat', 'Bone Knife']
      }
    });

    this.encounterTemplates.set('mantis_swarm', {
      enemyType: 'Mantis',
      encounterType: 'random',
      difficulty: 'easy',
      rewards: {
        experience: 25,
        loot: ['Mantis Egg']
      }
    });
  }

  /**
   * Add encounter to history
   */
  private addToHistory(encounter: EncounterData): void {
    this.encounterHistory.push({ ...encounter });
    this.trimHistory();
  }

  /**
   * Trim history to maximum size
   */
  private trimHistory(): void {
    while (this.encounterHistory.length > this.maxHistorySize) {
      this.encounterHistory.shift();
    }
  }

  /**
   * Execute encounter callbacks
   */
  private executeCallbacks(event: 'before' | 'after', encounter: EncounterData): void {
    const callbacks = this.encounterCallbacks.get(event);
    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback, index) => {
      try {
        callback(encounter);
      } catch (error) {
        console.error(`${event} encounter callback ${index} failed:`, error);
      }
    });
  }
}
