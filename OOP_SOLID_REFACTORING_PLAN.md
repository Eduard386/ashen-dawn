# Ashen Dawn: OOP/SOLID Refactoring Plan

## Project Architecture Overview

### Current State Analysis
- **Languages**: TypeScript (23 files), Phaser 3 Game Engine
- **Architecture Pattern**: Service-oriented with singleton pattern
- **Main Components**: 
  - 7 Services (GameDataService, AssetLoaderService, PlayerService, CombatService, WeaponService, EnemyService, GameStateService)
  - 6 Scenes (Loading, MainMenu, WorldMap, Battle, Victory, Dead)
  - 4 Interfaces (IPlayer, IWeapon, IEnemy, ICombat)
  - Core types and utilities

### Current Architecture Violations

#### Single Responsibility Principle (SRP) Violations
1. **GameDataService**: Handles both data persistence AND game state management
2. **BattleScene**: Manages UI, combat logic, AND asset management
3. **PlayerService**: Handles player data, level calculations, AND inventory management

#### Open/Closed Principle (OCP) Violations
1. **WeaponService**: Hard-coded weapon types, difficult to add new weapons
2. **EnemyService**: Fixed enemy generation logic, not extensible
3. **CombatService**: Monolithic damage calculations, hard to modify formulas

#### Liskov Substitution Principle (LSP) Violations
1. **ICombatant interface**: Not properly implemented by Player and Enemy
2. **Scene inheritance**: Inconsistent method signatures across scenes

#### Interface Segregation Principle (ISP) Violations
1. **IPlayer interface**: Too large, mixes character stats with inventory
2. **IEnemy interface**: Combines stats, behavior, and rendering data

#### Dependency Inversion Principle (DIP) Violations
1. **Scenes**: Directly depend on concrete service implementations
2. **Services**: Tightly coupled to specific data formats
3. **No dependency injection**: Hard-coded singleton patterns

## Phase-by-Phase Refactoring Plan

### Phase 1: Setup Testing Infrastructure ⚡
**Objective**: Establish Jest testing framework with comprehensive test coverage

#### 1.1 Jest Configuration
- [ ] Install Jest with TypeScript support
- [ ] Configure Jest for ES6 modules
- [ ] Setup test utilities and mocks
- [ ] Create testing folder structure

#### 1.2 Initial Test Coverage
- [ ] Unit tests for existing services (baseline)
- [ ] Integration tests for scene transitions
- [ ] Mock Phaser dependencies
- [ ] Establish test coverage targets (80%+)

**Deliverables**:
- `jest.config.ts` with full TypeScript support
- Test utilities in `src/__tests__/utils/`
- Baseline test suite with 50%+ coverage

---

### Phase 2: Interface Segregation (ISP) ⚡
**Objective**: Break down large interfaces into focused, single-purpose contracts

#### 2.1 Player Interface Segregation
```typescript
// Before: One large interface
interface IPlayer { /* 15+ properties */ }

// After: Segregated interfaces
interface ICharacterStats { health, maxHealth, experience, levelCount }
interface ICharacterSkills { small_guns, big_guns, ... }
interface ICharacterInventory { med, ammo }
interface ICharacterEquipment { currentWeapon, currentArmor, weapons }
```

#### 2.2 Enemy Interface Segregation
```typescript
// Segregate into focused interfaces
interface IEnemyStats { health, armorClass, damageThreshold }
interface IEnemyBehavior { attack, spawning }
interface IEnemyRendering { sprites, name, type }
```

#### 2.3 Combat Interface Segregation
```typescript
interface IDamageCalculator { calculateDamage(), applyResistance() }
interface IHitChanceCalculator { calculateHit(), checkCritical() }
interface ICombatLogger { logAttack(), logDamage(), logResult() }
```

**Tests**: Unit tests for each segregated interface
**Deliverables**: 12+ focused interfaces replacing 4 large ones

---

### Phase 3: Single Responsibility (SRP) ⚡
**Objective**: Ensure each class has one reason to change

#### 3.1 Data vs Business Logic Separation
```typescript
// Split GameDataService
class GameDataRepository { save(), load(), persist() }
class GameStateManager { updateState(), resetState(), validateState() }
class PlayerDataRepository { savePlayer(), loadPlayer() }
```

#### 3.2 Scene Responsibility Separation
```typescript
// Split BattleScene responsibilities
class BattleUIController { createUI(), updateUI(), handleInput() }
class BattleAudioManager { playEffects(), manageSoundtrack() }
class BattleSceneOrchestrator { initializeBattle(), coordinatePhases() }
```

