# Ashen Dawn
*A Post-Apocalyptic Survival RPG*

## Overview

Ashen Dawn is a browser-based post-apocalyptic role-playing game built with Phaser 3. Set in a harsh wasteland reminiscent of classic post-nuclear RPGs, players must survive encounters with dangerous creatures, hostile raiders, and mysterious tribes while managing resources, combat, and character progression.

## Game Features

### 🌍 World Exploration
- **World Map Travel**: Navigate through a post-apocalyptic wasteland with animated road sequences
- **Random Encounters**: Face unpredictable events while traveling, with outcomes influenced by survival skills
- **Multiple Encounter Types**: Combat encounters, peaceful negotiations, and skill-based challenges

### ⚔️ Combat System
- **Turn-Based Combat**: Strategic combat with various weapons and tactics
- **Diverse Weapon Arsenal**: 
  - Melee weapons (Baseball bat)
  - Small guns (9mm pistol, .44 Desert Eagle, .44 Magnum revolver, Combat shotgun, SMG)
  - Big guns (Minigun)
  - Energy weapons (Laser pistol, Laser rifle)
  - Explosives (Frag grenades)
- **Armor System**: Five armor types with different AC (Armor Class), damage threshold, and resistance values
- **Ammunition Management**: Different ammo types for different weapons with limited supply
- **Health & Medicine**: Health management with various medical items (First aid kits, Jet, Buffout, Mentats, Psycho)

#### Battle Process & Mechanics

**User Controls:**
- **Movement**: Arrow keys to scroll camera left/right across battlefield
- **Weapon Switching**: Up/Down arrow keys to cycle through available weapons
- **Firing**: Spacebar to shoot when crosshair is green (on target) and weapon is ready
- **Medical Items**: Z (First Aid Kit), X (Jet), C (Buffout), V (Mentats), B (Psycho)
- **Escape**: Shift key when escape button appears (random intervals)

**Combat Flow:**
1. **Initiative**: Player and enemies act simultaneously in real-time
2. **Targeting**: Red crosshair turns green when aimed at enemy hitbox
3. **Weapon Cooldown**: Each weapon has different fire rates and reload times
4. **Ammunition System**: Weapons require specific ammo types and have clip sizes

**Damage Calculation:**
1. **Hit Chance**: Based on player's skill with weapon type (Small Guns, Big Guns, Energy Weapons, Melee, Pyrotechnics)
2. **Armor Class Check**: Random roll vs enemy AC - if failed, damage is blocked
3. **Base Damage**: Random value between weapon's min/max damage × number of shots
4. **Damage Threshold**: Enemy armor absorbs fixed amount of damage
5. **Damage Resistance**: Percentage reduction after threshold
6. **Critical Hits**: Random chance based on critical percentage:
   - 1.5x damage (21-45% and <21% with armor)
   - 2x damage (46-90%, ignores armor)
   - 3x damage (91-97%, ignores armor)
   - Instant death (98%+, ignores armor)

**Enemy Behavior:**
- **Movement**: Enemies move back and forth across screen with random patterns
- **Attack Timing**: Random attack intervals (5-9 seconds)
- **Hit Chance**: Each enemy type has different accuracy
- **Weapon Damage**: Raiders use the same weapons as player with appropriate damage

**Health & Status System:**
- **Player Health**: Visual armor damage indicator shows current HP
- **Breathing Effects**: Audio cues when health drops below 50% (breathing) and 25% (heavy breathing)
- **Blood Effects**: Screen effects and camera shake when taking damage
- **Enemy Health**: Color-coded indicators (green/yellow/red) above enemies

**Medical Items Effects:**
- **First Aid Kit**: Restores 10-20 HP
- **Jet**: Reduces weapon cooldown by 25%, slows enemies by 4 seconds
- **Buffout**: Increases damage by 25%, adds +2 threshold and +25% resistance
- **Mentats**: Adds +10 AC and +5% critical chance
- **Psycho**: +10% damage, +1 threshold, +10% resistance, +5 AC, +3% critical, slows enemies by 2s

**Victory/Defeat Conditions:**
- **Victory**: Eliminate all enemies → proceed to VictoryScene for loot
- **Defeat**: Player health reaches 0 → game resets to level 1
- **Escape**: Use Shift when escape button appears → return to main menu

