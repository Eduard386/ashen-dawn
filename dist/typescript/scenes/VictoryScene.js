// VictoryScene with AssetLoader integration
import { AssetLoaderService } from '../core/services/AssetLoaderService.js';
export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: "VictoryScene" });
    }
    create(data = {}) {
        console.log("VictoryScene created");
        this.assetLoader = AssetLoaderService.getInstance();
        this.assetLoader.init(this);
        // Try to use victory background if available
        const victoryBg = this.assetLoader.getAssetWithFallback('victory_bg');
        if (victoryBg) {
            this.add.image(512, 300, victoryBg).setOrigin(0.5);
        }
        else {
            this.cameras.main.setBackgroundColor("#004400");
        }
        this.add.text(512, 300, "VICTORY!", { fontSize: "64px", color: "#00ff00" }).setOrigin(0.5);
        // Return to world map after delay
        this.time.delayedCall(2000, () => this.scene.start("WorldMap"));
    }
}
//# sourceMappingURL=VictoryScene.js.map