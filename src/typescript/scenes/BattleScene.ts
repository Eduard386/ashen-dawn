import * as Phaser from 'phaser';
import { BattleLogic } from '../core/BattleLogic';

/**
 * Modern TypeScript BattleScene with enhanced combat system
 * Uses BattleLogic for core mechanics and focuses on UI/UX
 */
export class BattleScene extends Phaser.Scene {
  private battleLogic!: BattleLogic;
  
  // UI Elements
  private background!: Phaser.GameObjects.Image;
  private enemySprites: Phaser.GameObjects.Image[] = [];
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private enemyHealthBars: Phaser.GameObjects.Graphics[] = [];
  private combatLogText!: Phaser.GameObjects.Text;
  private weaponButtons: Phaser.GameObjects.Container[] = [];
  private actionButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(data: { enemyType?: string } = {}) {
    console.log('🚀 Modern BattleScene initialized with TypeScript services');
    
    // Initialize battle logic
    this.battleLogic = new BattleLogic();
    this.battleLogic.initializeBattle(data.enemyType || 'Raiders');

    // Create background
    this.createBackground();
    
    // Create enemy sprites
    this.createEnemySprites();
    
    // Create UI
    this.createUI();
    
    // Initial UI update
    this.updateUI();
  }

  private createBackground(): void {
    // Create battle background
    this.background = this.add.image(512, 300, 'battle_bg')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(1024, 600);
    
    // Fallback if image not loaded
    if (!this.background.texture || this.background.texture.key === '__MISSING') {
      this.background.destroy();
      
      // Create a simple colored background
      const graphics = this.add.graphics();
      graphics.fillStyle(0x2c1810);
      graphics.fillRect(0, 0, 1024, 600);
      
      // Add some atmosphere
      graphics.fillStyle(0x4a3729);
      graphics.fillRect(0, 500, 1024, 100); // Ground
    }
  }