#### 3.3 Service Responsibility Refinement
```typescript
// PlayerService becomes multiple focused services
class PlayerStatsService { updateHealth(), calculateLevel() }
class PlayerInventoryService { addItem(), useItem(), hasItem() }
class PlayerEquipmentService { equipWeapon(), equipArmor() }
```

**Tests**: Unit tests for each new single-responsibility class
**Deliverables**: 20+ focused classes replacing 7 large services

---

### Phase 4: Dependency Inversion (DIP) ⚡
**Objective**: Depend on abstractions, not concretions

#### 4.1 Dependency Injection Container
```typescript
class DIContainer {
  register<T>(token: string, implementation: T): void
  resolve<T>(token: string): T
  registerSingleton<T>(token: string, implementation: T): void
}
```

#### 4.2 Abstract Service Contracts
```typescript
// Define abstract contracts
abstract class DataRepository<T> {
  abstract save(data: T): Promise<void>
  abstract load(): Promise<T>
}

abstract class StateManager<T> {
  abstract updateState(newState: Partial<T>): void
  abstract getState(): T
}
```

#### 4.3 Scene Dependency Injection
```typescript
class BattleScene extends Phaser.Scene {
  constructor(
    private combatService: ICombatService,
    private audioManager: IAudioManager,
    private uiController: IUIController
  ) { super('BattleScene'); }
}
```

**Tests**: Integration tests with mocked dependencies
**Deliverables**: Complete DI system with abstract base classes

---

### Phase 5: Open/Closed Principle (OCP) ⚡
**Objective**: Open for extension, closed for modification

#### 5.1 Strategy Pattern for Combat
```typescript
interface IDamageStrategy {
  calculateDamage(attacker: ICombatant, target: ICombatant): number
}

class MeleeDamageStrategy implements IDamageStrategy { ... }
class RangedDamageStrategy implements IDamageStrategy { ... }
class EnergyDamageStrategy implements IDamageStrategy { ... }
```

#### 5.2 Factory Pattern for Entities
```typescript
abstract class EntityFactory<T> {
  abstract create(config: any): T
  register(type: string, creator: () => T): void
}

class WeaponFactory extends EntityFactory<IWeapon> { ... }
class EnemyFactory extends EntityFactory<IEnemy> { ... }
```

#### 5.3 Plugin System for Game Features
```typescript
interface IGamePlugin {
  initialize(game: Game): void
  activate(): void
  deactivate(): void
}

class InventoryPlugin implements IGamePlugin { ... }
class DialoguePlugin implements IGamePlugin { ... }
```

**Tests**: Extension tests (add new weapons/enemies without modifying core code)
**Deliverables**: Fully extensible architecture with plugin system

---

### Phase 6: Liskov Substitution (LSP) ⚡
**Objective**: Ensure derived classes can replace base classes seamlessly

#### 6.1 Proper Combat Inheritance
```typescript
abstract class CombatantBase implements ICombatant {
  abstract takeDamage(amount: number): void
  abstract getDefenseValue(): number
  
  // Common implementation
  isDead(): boolean { return this.getHealth() <= 0; }
}

class Player extends CombatantBase { ... }
class Enemy extends CombatantBase { ... }
```

#### 6.2 Scene Hierarchy Standardization
```typescript
abstract class GameScene extends Phaser.Scene {
  abstract initializeScene(): void
  abstract handleInput(event: InputEvent): void
  abstract cleanup(): void
  
  // Template method pattern
  create(): void {
    this.initializeScene();
    this.setupEventListeners();
  }
}
```

#### 6.3 Service Interface Compliance
```typescript
interface IService {
  initialize(): Promise<void>
  isReady(): boolean
  cleanup(): void
}

// All services must properly implement this contract
class PlayerService implements IService { ... }
class CombatService implements IService { ... }
```

**Tests**: Substitution tests (ensure derived classes work in place of base classes)
**Deliverables**: Consistent inheritance hierarchies with proper LSP compliance

---

### Phase 7: Advanced Patterns & Final Polish ⚡
**Objective**: Implement advanced OOP patterns and finalize architecture

#### 7.1 Observer Pattern for Game Events
```typescript
class GameEventManager {
  subscribe(event: string, callback: Function): void
  unsubscribe(event: string, callback: Function): void
  emit(event: string, data: any): void
}

// Events: player-level-up, enemy-defeated, item-used, etc.
```