### 🎯 Skill System
The game features a comprehensive skill system with 12 different skills:
- **Combat Skills**:
  - Small Guns (pistols, rifles, shotguns)
  - Big Guns (heavy weapons)
  - Energy Weapons (laser weapons)
  - Melee Weapons (close combat)
  - Pyrotechnics (explosives)
- **Utility Skills**:
  - Lockpick (opening locked containers)
  - Science (technical knowledge)
  - Repair (fixing equipment)
  - Medicine (healing and drug use)
- **Social Skills**:
  - Barter (trading)
  - Speech (dialogue and persuasion)
  - Surviving (wilderness survival, avoiding encounters)

### 👥 Enemy Types
- **Creatures**:
  - **Rats** (weak but numerous)
  - **Mantis** (dangerous mutated insects)
- **Humanoid Enemies**:
  - **Tribal Warriors** (primitive weapons and tactics):
    - Tribe man 1, 2, 3, 4
    - Tribe woman 1, 2
  - **Cannibals** (desperate survivors turned hostile):
    - Cannibal man 1, 2, 3
    - Cannibal woman 1, 2
  - **Raiders** (well-equipped bandits with various weapons and armor combinations):
    - **Leather Jacket Raiders** (11 variants with different weapons):
      - Baseball bat, 9mm pistol, .44 Desert Eagle, .44 Magnum revolver
      - Combat shotgun, SMG, Laser pistol, Laser rifle
      - Frag grenade, Minigun
    - **Leather Armor Raiders** (7 variants with improved protection):
      - Baseball bat, 9mm pistol, .44 Desert Eagle, .44 Magnum revolver
      - Combat shotgun, SMG, Laser pistol
    - **Metal Armor Raiders** (7 variants with heavy protection):
      - Baseball bat, 9mm pistol, .44 Desert Eagle, .44 Magnum revolver
      - Combat shotgun, SMG, Laser pistol

### 🎮 Game Mechanics

#### Character Progression
- **Level System**: Gain experience through combat and successful encounters
- **Starting Equipment**: Begin with basic gear (Baseball bat, 9mm pistol, Leather Jacket)
- **Loot System**: Acquire better weapons, armor, and supplies from defeated enemies

#### Encounter System
- **Avoidance Mechanics**: High survival skill allows players to avoid some encounters
- **Dialogue Options**: Multiple conversation paths with skill checks
- **Consequence System**: Choices affect outcomes and available options

#### Audio Design
- **Dynamic Soundtrack**: Multiple background tracks that change based on situation
- **Combat Audio**: Weapon-specific sound effects for hits and misses
- **Character Audio**: Enemy-specific attack, wounded, and death sounds
- **Atmospheric Audio**: Breathing effects and environmental sounds

## Technical Implementation

### Architecture
- **Engine**: Phaser 3 (WebGL renderer)
- **Resolution**: 1024x600 pixels
- **Module System**: ES6 modules for clean code organization
- **Scene Management**: Six distinct game scenes

### Scene Structure
1. **MainMenu**: Game entry point with level display
2. **WorldMapScene**: Overworld travel with encounter system
3. **EncounterScene**: Non-combat encounters and dialogue
4. **BattleScene**: Turn-based combat interface
5. **VictoryScene**: Post-combat loot and progression
6. **DeadScene**: Game over screen

### Data Management
- **GameData Utility**: Centralized character state management
- **Enemy Database**: Comprehensive enemy definitions with stats and loot
- **Asset Management**: Organized asset loading and caching

### Core Game Systems (For OOP Refactoring)

#### 1. Character System
**Player Character Structure:**
```typescript
interface PlayerCharacter {
  levelCount: number;
  health: number;
  maxHealth: number;
  experience: number;
  skills: {
    small_guns: number;      // Default: 75
    big_guns: number;        // Default: 75
    energy_weapons: number;  // Default: 75
    melee_weapons: number;   // Default: 75
    pyrotechnics: number;    // Default: 75
    lockpick: number;        // Default: 75
    science: number;         // Default: 75
    repair: number;          // Default: 75
    medcine: number;         // Default: 75
    barter: number;          // Default: 75
    speech: number;          // Default: 75
    surviving: number;       // Default: 75
  };
  current_weapon: string;
  current_armor: string;
  weapons: string[];
  inventory: {
    med: {
      first_aid_kit: number;
      jet: number;
      buffout: number;
      mentats: number;
      psycho: number;
    };
    ammo: {
      mm_9: number;
      magnum_44: number;
      mm_12: number;
      mm_5_45: number;
      energy_cell: number;
      frag_grenade: number;
    };
  };
}
```

