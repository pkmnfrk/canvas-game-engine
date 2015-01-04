define(['canvasGameEngine/Map', 'canvasGameEngine/SpriteSheet', 'canvasGameEngine/InputManager'], function(Map, SpriteSheet, InputManager) {
    "use strict";
    
    var GameManager = function(options) {
        options = options || {};
        
        this.main = options.main;
        
        this.window = options.window;
        
        this.objectLoader = options.objectLoader;
        
        this.inputManager = new InputManager(options.inputSettings);
        
        this.onFrame = this.onFrame.bind(this);
        
        this.globalObjects = [];
        this.globalObjectNames = {};
    };
    
    GameManager.prototype = {
        main: null,
        map: null,
        objectLoader: null,
        window: null,
        inputManager: null,
        lastDelta: null,
        stopping: false,
        frozen: false,
        
        globalObjects: null,
        globalObjectNames: null,
        
        setMap: function(map) {
            if(this.map) {
                this.map.detatch();
                this.map = null;
            }
            
            if(map) {
                this.map = map;
                this.map.attach(this.main, this);
            }
        },
        
        setBackground: function(bg) {
            this.main.style.background = bg;
        },
        
        start: function() {
            this.stopping = false;
            this.window.requestAnimationFrame(this.onFrame);
        },
        
        stop: function() {
            this.stopping = true;
        },
        
        freeze: function() {
            this.frozen = true;
        },
        
        unfreeze: function() {
            this.frozen = false;
        },
        
        onFrame: function(fullDelta) {
            var i, obj;
            if(this.stopping) {
                this.stopping = false;
                return;
            }
            this.window.requestAnimationFrame(this.onFrame);
            
            this.inputManager.update();
            
            if(this.lastDelta === null) {
                this.lastDelta = fullDelta;
            }
            
            var tmp = this.lastDelta;
            this.lastDelta = fullDelta;
            
            fullDelta = fullDelta - tmp;
            
            while(fullDelta > 0) {
                var delta = Math.min(fullDelta, 100);
                
                fullDelta -= delta;
                
                if(!this.frozen) {
                    for(i = 0; i < this.globalObjects.length; i++) {
                        obj = this.globalObjects[i];
                        if(obj.update) {
                            obj.update(delta / 1000, this.inputManager, this.map);
                        }
                    }

                    if(this.map) {
                        this.map.update(delta / 1000, this.inputManager);
                    }
                }
            }
            
            this.map.clearSprites();
            for(i = 0; i < this.globalObjects.length; i++) {
                obj = this.globalObjects[i];
                if(obj.draw) {
                    obj.draw(this.map);
                }
            }
            this.map.draw();
        },
        
        findObjectByName: function(name) {
            return this.globalObjectNames[name];
        },
        
        addObject: function(obj) {
            this.globalObjects.push(obj);
            
            if(obj.name) {
                this.globalObjectNames[obj.name] = obj;
            }
        },
        
        destroyObject: function(obj) {
            if(this.globalObjects.indexOf(obj) !== -1) {
                this.globalObjects.splice(this.globalObjects.indexOf(obj), 1);
            }
            if(obj.name) {
                delete this.globalObjectNames[obj.name];
            }
        }
        
    };
    
    GameManager.Map = Map;
    GameManager.SpriteSheet = SpriteSheet;
    GameManager.InputManager = InputManager;
    
    return GameManager;
});