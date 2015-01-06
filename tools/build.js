{
    "baseUrl": "../lib",
    "paths": {
        "canvas-game-engine": "../canvas-game-engine"
    },
    "include": ["../tools/almond", "canvas-game-engine"],
    "exclude": ["jquery"],
    "out": "../dist/canvas-game-engine.js",
    "wrap": {
        "startFile": "wrap.start",
        "endFile": "wrap.end"
    }
}
