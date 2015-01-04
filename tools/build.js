{
    "baseUrl": "../lib",
    "paths": {
        "canvasGameEngine": "../canvasGameEngine"
    },
    "include": ["../tools/almond", "canvasGameEngine"],
    "exclude": ["jquery"],
    "out": "../dist/canvasGameEngine.js",
    "wrap": {
        "startFile": "wrap.start",
        "endFile": "wrap.end"
    }
}