#### 2. Weapon System
**Weapon Configuration:**
```typescript
interface Weapon {
  name: string;
  skill: 'small_guns' | 'big_guns' | 'energy_weapons' | 'melee_weapons' | 'pyrotechnics';
  type: 'mm_9' | 'magnum_44' | 'mm_12' | 'mm_5_45' | 'energy_cell' | 'frag_grenade' | 'melee';
  cooldown: number; // milliseconds
  damage: { min: number; max: number; };
  clip: number;
  shots: number; // projectiles per shot
}
```

**Complete Weapon Database:**
- **Baseball bat**: melee, 3000ms cooldown, 3-10 damage, 1000 clip, 1 shot
- **9mm pistol**: small_guns, mm_9 ammo, 5000ms cooldown, 10-24 damage, 12 clip, 1 shot
- **Laser pistol**: energy_weapons, energy_cell ammo, 6000ms cooldown, 10-22 damage, 12 clip, 1 shot
- **44 Desert Eagle**: small_guns, magnum_44 ammo, 5000ms cooldown, 20-32 damage, 8 clip, 1 shot
- **Frag grenade**: pyrotechnics, frag_grenade ammo, 4000ms cooldown, 20-35 damage, 1 clip, 1 shot
- **44 Magnum revolver**: small_guns, magnum_44 ammo, 4000ms cooldown, 24-36 damage, 6 clip, 1 shot
- **Laser rifle**: energy_weapons, energy_cell ammo, 5000ms cooldown, 25-50 damage, 12 clip, 1 shot
- **Combat shotgun**: small_guns, mm_12 ammo, 6000ms cooldown, 15-25 damage, 12 clip, 3 shots
- **SMG**: small_guns, mm_9 ammo, 6000ms cooldown, 5-12 damage, 30 clip, 10 shots
- **Minigun**: big_guns, mm_5_45 ammo, 6000ms cooldown, 7-11 damage, 40 clip, 40 shots

#### 3. Armor System
**Armor Configuration:**
```typescript
interface Armor {
  name: string;
  ac: number;         // Armor Class (miss chance)
  threshold: number;  // Damage reduction (flat)
  resistance: number; // Damage reduction (percentage)
}
```

**Complete Armor Database:**
- **Leather Jacket**: AC 8, threshold 0, resistance 20%
- **Leather Armor**: AC 15, threshold 2, resistance 25%
- **Metal Armor**: AC 10, threshold 4, resistance 30%
- **Combat Armor**: AC 20, threshold 5, resistance 40%
- **Power Armor**: AC 25, threshold 12, resistance 40%

#### 4. Enemy System
**Enemy Configuration:**
```typescript
interface Enemy {
  name: string;
  type: 'creature' | 'human';
  maxLevel: number;
  defence: {
    health: number;
    ac: number;
    threshold: number;
    resistance: number;
  };
  attack: {
    hit_chance: number;
    weapon?: string;
    damage: { min: number; max: number; };
    shots: number;
  };
  amount: { min: number; max: number; };
  experience: number;
  title: string[]; // sprite variants
}
```

**Enemy Specifications:**
- **Rat**: 6 HP, AC 6, 40% hit chance, 2 damage, 25 XP, 6-10 spawns
- **Mantis**: 25 HP, AC 13, 20% resistance, 50% hit chance, 5-8 damage, 50 XP, 1-4 spawns
- **Tribe**: 30 HP, AC 5, 60% hit chance, Spear weapon, 3-10 damage, 50 XP, 2-4 spawns
- **Cannibals**: 30 HP, AC 5, 60% hit chance, Knife weapon, 1-6 damage, 50 XP, 2-4 spawns
- **Raiders**: 30 HP, AC 5, 60% hit chance, various weapons, 75 XP, 1-4 spawns

