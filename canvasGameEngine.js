

define(['canvasGameEngine/GameManager',
        'canvasGameEngine/GameObject',
        'canvasGameEngine/SpriteSheet'
       ],
       function(GameManager, GameObject, SpriteSheet) {
    "use strict";
    return {
        GameManager: GameManager,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject
    };
});