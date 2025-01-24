// game.js
import WorldMapScene from './WorldMapScene.js';
import MainMenu from './mainMenu.js';
import BattleScene from './BattleScene.js';
import DeadScene from './DeadScene.js';
import VictoryScene from './VictoryScene.js';
import EncounterScene from './EncounterScene.js';

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