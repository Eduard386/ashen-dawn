import * as Phaser from 'phaser';
import { LegacyBridge } from '../core/bridges/LegacyBridge';

/**
 * Modern TypeScript WorldMapScene with enhanced encounter system
 * Handles world map travel, random encounters, and exploration
 */
export class WorldMapScene extends Phaser.Scene {
  private bridge!: LegacyBridge;
  private popupActive: boolean = false;
  private selectedButton: string = 'Yes';
  private encounterTimer?: Phaser.Time.TimerEvent;
  
  // Audio
  private soundtrack?: Phaser.Sound.BaseSound;
  private soundtrackNames: string[] = [
    'A Traders Life (in NCR)',
    'All-Clear Signal (Vault City)',
    'Beyond The Canyon (Arroyo)',
    'California Revisited (Worldmap on foot)',
    'Khans of New California (in the Den)',
    'Moribund World (in Klamath)',
    'My Chrysalis Highwayman (Worldmap with Car)'
  ];
  
  // UI Elements
  private popupBackground?: Phaser.GameObjects.Graphics;
  private popupText?: Phaser.GameObjects.Text;
  private yesButton?: Phaser.GameObjects.Image;
  private noButton?: Phaser.GameObjects.Image;
  private roadVideo?: Phaser.GameObjects.Video;
  
