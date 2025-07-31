// Simple VictoryScene export
export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "VictoryScene" });
    }
    create(data = {}) {
        console.log("VictoryScene created");
        this.cameras.main.setBackgroundColor("#004400");
        this.add.text(512, 300, "VICTORY!", { fontSize: "64px", color: "#00ff00" }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.scene.start("WorldMap"));
    }
}
//# sourceMappingURL=VictoryScene.js.map