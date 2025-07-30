// Mock Phaser for testing purposes
export class Scene {
  add = {
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
  
  time = {
    now: 1000,
    delayedCall: jest.fn()
  };
  
  cameras = {
    main: {
      shake: jest.fn()
    }
  };
  
  tweens = {
    add: jest.fn()
  };
  
  scene = {
    start: jest.fn()
  };
  
  create = jest.fn();
}

export namespace Geom {
  export class Rectangle {
    static Contains = jest.fn();
    constructor(x: number, y: number, width: number, height: number) {}
  }
}

export namespace GameObjects {
  export class Image {
    x: number = 0;
    y: number = 0;
    setOrigin = jest.fn().mockReturnThis();
    setDisplaySize = jest.fn().mockReturnThis();
    destroy = jest.fn();
    texture = { key: 'test' };
    setTint = jest.fn();
    setInteractive = jest.fn().mockReturnThis();
    on = jest.fn().mockReturnThis();
  }
  
  export class Graphics {
    fillStyle = jest.fn().mockReturnThis();
    fillRect = jest.fn().mockReturnThis();
    fillRoundedRect = jest.fn().mockReturnThis();
    setInteractive = jest.fn().mockReturnThis();
    clear = jest.fn().mockReturnThis();
    on = jest.fn().mockReturnThis();
  }
  
  export class Text {
    setOrigin = jest.fn().mockReturnThis();
    setText = jest.fn().mockReturnThis();
  }
  
  export class Container {
    add = jest.fn().mockReturnThis();
  }
}

// Default export for ES module compatibility
const Phaser = {
  Scene,
  Geom,
  GameObjects
};

export default Phaser;
