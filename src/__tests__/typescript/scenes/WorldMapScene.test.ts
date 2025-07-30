import { WorldMapScene } from '../../../typescript/scenes/WorldMapScene';
import { LegacyBridge } from '../../../typescript/core/bridges/LegacyBridge';

// Mock Phaser
global.Phaser = {
  Scene: class {
    add = {
      video: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        play: jest.fn()
      }),
      graphics: jest.fn().mockReturnValue({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillRoundedRect: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setName: jest.fn().mockReturnThis()
      }),
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setName: jest.fn().mockReturnThis()
      })
    };
    sound = {
      add: jest.fn().mockReturnValue({
        play: jest.fn(),
        stop: jest.fn(),
        once: jest.fn()
      })
    };
    load = {
      audio: jest.fn(),
      video: jest.fn(),
      image: jest.fn()
    };
    input = {
      keyboard: {
        createCursorKeys: jest.fn().mockReturnValue({
          left: { isDown: false },
          right: { isDown: false },
          space: { isDown: false }
        }),
        addKey: jest.fn().mockReturnValue({
          on: jest.fn()
        })
      }
    };
    cameras = {
      main: {
        width: 1024,
        height: 600
      }
    };
    time = {
      delayedCall: jest.fn().mockReturnValue({
        remove: jest.fn()
      })
    };
    scene = {
      start: jest.fn()
    };
    children = {
      getChildren: jest.fn().mockReturnValue([])
    };
  },
  Math: {
    Between: jest.fn((min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min)
  },
  Utils: {
    Array: {
      GetRandom: jest.fn((array: any[]) => array[Math.floor(Math.random() * array.length)])
    }
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        SPACE: 32
      }
    }
  },
  Geom: {
    Rectangle: {
      Contains: jest.fn()
    }
  },
  Types: {
    Input: {
      Keyboard: {}
    }
  }
} as any;

// Mock LegacyBridge
jest.mock('../../../typescript/core/bridges/LegacyBridge', () => ({
  LegacyBridge: {
    getInstance: jest.fn()
  }
}));