#### 5. Medical System
**Medical Item Effects:**
```typescript
interface MedicalItem {
  name: string;
  effect: {
    health?: { min: number; max: number; };
    weaponCooldownReduction?: number; // percentage
    damageBonus?: number; // percentage
    thresholdBonus?: number;
    resistanceBonus?: number; // percentage
    acBonus?: number;
    criticalBonus?: number; // percentage
    enemySlowDuration?: number; // milliseconds
  };
}
```

**Medical Items Database:**
- **First Aid Kit**: Restores 10-20 HP
- **Jet**: -25% weapon cooldown, slows enemies 4000ms
- **Buffout**: +25% damage, +2 threshold, +25% resistance
- **Mentats**: +10 AC, +5% critical chance
- **Psycho**: +10% damage, +1 threshold, +10% resistance, +5 AC, +3% critical, slows enemies 2000ms

#### 6. Loot System
**Loot Configuration:**
```typescript
interface LootTable {
  weaponLoot: { [weaponIndex: number]: AmmoReward };
  medicalDropChance: number; // 25% chance
  armorUpgradeLogic: 'best_available';
}

interface AmmoReward {
  ammoType: string;
  amount: { min: number; max: number; };
}
```

**Weapon Index to Loot Mapping:**
- Index 0 (Baseball bat): No ammo reward
- Index 1 (Laser pistol): 2-6 energy cells
- Index 2 (9mm pistol): 4-8 9mm rounds
- Index 3 (44 Desert Eagle): 2-6 .44 rounds
- Index 4 (Frag grenade): 3-5 grenades
- Index 5 (44 Magnum): 2-6 .44 rounds
- Index 6 (Laser rifle): 2-6 energy cells
- Index 7 (Combat shotgun): 6-12 12mm shells
- Index 8 (SMG): 10-30 9mm rounds
- Index 9 (Minigun): 80-160 5.45mm rounds

#### 7. Encounter System
**Encounter Configuration:**
```typescript
interface EncounterSystem {
  encounterTimer: { min: 3000; max: 6000 }; // milliseconds
  avoidanceCheck: 'surviving_skill'; // percentage chance
  dialogueOptions: string[];
  skillChecks: {
    speech: number; // skill threshold
    science: number;
    repair: number;
    medicine: number;
  };
  outcomes: {
    success: 'skill_reward';
    failure: 'combat_or_leave';
  };
}
```

#### 8. Audio System
**Audio Configuration:**
```typescript
interface AudioSystem {
  soundtracks: string[]; // 7 background tracks
  weaponSounds: {
    hit: string;
    miss: string[]; // 3 variants per weapon
  };
  enemySounds: {
    attack: string;
    wounded: string;
    died: string;
  };
  playerSounds: {
    breathing: { threshold: 50 }; // % health
    hardBreathing: { threshold: 25 }; // % health
    wounded: string;
    sipPill: string;
    reload: string;
  };
}
```

#### 9. Combat Mechanics
**Critical Hit System:**
- Roll 1-100 against critical_chance (default varies by stats)
- **1-20%**: 1.5x damage (with armor calculation)
- **21-45%**: 1.5x damage (ignores armor)
- **46-90%**: 2x damage (ignores armor)
- **91-97%**: 3x damage (ignores armor)
- **98-100%**: Instant death (ignores armor)

**Damage Calculation Flow:**
1. Check hit chance vs weapon skill
2. If hit: roll vs enemy AC
3. If AC passed: calculate base damage
4. Apply critical hit multiplier (if applicable)
5. Subtract damage threshold
6. Apply damage resistance percentage
7. Deal final damage

#### 10. Camera and UI System
**Camera Configuration:**
- **Battlefield Width**: 2048 pixels
- **Viewport**: 1024x600 pixels
- **Scroll Speed**: Variable (arrows)
- **Crosshair System**: Red (not targeting) / Green (on target)
- **Health Display**: Visual armor degradation mask
- **Ammo Display**: Icon + count, positioned at (25, 495)

### Service Layer Architecture (For SOLID Principles)