  // Input
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'ModernWorldMapScene' });
  }

  preload(): void {
    // Load soundtracks
    this.soundtrackNames.forEach((name) => {
      this.load.audio(name, `assets/sounds/battle_background/${name}.mp3`);
    });
    this.load.audio('travel', 'assets/psychobilly.mp3');

    // Load video and UI assets
    this.load.video('road', 'assets/road.mp4');
    this.load.image('yes', 'assets/images/yes.png');
    this.load.image('no', 'assets/images/no.png');
  }

  create(): void {
    console.log('🗺️ Modern WorldMapScene initialized with TypeScript services');
    
    // Initialize bridge
    this.bridge = LegacyBridge.getInstance();
    if (!this.bridge.isInitialized()) {
      this.bridge.initialize();
    }

    // Start background music
    this.playRandomSoundtrack();

    // Create road video background
    this.createRoadBackground();
    
    // Create UI elements
    this.createUI();
    
    // Setup input
    this.setupInput();
    
    // Start encounter system
    this.startEncounterSystem();
  }

  update(): void {
    if (this.popupActive) {
      this.handlePopupInput();
    }
  }

  private createRoadBackground(): void {
    try {
      this.roadVideo = this.add.video(0, 0, 'road').setOrigin(0, 0);
      this.roadVideo.play(true); // Loop the video
    } catch (error) {
      // Fallback if video fails to load
      console.warn('Road video failed to load, using fallback background');
      const graphics = this.add.graphics();
      graphics.fillStyle(0x4a3729);
      graphics.fillRect(0, 0, 1024, 600);
      
      // Add some visual interest
      graphics.fillStyle(0x2c1810);
      graphics.fillRect(300, 250, 424, 100); // Road
    }
  }

  private createUI(): void {
    // Create popup elements (initially hidden)
    this.createPopup();
    
    // Create any other UI elements here
    this.createStatusDisplay();
  }

  private createStatusDisplay(): void {
    const playerLevel = this.bridge.getPlayerLevel();
    const playerHealth = this.bridge.getPlayerHealth();
    const playerMaxHealth = this.bridge.getPlayerMaxHealth();
    
    // Player status display
    this.add.text(20, 20, `Level ${playerLevel}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
    
    this.add.text(20, 50, `Health: ${playerHealth}/${playerMaxHealth}`, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
    
    this.add.text(20, 80, 'Space: Open Menu', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Space key to open menu/pause
    this.spaceKey?.on('down', () => {
      if (!this.popupActive) {
        this.openTravelMenu();
      }
    });
  }

  private openTravelMenu(): void {
    // Simple travel menu for now
    this.showPopup('Travel Menu', [
      { text: 'Continue Traveling', action: () => this.hidePopup() },
      { text: 'Return to Main Menu', action: () => this.scene.start('MainMenuScene') }
    ]);
  }

  private playRandomSoundtrack(): void {
    // Use travel music for now, can be randomized later
    this.soundtrack = this.sound.add('travel');
    
    if (this.soundtrack) {
      this.soundtrack.play();
      
      this.soundtrack.once('complete', () => {
        this.playRandomSoundtrack(); // Loop to next soundtrack
      });
    }
  }

  private startEncounterSystem(): void {
    this.scheduleNextEncounter();
  }

  private scheduleNextEncounter(): void {
    // Clear existing timer
    if (this.encounterTimer) {
      this.encounterTimer.remove();
    }
    
    // Random delay between 3-6 seconds
    const delay = Phaser.Math.Between(3000, 6000);
    
    this.encounterTimer = this.time.delayedCall(delay, () => {
      if (!this.popupActive) {
        this.triggerRandomEncounter();
      }
      // Schedule next encounter
      this.scheduleNextEncounter();
    });
  }

  private triggerRandomEncounter(): void {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player) return;
    
    // Check survival skill for avoidance
    const survivingSkill = player.skills?.surviving || 75;
    const avoidanceRoll = Phaser.Math.Between(1, 100);
    
    if (avoidanceRoll <= survivingSkill) {
      // Player avoided the encounter
      this.showAvoidanceMessage();
    } else {
      // Trigger encounter
      this.generateRandomEncounter();
    }
  }

  private showAvoidanceMessage(): void {
    const messages = [
      'You notice tracks ahead and take a detour.',
      'Your survival instincts help you avoid danger.',
      'You hear voices in the distance and hide.',
      'You spot movement and carefully go around.'
    ];
    
    const message = Phaser.Utils.Array.GetRandom(messages);
    this.showPopup(message, [
      { text: 'Continue', action: () => this.hidePopup() }
    ]);
  }

  private generateRandomEncounter(): void {
    const services = this.bridge.getServices();
    const playerLevel = this.bridge.getPlayerLevel();
    
    // Generate enemies based on player level
    const enemyTypes = ['Raiders', 'Cannibals', 'Tribe'];
    const encounterType = Phaser.Utils.Array.GetRandom(enemyTypes);
    
    // Store encounter data for battle scene
    this.bridge.getServices().gameState.setEncounterData({
      enemyType: encounterType,
      playerLevel: playerLevel
    });
    
    this.showEncounterPopup(encounterType);
  }

  private showEncounterPopup(enemyType: string): void {
    const encounterMessages = {
      'Raiders': [
        'Armed bandits block your path!',
        'You hear the sound of engines approaching...',
        'Hostile raiders have spotted you!'
      ],
      'Cannibals': [
        'Wild-looking people emerge from the wasteland!',
        'You stumble upon a cannibal camp!',
        'Desperate survivors approach with hostile intent!'
      ],
      'Tribe': [
        'Tribal warriors appear from the wilderness!',
        'You encounter a hunting party!',
        'Native survivors challenge your passage!'
      ]
    };
    
    const messages = encounterMessages[enemyType as keyof typeof encounterMessages] || 
                    ['You encounter hostile survivors!'];
    const message = Phaser.Utils.Array.GetRandom(messages);
    
    this.showPopup(message, [
      { text: 'Fight', action: () => this.startBattle(enemyType) },
      { text: 'Try to Avoid', action: () => this.attemptAvoidance() }
    ]);
  }

  private startBattle(enemyType: string): void {
    this.hidePopup();
    
    // Stop soundtrack
    if (this.soundtrack) {
      this.soundtrack.stop();
    }
    
    // Transition to battle scene
    this.scene.start('ModernBattleScene', { enemyType });
  }

  private attemptAvoidance(): void {
    const services = this.bridge.getServices();
    const player = services.gameState.getPlayer();
    
    if (!player) return;
    
    const survivingSkill = player.skills?.surviving || 75;
    const avoidanceRoll = Phaser.Math.Between(1, 100);
    
    if (avoidanceRoll <= survivingSkill) {
      this.showPopup('You successfully avoid the encounter!', [
        { text: 'Continue', action: () => this.hidePopup() }
      ]);
    } else {
      this.showPopup('You cannot avoid the encounter!', [
        { text: 'Prepare for Battle', action: () => {
          const encounterData = services.gameState.getEncounterData();
          this.startBattle(encounterData?.enemyType || 'Raiders');
        }}
      ]);
    }
  }

  private createPopup(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.popupBackground = this.add.graphics()
      .fillStyle(0x000000, 0.8)
      .fillRoundedRect(centerX - 200, centerY - 100, 400, 200, 10)
      .setScrollFactor(0)
      .setVisible(false);

    // Text
    this.popupText = this.add.text(centerX, centerY - 30, '', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 350 }
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    // Buttons will be created dynamically
  }

  private showPopup(text: string, actions: Array<{text: string, action: () => void}>): void {
    if (this.popupActive) return;
    
    this.popupActive = true;
    
    // Update text
    if (this.popupText) {
      this.popupText.setText(text).setVisible(true);
    }
    
    // Show background
    if (this.popupBackground) {
      this.popupBackground.setVisible(true);
    }
    
    // Create action buttons
    this.createActionButtons(actions);
  }

  private createActionButtons(actions: Array<{text: string, action: () => void}>): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const buttonY = centerY + 50;
    
    // Remove existing buttons
    this.clearActionButtons();
    
    actions.forEach((action, index) => {
      const buttonX = centerX + (actions.length === 1 ? 0 : (index - 0.5) * 120);
      
      // Button background
      const buttonBg = this.add.graphics()
        .fillStyle(0x333333)
        .fillRoundedRect(buttonX - 50, buttonY - 15, 100, 30, 5)
        .setScrollFactor(0)
        .setInteractive(new Phaser.Geom.Rectangle(buttonX - 50, buttonY - 15, 100, 30), 
          Phaser.Geom.Rectangle.Contains);
      
      // Button text
      const buttonText = this.add.text(buttonX, buttonY, action.text, {
        fontSize: '14px',
        color: '#ffffff'
      })
        .setOrigin(0.5)
        .setScrollFactor(0);
      
      // Button interactions
      buttonBg.on('pointerdown', () => {
        action.action();
      });
      
      buttonBg.on('pointerover', () => {
        buttonBg.clear().fillStyle(0x555555).fillRoundedRect(buttonX - 50, buttonY - 15, 100, 30, 5);
      });
      
      buttonBg.on('pointerout', () => {
        buttonBg.clear().fillStyle(0x333333).fillRoundedRect(buttonX - 50, buttonY - 15, 100, 30, 5);
      });
      
      // Store references for cleanup
      buttonBg.setName('actionButton');
      buttonText.setName('actionButtonText');
    });
  }

  private clearActionButtons(): void {
    // Remove all action buttons
    this.children.getChildren().forEach(child => {
      if (child.name === 'actionButton' || child.name === 'actionButtonText') {
        child.destroy();
      }
    });
  }

  private hidePopup(): void {
    this.popupActive = false;
    
    if (this.popupBackground) {
      this.popupBackground.setVisible(false);
    }
    
    if (this.popupText) {
      this.popupText.setVisible(false);
    }
    
    this.clearActionButtons();
  }

  private handlePopupInput(): void {
    // Handle keyboard input for popup navigation
    if (this.cursors?.left?.isDown || this.cursors?.right?.isDown) {
      // Toggle selected button
      this.selectedButton = this.selectedButton === 'Yes' ? 'No' : 'Yes';
    }
    
    if (this.cursors?.space?.isDown) {
      // Activate selected button
      // This would need to be connected to the current action buttons
    }
  }
}
