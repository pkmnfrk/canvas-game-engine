

define(['canvas-game-engine/GameManager',
        'canvas-game-engine/GameObject',
        'canvas-game-engine/SpriteSheet'
       ],
       function(GameManager, GameObject, SpriteSheet) {
    "use strict";
    return {
        GameManager: GameManager,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject
    };
});