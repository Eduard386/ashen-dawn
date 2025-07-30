import { MainMenuScene } from '../../../typescript/scenes/MainMenuScene';
import { LegacyBridge } from '../../../typescript/core/bridges/LegacyBridge';

// Mock Phaser
global.Phaser = {
  Scene: class {
    add = {
      image: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis()
      }),
      graphics: jest.fn().mockReturnValue({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      }),
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      })
    };
    load = {
      image: jest.fn()
    };
    input = {
      keyboard: {
        addKey: jest.fn().mockReturnValue({
          on: jest.fn()
        })
      }
    };
    cameras = {
      main: {
        centerX: 512,
        centerY: 300
      }
    };
    scene = {
      start: jest.fn(),
      restart: jest.fn()
    };
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        SPACE: 32,
        ENTER: 13
      },
      JustDown: jest.fn().mockReturnValue(false)
    }
  }
} as any;

// Mock LegacyBridge
jest.mock('../../../typescript/core/bridges/LegacyBridge', () => ({
  LegacyBridge: {
    getInstance: jest.fn()
  }
}));

describe('MainMenuScene', () => {
  let mainMenuScene: MainMenuScene;
  let mockBridge: jest.Mocked<LegacyBridge>;
  let mockGameStateService: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock player data
    const mockPlayer = {
      level: 5,
      health: 85,
      maxHealth: 100,
      experience: 1250,
      currentWeapon: '9mm pistol',
      currentArmor: 'Leather Armor',
      inventory: {
        med: {
          first_aid_kit: 3,
          jet: 1,
          buffout: 2,
          mentats: 1,
          psycho: 0
        }
      }
    };

    // Setup mock services
    mockGameStateService = {
      getPlayer: jest.fn().mockReturnValue(mockPlayer),
      saveGame: jest.fn(),
      loadGame: jest.fn(),
      resetGame: jest.fn()
    };

    // Setup mock bridge
    mockBridge = {
      getInstance: jest.fn().mockReturnThis(),
      isInitialized: jest.fn().mockReturnValue(true),
      initialize: jest.fn(),
      getServices: jest.fn().mockReturnValue({
        gameState: mockGameStateService
      }),
      getPlayerLevel: jest.fn().mockReturnValue(5)
    } as any;

    (LegacyBridge.getInstance as jest.Mock).mockReturnValue(mockBridge);

    // Create scene instance
    mainMenuScene = new MainMenuScene();
    
    // Manually assign the mocked properties
    (mainMenuScene as any).load = {
      image: jest.fn()
    };
    
    (mainMenuScene as any).add = {
      image: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis()
      }),
      graphics: jest.fn().mockReturnValue({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      }),
      text: jest.fn().mockReturnValue({
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setStyle: jest.fn().mockReturnThis()
      })
    };
    
    (mainMenuScene as any).input = {
      keyboard: {
        addKey: jest.fn().mockReturnValue({
          on: jest.fn()
        })
      }
    };
    
    (mainMenuScene as any).cameras = {
      main: {
        centerX: 512,
        centerY: 300
      }
    };
    
    (mainMenuScene as any).scene = {
      start: jest.fn(),
      restart: jest.fn()
    };
  });

  describe('Scene Initialization', () => {
    it('should initialize with correct scene key', () => {
      expect(mainMenuScene.constructor.name).toBe('MainMenuScene');
    });

    it('should load menu background in preload', () => {
      mainMenuScene.preload();
      
      expect((mainMenuScene as any).load.image).toHaveBeenCalledWith(
        'background_menu', 
        'assets/images/backgrounds/menu/menu.png'
      );
    });

    it('should initialize bridge and create UI on create', () => {
      mainMenuScene.create();
      
      expect(LegacyBridge.getInstance).toHaveBeenCalled();
      expect(mockBridge.isInitialized).toHaveBeenCalled();
    });
  });

  describe('UI Creation', () => {
    beforeEach(() => {
      mainMenuScene.create();
    });

    it('should create background image', () => {
      expect((mainMenuScene as any).add.image).toHaveBeenCalledWith(0, 0, 'background_menu');
    });

    it('should create start button with correct properties', () => {
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        512, 300, 'New Game',
        expect.objectContaining({
          fontSize: '32px',
          color: '#00ff00',
          fontFamily: 'monospace'
        })
      );
    });

    it('should create level display', () => {
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 100, 'Level: 1',
        expect.objectContaining({
          fontSize: '32px',
          color: '#ffffff'
        })
      );
    });

    it('should create instruction text', () => {
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        512, 380, 'Press SPACE or ENTER to start\nClick "New Game" to begin',
        expect.objectContaining({
          fontSize: '16px',
          align: 'center'
        })
      );
    });

    it('should create player stats display', () => {
      // Should show health
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 180, 'Health: 85/100',
        expect.objectContaining({
          fontSize: '18px',
          color: '#00ff00' // Green since health > 50%
        })
      );

      // Should show experience
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 210, 'Experience: 1250',
        expect.objectContaining({
          fontSize: '18px',
          color: '#00aaff'
        })
      );

      // Should show current weapon
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 240, 'Weapon: 9mm pistol',
        expect.objectContaining({
          fontSize: '16px',
          color: '#ffaa00'
        })
      );

      // Should show current armor
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 265, 'Armor: Leather Armor',
        expect.objectContaining({
          fontSize: '16px',
          color: '#ffaa00'
        })
      );
    });

    it('should create inventory summary', () => {
      // Should show medical items header
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 300, 'Medical Items:',
        expect.objectContaining({
          fontSize: '14px',
          color: '#ffffff'
        })
      );

      // Should show individual medical items with correct counts
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        120, 325, 'First Aid: 3',
        expect.objectContaining({
          fontSize: '12px',
          color: '#00ff00' // Green because count > 0
        })
      );

      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        120, 343, 'Jet: 1',
        expect.objectContaining({
          color: '#00ff00'
        })
      );

      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        120, 379, 'Psycho: 0',
        expect.objectContaining({
          color: '#666666' // Gray because count = 0
        })
      );
    });
  });

  describe('Input Handling', () => {
    beforeEach(() => {
      mainMenuScene.create();
    });

    it('should setup keyboard input', () => {
      expect((mainMenuScene as any).input.keyboard.addKey).toHaveBeenCalledWith(32); // SPACE
      expect((mainMenuScene as any).input.keyboard.addKey).toHaveBeenCalledWith(13); // ENTER
    });

    it('should start game on space key press', () => {
      // Mock JustDown to return true for space key
      (Phaser.Input.Keyboard.JustDown as jest.Mock).mockReturnValue(true);
      
      const startGameSpy = jest.spyOn(mainMenuScene as any, 'startGame');
      
      mainMenuScene.update();
      
      expect(startGameSpy).toHaveBeenCalled();
    });
  });

  describe('Game Flow', () => {
    beforeEach(() => {
      mainMenuScene.create();
    });

    it('should transition to world map on startGame', () => {
      const startGameMethod = (mainMenuScene as any).startGame;
      startGameMethod.call(mainMenuScene);
      
      expect(mockGameStateService.saveGame).toHaveBeenCalled();
      expect((mainMenuScene as any).scene.start).toHaveBeenCalledWith('ModernWorldMapScene');
    });

    it('should update level display in update method', () => {
      const mockLevelText = { setText: jest.fn() };
      (mainMenuScene as any).levelText = mockLevelText;
      
      mainMenuScene.update();
      
      expect(mockLevelText.setText).toHaveBeenCalledWith('Level: 5');
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      mainMenuScene.create();
    });

    it('should reset game state when resetGame is called', () => {
      mainMenuScene.resetGame();
      
      expect(mockGameStateService.resetGame).toHaveBeenCalled();
      expect((mainMenuScene as any).scene.restart).toHaveBeenCalled();
    });

    it('should load game state when loadGame is called', () => {
      mainMenuScene.loadGame();
      
      expect(mockGameStateService.loadGame).toHaveBeenCalled();
      expect((mainMenuScene as any).scene.restart).toHaveBeenCalled();
    });
  });

  describe('Button Interactions', () => {
    beforeEach(() => {
      mainMenuScene.create();
    });

    it('should change button style on hover', () => {
      const mockButton = { 
        setStyle: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      };
      (mainMenuScene as any).startButton = mockButton;
      
      const hoverMethod = (mainMenuScene as any).onButtonHover;
      hoverMethod.call(mainMenuScene);
      
      expect(mockButton.setStyle).toHaveBeenCalledWith({
        fontSize: '34px',
        color: '#00ffaa',
        backgroundColor: 'rgba(0,100,0,0.7)'
      });
    });

    it('should restore button style on mouse out', () => {
      const mockButton = { 
        setStyle: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setInteractive: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis()
      };
      (mainMenuScene as any).startButton = mockButton;
      
      const outMethod = (mainMenuScene as any).onButtonOut;
      outMethod.call(mainMenuScene);
      
      expect(mockButton.setStyle).toHaveBeenCalledWith({
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: 'rgba(0,0,0,0.5)'
      });
    });
  });

  describe('Health Color Coding', () => {
    it('should show green health when above 50%', () => {
      // Health is 85/100 = 85% (green)
      mainMenuScene.create();
      
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 180, 'Health: 85/100',
        expect.objectContaining({
          color: '#00ff00'
        })
      );
    });

    it('should show yellow health when between 25% and 50%', () => {
      // Mock player with 40% health
      mockGameStateService.getPlayer.mockReturnValue({
        ...mockGameStateService.getPlayer(),
        health: 40,
        maxHealth: 100
      });
      
      mainMenuScene.create();
      
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 180, 'Health: 40/100',
        expect.objectContaining({
          color: '#ffff00'
        })
      );
    });

    it('should show red health when below 25%', () => {
      // Mock player with 20% health
      mockGameStateService.getPlayer.mockReturnValue({
        ...mockGameStateService.getPlayer(),
        health: 20,
        maxHealth: 100
      });
      
      mainMenuScene.create();
      
      expect((mainMenuScene as any).add.text).toHaveBeenCalledWith(
        100, 180, 'Health: 20/100',
        expect.objectContaining({
          color: '#ff0000'
        })
      );
    });
  });
});
