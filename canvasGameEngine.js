

define(['canvasGameEngine/GameManager',
        'canvasGameEngine/Map',
        'canvasGameEngine/Layer',
        'canvasGameEngine/GameObject',
        'canvasGameEngine/SpriteSheet',
        'canvasGameEngine/DomHelpers'
       ],
       function(GameManager, Map, Layer, GameObject, SpriteSheet, DomHelpers) {
    "use strict";
    return {
        GameManager: GameManager,
        Map: Map,
        Layer: Layer,
        SpriteSheet: SpriteSheet,
        GameObject: GameObject,
        DOM: DomHelpers
    };
});