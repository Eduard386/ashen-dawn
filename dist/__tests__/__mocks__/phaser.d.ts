export declare class Scene {
    add: {
        image: jest.Mock<any, any, any>;
        graphics: jest.Mock<any, any, any>;
        text: jest.Mock<any, any, any>;
        container: jest.Mock<any, any, any>;
    };
    time: {
        now: number;
        delayedCall: jest.Mock<any, any, any>;
    };
    cameras: {
        main: {
            shake: jest.Mock<any, any, any>;
        };
    };
    tweens: {
        add: jest.Mock<any, any, any>;
    };
    scene: {
        start: jest.Mock<any, any, any>;
    };
    create: jest.Mock<any, any, any>;
}
export declare namespace Geom {
    class Rectangle {
        static Contains: jest.Mock<any, any, any>;
        constructor(x: number, y: number, width: number, height: number);
    }
}
export declare namespace GameObjects {
    class Image {
        x: number;
        y: number;
        setOrigin: jest.Mock<any, any, any>;
        setDisplaySize: jest.Mock<any, any, any>;
        destroy: jest.Mock<any, any, any>;
        texture: {
            key: string;
        };
        setTint: jest.Mock<any, any, any>;
        setInteractive: jest.Mock<any, any, any>;
        on: jest.Mock<any, any, any>;
    }
    class Graphics {
        fillStyle: jest.Mock<any, any, any>;
        fillRect: jest.Mock<any, any, any>;
        fillRoundedRect: jest.Mock<any, any, any>;
        setInteractive: jest.Mock<any, any, any>;
        clear: jest.Mock<any, any, any>;
        on: jest.Mock<any, any, any>;
    }
    class Text {
        setOrigin: jest.Mock<any, any, any>;
        setText: jest.Mock<any, any, any>;
    }
    class Container {
        add: jest.Mock<any, any, any>;
    }
}
declare const Phaser: {
    Scene: typeof Scene;
    Geom: typeof Geom;
    GameObjects: typeof GameObjects;
};
export default Phaser;
