// Note: Phaser is loaded globally via CDN in index.html
import { GameDataService } from '../core/services/GameDataService.js';
/**
 * TypeScript WorldMapScene - EXACT legacy visual style
 * Matches the original JavaScript WorldMapScene precisely
 * Now using pure TypeScript GameDataService instead of LegacyBridge
 */
export class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMap' });
        // EXACT legacy properties
        this.popupActive = false;
        this.selectedButton = "No"; // Default to "No" like legacy
        // EXACT legacy enemies data (simplified version)
        this.enemies_all = [
            {
                name: "Raiders",
                title: [
                    "Raider - Leather Jacket - Baseball bat",
                    "Raider - Leather Jacket - 9mm pistol",
                    "Raider - Leather Jacket - Combat shotgun",
                    "Raider - Leather Armor - Baseball bat",
                    "Raider - Leather Armor - 9mm pistol",
                    "Raider - Leather Armor - Combat shotgun"
                ],
                amount: { min: 1, max: 3 }
            },
            {
                name: "Cannibals",
                title: ["Cannibal man 1", "Cannibal woman 1", "Cannibal man 2"],
                amount: { min: 1, max: 2 }
            },
            {
                name: "Mantis",
                title: ["Mantis"],
                amount: { min: 1, max: 2 }
            },
            {
                name: "Rats",
                title: ["Rat"],
                amount: { min: 3, max: 6 }
            }
        ];
        // EXACT legacy soundtrack names
        this.soundtrackNames = [
            "A Traders Life (in NCR)",
            "All-Clear Signal (Vault City)",
            "Beyond The Canyon (Arroyo)",
            "California Revisited (Worldmap on foot)",
            "Khans of New California (in the Den)",
            "Moribund World (in Klamath)",
            "My Chrysalis Highwayman (Worldmap with Car)",
        ];
    }
    preload() {
        // EXACT legacy asset loading
        this.soundtrackNames.forEach((name) => {
            this.load.audio(name, "assets/sounds/battle_background/" + name + ".mp3");
        });
        this.load.audio("travel", "assets/psychobilly.mp3");
        this.load.video("road", "assets/road.mp4");
        this.load.image("yes", "assets/images/yes.png");
        this.load.image("no", "assets/images/no.png");
    }
    create() {
        // Stop all sounds from previous scenes (victory music, battle sounds, etc.)
        this.sound.stopAll();
        // Initialize GameDataService
        this.gameDataService = GameDataService.getInstance();
        this.gameDataService.init();
        this.gameData = this.gameDataService.get();
        // EXACT legacy soundtrack
        this.playRandomSoundtrack();
        // EXACT legacy video background
        const video = this.add.video(0, 0, "road").setOrigin(0);
        video.play(true); // true = loop
        // EXACT legacy input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // EXACT legacy popup setup
        this.createPopup();
        // EXACT legacy encounter timer
        this.startRandomEncounterTimer();
        // Add ESC key to return to main menu (for testing)
        this.input.keyboard.on('keydown-ESC', () => {
            this.sound.stopAll();
            if (this.soundtrack) {
                this.soundtrack.stop();
                this.soundtrack.destroy();
                this.soundtrack = null;
            }
            this.scene.start('MainMenu');
        });
    }
    update() {
        // EXACT legacy popup handling
        if (this.popupActive) {
            this.handlePopupInput();
        }
    }
    playRandomSoundtrack() {
        // EXACT legacy soundtrack logic with fallback for missing assets
        try {
            if (this.cache.audio.exists("travel")) {
                this.soundtrack = this.sound.add("travel");
                this.soundtrack.play();
                this.soundtrack.once("complete", () => {
                    this.playRandomSoundtrack(); // Loop to next soundtrack
                });
            }
            else {
                console.warn("Travel soundtrack not found, continuing without audio");
            }
        }
        catch (error) {
            console.warn("Audio playback failed, continuing without sound:", error);
        }
    }
    startRandomEncounterTimer() {
        // EXACT legacy encounter timer logic
        const n = 3;
        const m = 6;
        this.time.addEvent({
            delay: Phaser.Math.Between(n * 1000, m * 1000),
            callback: () => {
                if (!this.popupActive) {
                    const survivingSkill = this.gameData?.skills?.surviving || 0;
                    const randomChance = Phaser.Math.Between(1, 100);
                    if (randomChance <= survivingSkill) {
                        this.showPopup(true); // Can avoid - show both Yes and No buttons
                    }
                    else {
                        this.showPopup(false); // Cannot avoid - only Yes button
                    }
                }
                this.startRandomEncounterTimer();
            },
            loop: false,
        });
    }
    createPopup() {
        // EXACT legacy popup creation
        const cameraCenterX = this.cameras.main.width / 2;
        const cameraCenterY = this.cameras.main.height / 2;
        // Background modal
        this.popupBackground = this.add
            .graphics({ x: cameraCenterX, y: cameraCenterY })
            .fillStyle(0x000000, 0.75)
            .fillRect(-150, -100, 300, 200);
        this.popupBackground.setScrollFactor(0);
        // Text
        this.popupText = this.add
            .text(cameraCenterX, cameraCenterY - 50, "", {
            fontSize: "16px",
            color: "#0f0", // Legacy green color
        })
            .setOrigin(0.5);
        this.popupText.setScrollFactor(0);
        // Buttons
        this.yesButton = this.add
            .image(cameraCenterX - 50, cameraCenterY + 50, "yes")
            .setInteractive();
        this.yesButton.setScrollFactor(0);
        this.noButton = this.add
            .image(cameraCenterX + 50, cameraCenterY + 50, "no")
            .setInteractive();
        this.noButton.setScrollFactor(0);
        // Hide initially
        this.hidePopup();
    }
    showPopup(hasNoButton) {
        // EXACT legacy enemy generation
        const [enemyName, enemiesToCreate] = this.getLevelConfig(this.gameData?.levelCount || 1);
        this.gameData.enemiesToCreate = enemiesToCreate; // Save to gameData
        console.log(`You encounter ${enemyName}.`, enemiesToCreate);
        // Update text
        this.popupText.setText(`You encounter ${enemyName}.`);
        // Show background/text
        this.popupBackground.setVisible(true);
        this.popupText.setVisible(true);
        this.yesButton.setVisible(true);
        if (hasNoButton) {
            this.noButton.setVisible(true);
            // Position buttons apart
            this.yesButton.setPosition(this.cameras.main.width / 2 - 50, this.cameras.main.height / 2 + 50);
            this.noButton.setPosition(this.cameras.main.width / 2 + 50, this.cameras.main.height / 2 + 50);
            this.selectedButton = "No"; // Default to No like legacy
            this.yesButton.setScale(1);
            this.noButton.setScale(1.5); // Highlight selected
        }
        else {
            // No "No" button
            this.noButton.setVisible(false);
            this.yesButton.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50);
            this.selectedButton = "Yes";
            this.yesButton.setScale(1.5); // Highlight selected
        }
        this.popupActive = true;
    }
    hidePopup() {
        // EXACT legacy hide logic
        this.popupBackground.setVisible(false);
        this.popupText.setVisible(false);
        this.yesButton.setVisible(false);
        this.noButton.setVisible(false);
        this.popupActive = false;
    }
    handlePopupInput() {
        // EXACT legacy input handling
        if (this.noButton.visible) {
            if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
                this.selectedButton = "No";
                this.yesButton.setScale(1);
                this.noButton.setScale(1.5);
            }
            else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
                this.selectedButton = "Yes";
                this.yesButton.setScale(1.5);
                this.noButton.setScale(1);
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.selectedButton === "Yes") {
                if (this.soundtrack) {
                    this.soundtrack.stop();
                }
                console.log(`Starting battle with ${this.chosenEnemy.name}!`);
                console.log(`Enemies:`, this.gameData.enemiesToCreate);
                // Stop all sounds before transition
                this.sound.stopAll();
                if (this.soundtrack) {
                    this.soundtrack.stop();
                    this.soundtrack.destroy();
                    this.soundtrack = null;
                }
                // EXACT legacy scene transition - pass enemy data to BattleScene
                this.hidePopup();
                this.scene.start("BattleScene", {
                    enemyType: this.chosenEnemy.name,
                    enemies: this.gameData.enemiesToCreate
                });
            }
            else if (this.selectedButton === "No") {
                this.hidePopup();
            }
        }
    }
    getLevelConfig(playerLevel) {
        // EXACT legacy enemy generation logic
        const enemiesToCreate = [];
        // Choose random enemy
        this.chosenEnemy = Phaser.Utils.Array.GetRandom(this.enemies_all);
        const numberOfEnemies = Phaser.Math.Between(this.chosenEnemy.amount.min, this.chosenEnemy.amount.max);
        // Collect list of enemy names
        for (let i = 0; i < numberOfEnemies; i++) {
            const randomIndex = Math.floor(Math.random() * this.chosenEnemy.title.length);
            enemiesToCreate.push(this.chosenEnemy.title[randomIndex]);
        }
        return [this.chosenEnemy.name, enemiesToCreate];
    }
}
//# sourceMappingURL=WorldMapScene.js.map