#### 7.2 Command Pattern for Actions
```typescript
interface ICommand {
  execute(): void
  undo(): void
  canExecute(): boolean
}

class AttackCommand implements ICommand { ... }
class UseItemCommand implements ICommand { ... }
class EquipWeaponCommand implements ICommand { ... }
```

#### 7.3 State Pattern for Game Flow
```typescript
interface IGameState {
  enter(): void
  exit(): void
  handleInput(input: any): void
  update(deltaTime: number): void
}

class MenuState implements IGameState { ... }
class BattleState implements IGameState { ... }
class WorldMapState implements IGameState { ... }
```

#### 7.4 Repository Pattern for Data Access
```typescript
interface IRepository<T> {
  findById(id: string): Promise<T>
  findAll(): Promise<T[]>
  save(entity: T): Promise<void>
  delete(id: string): Promise<void>
}

class PlayerRepository implements IRepository<IPlayer> { ... }
class WeaponRepository implements IRepository<IWeapon> { ... }
```

**Tests**: Pattern-specific tests + full integration test suite
**Deliverables**: Production-ready OOP architecture with design patterns

---

## Testing Strategy

### Unit Tests (60% of test suite)
- **Service Layer**: All business logic methods
- **Utility Functions**: Helper methods and calculations
- **Data Models**: Validation and transformation logic
- **Strategy Classes**: Algorithm implementations

### Integration Tests (30% of test suite)
- **Scene Transitions**: Navigation between game states
- **Service Interactions**: Cross-service communication
- **Data Flow**: End-to-end data persistence
- **Combat System**: Full battle sequences

### End-to-End Tests (10% of test suite)
- **Game Flow**: Complete gameplay scenarios
- **Save/Load**: Full game state persistence
- **Performance**: Memory usage and rendering performance
- **Error Handling**: Graceful failure scenarios

### Testing Tools
- **Jest**: Primary testing framework
- **Jest-Canvas-Mock**: Phaser testing support
- **MSW**: API mocking for data services
- **Coverage Tools**: Istanbul/NYC for coverage reports

## Implementation Schedule

### Week 1: Infrastructure (Phase 1)
- Days 1-2: Jest setup and configuration
- Days 3-4: Initial test coverage for existing code
- Days 5-7: Test utilities and CI/CD pipeline

### Week 2: Interface Design (Phase 2)
- Days 1-3: Interface segregation implementation
- Days 4-5: Update dependent code
- Days 6-7: Comprehensive interface testing

### Week 3: Responsibility Separation (Phase 3)
- Days 1-4: Service decomposition
- Days 5-6: Scene responsibility separation
- Day 7: Integration testing and validation

### Week 4: Dependency Injection (Phase 4)
- Days 1-3: DI container implementation
- Days 4-5: Service abstraction
- Days 6-7: Scene refactoring with DI

### Week 5: Extensibility (Phase 5)
- Days 1-3: Strategy and Factory patterns
- Days 4-5: Plugin system implementation
- Days 6-7: Extension testing

### Week 6: Inheritance (Phase 6)
- Days 1-3: Proper inheritance hierarchies
- Days 4-5: LSP compliance verification
- Days 6-7: Substitution testing

### Week 7: Advanced Patterns (Phase 7)
- Days 1-3: Observer and Command patterns
- Days 4-5: State and Repository patterns
- Days 6-7: Final integration and performance testing

## Success Metrics

### Code Quality
- **Test Coverage**: 80%+ overall, 90%+ for business logic
- **Cyclomatic Complexity**: <10 for all methods
- **Code Duplication**: <5% across codebase
- **SOLID Compliance**: Verified through automated analysis

### Performance
- **Bundle Size**: <2MB total JavaScript
- **Load Time**: <3 seconds initial load
- **Memory Usage**: <100MB steady state
- **Frame Rate**: 60 FPS stable during gameplay

### Maintainability
- **Adding New Weapon**: <30 minutes without core changes
- **Adding New Enemy**: <45 minutes without core changes
- **New Scene Creation**: <2 hours using existing patterns
- **Bug Fix Isolation**: 90% of bugs fixable in single class

### Documentation
- **API Documentation**: 100% public methods documented
- **Architecture Guide**: Complete with diagrams
- **Extension Tutorial**: Step-by-step for adding content
- **Testing Guide**: Comprehensive testing practices

## Phase 1 - Next Steps

1. **Install Jest and Testing Dependencies**
2. **Configure Jest for TypeScript + Phaser**
3. **Create Test Utilities and Mocks**
4. **Write Baseline Tests for Existing Services**
5. **Establish Coverage Reporting**

Ready to begin Phase 1? 🚀
