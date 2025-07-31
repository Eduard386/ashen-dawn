// Mock Phaser for testing purposes
export class Scene {
    constructor() {
        this.add = {
            image: jest.fn().mockReturnValue({
                setOrigin: jest.fn().mockReturnThis(),
                setDisplaySize: jest.fn().mockReturnThis(),
                destroy: jest.fn(),
                texture: { key: 'test' },
                x: 100,
                y: 100,
                setTint: jest.fn(),
                setInteractive: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis()
            }),
            graphics: jest.fn().mockReturnValue({
                fillStyle: jest.fn().mockReturnThis(),
                fillRect: jest.fn().mockReturnThis(),
                fillRoundedRect: jest.fn().mockReturnThis(),
                setInteractive: jest.fn().mockReturnThis(),
                clear: jest.fn().mockReturnThis(),
                on: jest.fn().mockReturnThis()
            }),
            text: jest.fn().mockReturnValue({
                setOrigin: jest.fn().mockReturnThis(),
                setText: jest.fn().mockReturnThis()
            }),
            container: jest.fn().mockReturnValue({
                add: jest.fn().mockReturnThis()
            })
        };
        this.time = {
            now: 1000,
            delayedCall: jest.fn()
        };
        this.cameras = {
            main: {
                shake: jest.fn()
            }
        };
        this.tweens = {
            add: jest.fn()
        };
        this.scene = {
            start: jest.fn()
        };
        this.create = jest.fn();
    }
}
export var Geom;
(function (Geom) {
    class Rectangle {
        constructor(x, y, width, height) { }
    }
    Rectangle.Contains = jest.fn();
    Geom.Rectangle = Rectangle;
})(Geom || (Geom = {}));
export var GameObjects;
(function (GameObjects) {
    class Image {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.setOrigin = jest.fn().mockReturnThis();
            this.setDisplaySize = jest.fn().mockReturnThis();
            this.destroy = jest.fn();
            this.texture = { key: 'test' };
            this.setTint = jest.fn();
            this.setInteractive = jest.fn().mockReturnThis();
            this.on = jest.fn().mockReturnThis();
        }
    }
    GameObjects.Image = Image;
    class Graphics {
        constructor() {
            this.fillStyle = jest.fn().mockReturnThis();
            this.fillRect = jest.fn().mockReturnThis();
            this.fillRoundedRect = jest.fn().mockReturnThis();
            this.setInteractive = jest.fn().mockReturnThis();
            this.clear = jest.fn().mockReturnThis();
            this.on = jest.fn().mockReturnThis();
        }
    }
    GameObjects.Graphics = Graphics;
    class Text {
        constructor() {
            this.setOrigin = jest.fn().mockReturnThis();
            this.setText = jest.fn().mockReturnThis();
        }
    }
    GameObjects.Text = Text;
    class Container {
        constructor() {
            this.add = jest.fn().mockReturnThis();
        }
    }
    GameObjects.Container = Container;
})(GameObjects || (GameObjects = {}));
// Default export for ES module compatibility
const Phaser = {
    Scene,
    Geom,
    GameObjects
};
export default Phaser;
//# sourceMappingURL=phaser.js.map