

define(['canvas-game-engine/GameManager',
        'canvas-game-engine/GameObject',
        'canvas-game-engine/SpriteSheet',
        'canvas-game-engine/Viewport'
       ],
       function(GameManager, GameObject, SpriteSheet, Viewport) {
    "use strict";
    return {
        GameManager: GameManager,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject,
        Viewport: Viewport
        
    };
});