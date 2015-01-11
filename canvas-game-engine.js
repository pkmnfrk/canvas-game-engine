

define(['canvas-game-engine/GameManager',
        'canvas-game-engine/GameObject',
        'canvas-game-engine/SpriteSheet',
        'canvas-game-engine/Viewport',
        'canvas-game-engine/LoadingManager'
       ],
       function(GameManager, GameObject, SpriteSheet, Viewport, LoadingManager) {
    "use strict";
    return {
        GameManager: GameManager,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject,
        Viewport: Viewport,
        LoadingManager: LoadingManager
        
    };
});