  private createEnemySprites(): void {
    const state = this.battleLogic.getBattleState();
    this.enemySprites = [];
    this.enemyHealthBars = [];
    
    const startX = 200;
    const startY = 200;
    const spacing = 150;
    
    state.enemies.forEach((enemy, index) => {
      const x = startX + (index * spacing);
      const y = startY + (Math.random() * 100); // Some vertical variation
      
      // Create enemy sprite
      const sprite = this.add.image(x, y, 'enemy_placeholder')
        .setOrigin(0.5, 1)
        .setDisplaySize(64, 64)
        .setInteractive()
        .on('pointerdown', () => this.selectEnemy(index))
        .on('pointerover', () => sprite.setTint(0xffcccc))
        .on('pointerout', () => sprite.setTint(0xffffff));
      
      // Fallback if sprite not loaded
      if (!sprite.texture || sprite.texture.key === '__MISSING') {
        sprite.destroy();
        
        // Create a simple rectangle as enemy placeholder
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff4444);
        graphics.fillRect(x - 32, y - 64, 64, 64);
        graphics.setInteractive(new Phaser.Geom.Rectangle(x - 32, y - 64, 64, 64), 
          Phaser.Geom.Rectangle.Contains);
        graphics.on('pointerdown', () => this.selectEnemy(index));
        
        this.enemySprites.push(graphics as any);
      } else {
        this.enemySprites.push(sprite);
      }
      
      // Create health bar
      const healthBar = this.add.graphics();
      this.updateEnemyHealthBar(healthBar, enemy, x, y - 80);
      this.enemyHealthBars.push(healthBar);
    });
  }

  private createUI(): void {
    // Player health bar
    this.playerHealthBar = this.add.graphics();
    
    // Weapon buttons
    this.createWeaponButtons();
    
    // Action buttons
    this.createActionButtons();
    
    // Combat log
    this.combatLogText = this.add.text(20, 400, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 },
      wordWrap: { width: 300 }
    });
    
    // Status display
    this.createStatusDisplay();
  }

  private createWeaponButtons(): void {
    const weapons = this.battleLogic.getBridge().getPlayerWeapons();
    const startX = 700;
    const startY = 450;
    
    weapons.forEach((weaponName, index) => {
      const y = startY + (index * 40);
      
      const button = this.add.container(startX, y);
      
      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(0x333333);
      bg.fillRoundedRect(-100, -15, 200, 30, 5);
      bg.setInteractive(new Phaser.Geom.Rectangle(-100, -15, 200, 30), 
        Phaser.Geom.Rectangle.Contains);
      
      // Button text
      const text = this.add.text(0, 0, weaponName, {
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5, 0.5);
      
      button.add([bg, text]);
      
      // Click handler
      bg.on('pointerdown', () => this.selectWeapon(weaponName));
      bg.on('pointerover', () => bg.fillStyle(0x555555).fillRoundedRect(-100, -15, 200, 30, 5));
      bg.on('pointerout', () => bg.fillStyle(0x333333).fillRoundedRect(-100, -15, 200, 30, 5));
      
      this.weaponButtons.push(button);
    });
  }

  private createActionButtons(): void {
    const actions = [
      { text: 'Attack', action: () => this.performAttack() },
      { text: 'Use Item', action: () => this.openItemMenu() },
      { text: 'Run Away', action: () => this.attemptRetreat() }
    ];
    
    const startX = 700;
    const startY = 350;
    
    actions.forEach((action, index) => {
      const y = startY + (index * 40);
      
      const button = this.add.container(startX, y);
      
      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(0x006600);
      bg.fillRoundedRect(-80, -15, 160, 30, 5);
      bg.setInteractive(new Phaser.Geom.Rectangle(-80, -15, 160, 30), 
        Phaser.Geom.Rectangle.Contains);
      
      // Button text
      const text = this.add.text(0, 0, action.text, {
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5, 0.5);
      
      button.add([bg, text]);
      
      // Click handler
      bg.on('pointerdown', action.action);
      bg.on('pointerover', () => bg.fillStyle(0x008800).fillRoundedRect(-80, -15, 160, 30, 5));
      bg.on('pointerout', () => bg.fillStyle(0x006600).fillRoundedRect(-80, -15, 160, 30, 5));
      
      this.actionButtons.push(button);
    });
  }

  private createStatusDisplay(): void {
    const state = this.battleLogic.getBattleState();
    
    // Player stats
    this.add.text(20, 20, `Level ${this.battleLogic.getBridge().getPlayerLevel()}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
    
    // Current weapon
    this.add.text(20, 50, `Weapon: ${state.currentWeapon}`, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
    
    // Experience
    this.add.text(20, 80, `XP: ${this.battleLogic.getBridge().getPlayerExperience()}`, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    });
  }

  private selectEnemy(index: number): void {
    const success = this.battleLogic.selectEnemy(index);
    if (success) {
      this.updateEnemyHighlights();
      this.updateUI();
    }
  }

  private selectWeapon(weaponName: string): void {
    this.battleLogic.switchWeapon(weaponName);
    this.updateUI();
  }

  private performAttack(): void {
    const result = this.battleLogic.performAttack();
    
    if (result.success) {
      // Visual feedback
      this.screenShake();
      
      if (result.defeated) {
        // Show defeat animation
        const state = this.battleLogic.getBattleState();
        const selectedSprite = this.enemySprites[state.selectedEnemyIndex];
        if (selectedSprite) {
          selectedSprite.setTint(0x666666);
        }
      }
      
      if (result.victory) {
        this.handleVictory();
      } else {
        // Trigger enemy turns after delay
        this.time.delayedCall(1000, () => {
          this.battleLogic.triggerEnemyTurns();
          this.updateUI();
          
          // Check if player was defeated
          const newState = this.battleLogic.getBattleState();
          if (newState.playerHealth <= 0) {
            this.handleDefeat();
          }
        });
      }
    }
    
    this.updateUI();
  }

  private openItemMenu(): void {
    const used = this.battleLogic.useItem('first_aid_kit');
    if (used) {
      this.updateUI();
    }
  }

  private attemptRetreat(): void {
    const success = this.battleLogic.attemptRetreat();
    if (success) {
      this.scene.start('WorldMapScene');
    } else {
      this.updateUI();
    }
  }

  private handleVictory(): void {
    this.time.delayedCall(2000, () => {
      this.scene.start('VictoryScene');
    });
  }

  private handleDefeat(): void {
    this.time.delayedCall(2000, () => {
      this.scene.start('DeadScene');
    });
  }

  // UI Update Methods
  private updateUI(): void {
    this.updatePlayerHealthBar();
    this.updateEnemyHealthBars();
    this.updateCombatLog();
    this.updateEnemyHighlights();
  }

  private updatePlayerHealthBar(): void {
    const state = this.battleLogic.getBattleState();
    
    this.playerHealthBar.clear();
    
    // Background
    this.playerHealthBar.fillStyle(0x444444);
    this.playerHealthBar.fillRect(20, 350, 200, 20);
    
    // Health bar
    const healthPercent = state.playerHealth / state.playerMaxHealth;
    const barColor = healthPercent > 0.5 ? 0x00ff00 : 
                    healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    
    this.playerHealthBar.fillStyle(barColor);
    this.playerHealthBar.fillRect(22, 352, (200 - 4) * healthPercent, 16);
  }

  private updateEnemyHealthBars(): void {
    const state = this.battleLogic.getBattleState();
    
    state.enemies.forEach((enemy, index) => {
      if (this.enemyHealthBars[index]) {
        const sprite = this.enemySprites[index];
        if (sprite) {
          this.updateEnemyHealthBar(this.enemyHealthBars[index], enemy, sprite.x, sprite.y - 80);
        }
      }
    });
  }

  private updateEnemyHealthBar(healthBar: Phaser.GameObjects.Graphics, 
                              enemy: any, x: number, y: number): void {
    healthBar.clear();
    
    // Background
    healthBar.fillStyle(0x444444);
    healthBar.fillRect(x - 30, y, 60, 8);
    
    // Health bar
    const healthPercent = enemy.currentHealth / enemy.defence.health;
    const barColor = healthPercent > 0.5 ? 0x00ff00 : 
                    healthPercent > 0.25 ? 0xffff00 : 0xff0000;
    
    healthBar.fillStyle(barColor);
    healthBar.fillRect(x - 29, y + 1, 58 * healthPercent, 6);
  }

  private updateCombatLog(): void {
    const state = this.battleLogic.getBattleState();
    this.combatLogText.setText(state.combatLog.join('\n'));
  }

  private updateEnemyHighlights(): void {
    const state = this.battleLogic.getBattleState();
    
    this.enemySprites.forEach((sprite, index) => {
      if (index === state.selectedEnemyIndex) {
        sprite.setTint(0xffff00); // Yellow highlight
      } else {
        sprite.setTint(0xffffff); // Normal color
      }
    });
  }

  private screenShake(): void {
    this.cameras.main.shake(100, 0.01);
  }
}
