

define(['canvas-game-engine/GameManager',
        'canvas-game-engine/GameObject',
        'canvas-game-engine/SpriteSheet',
        'canvas-game-engine/Viewport',
        'canvas-game-engine/LoadingManager',
        'canvas-game-engine/LoadingScreen'
       ],
       function(GameManager, GameObject, SpriteSheet, Viewport, LoadingManager, LoadingScreen) {
    "use strict";
    return {
        GameManager: GameManager,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject,
        Viewport: Viewport,
        LoadingManager: LoadingManager,
        LoadingScreen: LoadingScreen
        
    };
});