#### Required Services:
1. **GameStateService**: Manage player data and persistence
2. **WeaponService**: Handle weapon switching, firing, reloading
3. **ArmorService**: Manage armor stats and visual updates
4. **EnemyService**: Enemy creation, AI, and behavior
5. **CombatService**: Damage calculation and combat resolution
6. **LootService**: Post-battle rewards and item distribution
7. **AudioService**: Sound management and dynamic music
8. **EncounterService**: Random encounter generation and dialogue
9. **SkillService**: Skill checks and character progression
10. **UIService**: Interface updates and user input handling

### Event System (For Decoupling)
```typescript
interface GameEvents {
  'player.health.changed': { newHealth: number; maxHealth: number };
  'weapon.fired': { weapon: Weapon; target?: Enemy };
  'enemy.died': { enemy: Enemy; experience: number };
  'loot.received': { items: LootItem[] };
  'skill.check': { skill: string; difficulty: number; success: boolean };
  'scene.transition': { from: string; to: string };
}
```

## Asset Organization

### Visual Assets
- **Backgrounds**: Battle scenes, menu screens, encounter locations
- **Character Sprites**: Detailed enemy and equipment artwork
- **UI Elements**: Health indicators, crosshairs, buttons, ammo icons
- **Equipment**: Weapons, armor, and medical item graphics

### Audio Assets
- **Music**: Multiple soundtracks for different game states
- **Sound Effects**: Weapon sounds, enemy vocals, environmental audio
- **Voice Acting**: Character-specific vocal responses

## Installation & Setup

### Prerequisites
- Modern web browser with JavaScript enabled
- Web server (for local development due to ES6 module requirements)

### Running the Game
1. Clone the repository
2. Install dependencies: `npm install`
3. Start a local web server in the project directory
4. Open `index.html` in your browser

### Development Setup
```bash
git clone <repository-url>
cd ashen-dawn
npm install
# Start your preferred local server (e.g., Live Server, http-server)
```

## Game Configuration

### Weapon Statistics
Each weapon has specific properties:
- **Skill Requirements**: Associated skill for accuracy
- **Damage Range**: Minimum and maximum damage values
- **Cooldown Time**: Time between shots
- **Ammunition Type**: Required ammo type
- **Clip Size**: Rounds per reload
- **Shots per Turn**: Number of projectiles fired

### Armor Statistics
Armor provides protection through:
- **AC (Armor Class)**: Base protection value
- **Damage Threshold**: Minimum damage negation
- **Damage Resistance**: Percentage damage reduction

### Enemy Scaling
- **Level-Based Encounters**: Enemy difficulty scales with player level
- **Group Encounters**: Enemies appear in varied group sizes
- **Equipment Variation**: Raiders have diverse weapon/armor combinations

## Future Development Roadmap

### Planned Features
- **Expanded World**: Additional locations and quest lines
- **Crafting System**: Item creation and modification
- **Character Customization**: Attribute allocation and specialization
- **Save System**: Progress persistence between sessions
- **Advanced AI**: Improved enemy behavior and tactics
- **Trading System**: NPC merchants and bartering mechanics
- **Vehicle Travel**: Faster map traversal with resource costs

### Technical Improvements
- **Mobile Compatibility**: Touch controls and responsive design
- **Performance Optimization**: Asset compression and loading improvements
- **Audio Enhancement**: Spatial audio and dynamic mixing
- **Visual Effects**: Particle systems and animation improvements

## Refactoring Specifications

### TypeScript Migration Plan

#### Phase 1: Core Interfaces
```typescript
// Character and game state interfaces
interface PlayerStats, WeaponStats, ArmorStats, EnemyStats
interface GameState, InventoryState, CombatState
interface LootTable, EncounterConfig, AudioConfig
```

#### Phase 2: Service Layer
```typescript
// Business logic services following SOLID principles
class GameStateService implements IGameStateService
class WeaponService implements IWeaponService  
class CombatService implements ICombatService
class AudioService implements IAudioService
```

#### Phase 3: Scene Refactoring
```typescript
// Convert Phaser scenes to use dependency injection
class BattleScene extends Phaser.Scene {
  constructor(
    private weaponService: IWeaponService,
    private combatService: ICombatService,
    private audioService: IAudioService
  )
}
```

### Testing Strategy (Jest)

#### Unit Tests Required:

**Combat System Tests:**
```typescript
describe('CombatService', () => {
  test('calculateDamage with critical hit')
  test('calculateDamage with armor penetration')
  test('calculateDamage with damage threshold')
  test('calculateDamage with resistance')
  test('applyMedicalItem effects')
})
```

