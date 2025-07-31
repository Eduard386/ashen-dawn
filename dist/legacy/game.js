// game.js
import MainMenu from './scenes/mainMenu.js';
import WorldMapScene from './scenes/WorldMapScene.js';
import BattleScene from './scenes/BattleScene.js';
import DeadScene from './scenes/DeadScene.js';
import VictoryScene from './scenes/VictoryScene.js';
import EncounterScene from './scenes/EncounterScene.js';
var config = {
    type: Phaser.WEBGL,
    width: 1024,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Пример: отключение гравитации
            debug: false // Включите для визуализации физических объектов
        }
    },
    scene: [MainMenu, WorldMapScene, EncounterScene, BattleScene, DeadScene, VictoryScene],
};
var game = new Phaser.Game(config);
//# sourceMappingURL=game.js.map