describe('WorldMapScene', () => {
  let worldMapScene: WorldMapScene;
  let mockBridge: jest.Mocked<LegacyBridge>;
  let mockGameStateService: any;
  let mockPlayerService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock services
    mockGameStateService = {
      getPlayer: jest.fn().mockReturnValue({
        level: 3,
        health: 80,
        maxHealth: 100,
        skills: { surviving: 75 }
      }),
      setEncounterData: jest.fn(),
      getEncounterData: jest.fn().mockReturnValue({
        enemyType: 'Raiders',
        playerLevel: 3
      })
    };

    mockPlayerService = {
      getPlayerLevel: jest.fn().mockReturnValue(3),
      getPlayerHealth: jest.fn().mockReturnValue(80),
      getPlayerMaxHealth: jest.fn().mockReturnValue(100)
    };

    // Setup mock bridge
    mockBridge = {
      getInstance: jest.fn().mockReturnThis(),
      isInitialized: jest.fn().mockReturnValue(true),
      initialize: jest.fn(),
      getServices: jest.fn().mockReturnValue({
        gameState: mockGameStateService,
        player: mockPlayerService
      }),
      getPlayerLevel: jest.fn().mockReturnValue(3),
      getPlayerHealth: jest.fn().mockReturnValue(80),
      getPlayerMaxHealth: jest.fn().mockReturnValue(100)
    } as any;

    (LegacyBridge.getInstance as jest.Mock).mockReturnValue(mockBridge);

    // Create scene instance
    worldMapScene = new WorldMapScene();
    
    // Manually assign the mocked properties to the scene instance
    (worldMapScene as any).load = {
      audio: jest.fn(),
      video: jest.fn(),
      image: jest.fn()
    };
    
    (worldMapScene as any).sound = {
      add: jest.fn().mockReturnValue({
        play: jest.fn(),
        stop: jest.fn(),
        once: jest.fn()
      })
    };
    
    (worldMapScene as any).add = {
      video: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        play: jest.fn()
      }),
      graphics: jest.fn().mockReturnValue({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        fillRoundedRect: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setName: jest.fn().mockReturnThis()
      }),
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setScrollFactor: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setName: jest.fn().mockReturnThis()
      })
    };
    
    (worldMapScene as any).input = {
      keyboard: {
        createCursorKeys: jest.fn().mockReturnValue({
          left: { isDown: false },
          right: { isDown: false },
          space: { isDown: false }
        }),
        addKey: jest.fn().mockReturnValue({
          on: jest.fn()
        })
      }
    };
    
    (worldMapScene as any).cameras = {
      main: {
        width: 1024,
        height: 600
      }
    };
    
    (worldMapScene as any).time = {
      delayedCall: jest.fn().mockReturnValue({
        remove: jest.fn()
      })
    };
    
    (worldMapScene as any).scene = {
      start: jest.fn()
    };
    
    (worldMapScene as any).children = {
      getChildren: jest.fn().mockReturnValue([])
    };
  });

  describe('Scene Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(worldMapScene.constructor.name).toBe('WorldMapScene');
    });

    it('should call preload and load required assets', () => {
      worldMapScene.preload();
      
      expect((worldMapScene as any).load.audio).toHaveBeenCalledWith('travel', 'assets/psychobilly.mp3');
      expect((worldMapScene as any).load.video).toHaveBeenCalledWith('road', 'assets/road.mp4');
      expect((worldMapScene as any).load.image).toHaveBeenCalledWith('yes', 'assets/images/yes.png');
      expect((worldMapScene as any).load.image).toHaveBeenCalledWith('no', 'assets/images/no.png');
    });

    it('should initialize bridge and start systems on create', () => {
      worldMapScene.create();
      
      expect(LegacyBridge.getInstance).toHaveBeenCalled();
      expect(mockBridge.isInitialized).toHaveBeenCalled();
    });
  });

  describe('Core Functionality', () => {
    beforeEach(() => {
      worldMapScene.create();
    });

    it('should create road background video', () => {
      expect((worldMapScene as any).add.video).toHaveBeenCalledWith(0, 0, 'road');
    });

    it('should create status display with player info', () => {
      expect((worldMapScene as any).add.text).toHaveBeenCalledWith(
        20, 20, 'Level 3',
        expect.objectContaining({
          fontSize: '16px',
          color: '#ffffff'
        })
      );
      
      expect((worldMapScene as any).add.text).toHaveBeenCalledWith(
        20, 50, 'Health: 80/100',
        expect.objectContaining({
          fontSize: '14px',
          color: '#ffffff'
        })
      );
    });

    it('should create popup elements', () => {
      expect((worldMapScene as any).add.graphics).toHaveBeenCalled();
      expect((worldMapScene as any).add.text).toHaveBeenCalledWith(
        512, 270, '',
        expect.objectContaining({
          fontSize: '16px',
          align: 'center'
        })
      );
    });

    it('should play random soundtrack', () => {
      expect((worldMapScene as any).sound.add).toHaveBeenCalledWith('travel');
    });

    it('should schedule random encounters', () => {
      expect((worldMapScene as any).time.delayedCall).toHaveBeenCalled();
      
      const callArgs = ((worldMapScene as any).time.delayedCall as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBeGreaterThanOrEqual(3000);
      expect(callArgs[0]).toBeLessThanOrEqual(6000);
    });

    it('should setup keyboard input', () => {
      expect((worldMapScene as any).input.keyboard?.createCursorKeys).toHaveBeenCalled();
      expect((worldMapScene as any).input.keyboard?.addKey).toHaveBeenCalledWith(32); // SPACE key
    });
  });

  describe('Encounter System', () => {
    beforeEach(() => {
      worldMapScene.create();
    });

    it('should check survival skill for encounter avoidance', () => {
      // Mock Math.Between to return a value that triggers avoidance
      (Phaser.Math.Between as jest.Mock).mockReturnValue(50); // Below surviving skill of 75
      
      // Simulate encounter trigger
      const encounterCallback = ((worldMapScene as any).time.delayedCall as jest.Mock).mock.calls[0][1];
      encounterCallback();
      
      // Should not set encounter data (avoided)
      expect(mockGameStateService.setEncounterData).not.toHaveBeenCalled();
    });

    it('should generate encounter when survival check fails', () => {
      // Mock Math.Between to return a value that triggers encounter
      (Phaser.Math.Between as jest.Mock).mockReturnValue(90); // Above surviving skill of 75
      
      // Simulate encounter trigger
      const encounterCallback = ((worldMapScene as any).time.delayedCall as jest.Mock).mock.calls[0][1];
      encounterCallback();
      
      // Should set encounter data
      expect(mockGameStateService.setEncounterData).toHaveBeenCalled();
    });

    it('should store encounter data for battle transitions', () => {
      const generateEncounterMethod = (worldMapScene as any).generateRandomEncounter;
      generateEncounterMethod.call(worldMapScene);
      
      expect(mockGameStateService.setEncounterData).toHaveBeenCalledWith({
        enemyType: expect.any(String),
        playerLevel: 3
      });
    });
  });

  describe('Scene Transitions', () => {
    beforeEach(() => {
      worldMapScene.create();
    });

    it('should transition to battle scene when starting battle', () => {
      const startBattleMethod = (worldMapScene as any).startBattle;
      startBattleMethod.call(worldMapScene, 'Raiders');
      
      expect((worldMapScene as any).scene.start).toHaveBeenCalledWith('ModernBattleScene', { enemyType: 'Raiders' });
    });
  });
});