**Weapon System Tests:**
```typescript
describe('WeaponService', () => {
  test('switchWeapon updates current weapon')
  test('fireWeapon respects cooldown')
  test('reloadWeapon handles ammunition')
  test('getWeaponDamage returns correct range')
})
```

**Enemy System Tests:**
```typescript
describe('EnemyService', () => {
  test('createEnemy generates correct stats')
  test('enemyAttack calculates hit chance')
  test('parseRaiderEquipment extracts weapon/armor')
  test('setMovementPattern creates valid tween')
})
```

**Loot System Tests:**
```typescript
describe('LootService', () => {
  test('generateLoot from weapon index')
  test('generateMedicalLoot with 25% chance')
  test('determineBestArmor from defeated enemies')
  test('distributeLoot updates inventory')
})
```

**Skill System Tests:**
```typescript
describe('SkillService', () => {
  test('performSkillCheck against difficulty')
  test('getSkillBonus for weapon accuracy')
  test('calculateExperienceGain from combat')
})
```

**Game State Tests:**
```typescript
describe('GameStateService', () => {
  test('initializePlayer with default stats')
  test('updatePlayerHealth with bounds checking')
  test('saveGameState persistence')
  test('resetGameState to defaults')
})
```

#### Integration Tests Required:

**Combat Flow Tests:**
```typescript
describe('Combat Integration', () => {
  test('full combat round: player fires -> enemy attacks -> damage resolution')
  test('enemy death -> experience gain -> loot generation')
  test('player death -> game reset flow')
  test('escape sequence -> return to world map')
})
```

**Encounter Flow Tests:**
```typescript
describe('Encounter Integration', () => {
  test('random encounter generation -> skill check -> outcome')
  test('dialogue progression -> skill success -> reward')
  test('dialogue failure -> combat transition')
})
```

#### Mock Requirements:

**Phaser Mocks:**
```typescript
// Mock Phaser.Scene, Phaser.Game, Phaser.Input
// Mock audio, graphics, tweens systems
// Mock random number generation for deterministic tests
```

**Asset Mocks:**
```typescript
// Mock image loading, audio loading
// Mock sprite creation and animation
// Mock input handling
```

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
- **WeaponService**: Only weapon-related operations
- **CombatService**: Only damage calculation and combat resolution
- **AudioService**: Only sound and music management
- **UIService**: Only interface updates and visual feedback

#### Open/Closed Principle (OCP)
- **IWeapon interface**: Extendable for new weapon types
- **IEnemy interface**: Extendable for new enemy variants
- **ILootGenerator**: Extendable for new loot mechanics
- **ISkillCheck**: Extendable for new skill types

#### Liskov Substitution Principle (LSP)
- All weapon implementations must be interchangeable
- All enemy types must follow same combat interface
- All scene transitions must follow same flow pattern

#### Interface Segregation Principle (ISP)
- **ICombatant**: Basic combat properties only
- **IMoveable**: Movement-specific methods only
- **ILootable**: Loot-generation methods only
- **ISkillUser**: Skill-check methods only

#### Dependency Inversion Principle (DIP)
- Services depend on interfaces, not concrete implementations
- Scenes receive services via dependency injection
- Configuration data injected rather than hardcoded

### Code Quality Standards

#### ESLint Configuration:
```json
{
  "extends": ["@typescript-eslint/recommended"],
  "rules": {
    "no-magic-numbers": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Required Design Patterns:
- **Factory Pattern**: Enemy and weapon creation
- **Observer Pattern**: Game events and UI updates
- **Strategy Pattern**: Different combat calculations
- **Command Pattern**: Player actions and undo functionality
- **Singleton Pattern**: Game state management (where appropriate)

## Contributing

This project serves as a foundation for a larger post-apocalyptic RPG. The codebase is structured for expansion and modification. Key areas for contribution include:

- Additional enemy types and behaviors
- New weapon and equipment types
- Expanded dialogue and encounter scenarios
- Visual and audio asset improvements
- Game balance and progression tuning

## License

[Add appropriate license information]

---

*Ashen Dawn - Survive the wasteland, one encounter at a time.*