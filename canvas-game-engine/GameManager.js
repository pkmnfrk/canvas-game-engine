define(['jquery',
        'emitter',
        'canvas-game-engine/Map',
        'canvas-game-engine/SpriteSheet',
        'canvas-game-engine/InputManager',
        'canvas-game-engine/Layer',
        'canvas-game-engine/LoadingManager'],
       function($, emitter, Map, SpriteSheet, InputManager, Layer, LoadingManager) {
    "use strict";
    
    var GameManager = function(options) {
        options = options || {};
        
        emitter(this);
        
        this.viewport = options.viewport;
        
        this.window = options.window || window;
        
        this.loadingManager = options.loadingManager || new LoadingManager();
        
        this.objectLoader = options.objectLoader;
        
        this.inputManager = new InputManager(options.inputSettings);
        
        this.onFrame = this.onFrame.bind(this);
        
        this.globalObjects = [];
        this.globalObjectNames = {};
        
        this._audioEngineLoadingEnd = this._audioEngineLoadingEnd.bind(this);
        this._audioEngineLoadingProgress = this._audioEngineLoadingProgress.bind(this);
        this._audioEngineLoadingStart = this._audioEngineLoadingStart.bind(this);
        this._mapLoadingEnd =      this._mapLoadingEnd.bind(this);
        this._mapLoadingProgress = this._mapLoadingProgress.bind(this);
        this._mapLoadingStart =    this._mapLoadingStart.bind(this);
        
        this.audioEngine = options.audioEngine;
        if(this.audioEngine && this.audioEngine.on) {
            //hopefully they support the necessary protocols
            this.audioEngine.on("loadingstart", this._audioEngineLoadingStart);
            this.audioEngine.on("loadingprogress", this._audioEngineLoadingProgress);
            this.audioEngine.on("loadingend", this._audioEngineLoadingEnd);
        }
    };
    
    GameManager.prototype = {
        main: null,
        map: null,
        mapLoading: 0,
        objectLoader: null,
        window: null,
        inputManager: null,
        lastDelta: null,
        stopping: false,
        frozen: false,
        viewport: null,
        audioEngine: null,
        audioEngineLoading: 0,
        
        globalObjects: null,
        globalObjectNames: null,
        
        loadingManager: null,
        
        _audioEngineLoadingStart: function(e) {
            this.audioEngineLoading = e.number;
        },
        
        _audioEngineLoadingProgress: function(e) {
            this.audioEngineLoading = e.number;
        },
        
        _audioEngineLoadingEnd: function(e) {
            this.audioEngineLoading = 0;
            if(this.mapLoading === 0) {
                this._loadingComplete();
            }
        },
        
        _mapLoadingStart: function(e) {
            
        },
        
        _mapLoadingEnd: function(e) {
            this.mapLoading = 0;
            if(this.audioEngineLoading === 0) {
                this._loadingComplete();
            }
        },
        
        _mapLoadingProgress: function(e) {
            this.mapLoading = e.number;
        },
        
        _loadingComplete: function() {
            this.emit('loadingend');
        },
        
        setMap: function(map) {
            if(this.map) {
                this.map.off("loadingstart", this._mapLoadingStart);
                this.map.off("loadingend", this._mapLoadingEnd);
                this.map.off("loadingprogress", this._mapLoadingProgress);
                this.map = null;
            }
            
            if(map) {
                this.map = map;
                this.map.on("loadingstart", this._mapLoadingStart);
                this.map.on("loadingend", this._mapLoadingEnd);
                this.map.on("loadingprogress", this._mapLoadingProgress);
                
                
                if(this.mapLoading) {
                    this.mapLoading = 0;
                    if(this.audioEngineLoading === 0) {
                        this._loadingComplete();
                    }
                }
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
            
            //this.map.clearSprites();
            var toDraw = [];
            
            for(i = 0; i < this.globalObjects.length; i++) {
                obj = this.globalObjects[i];
                if(obj.draw) {
                    toDraw.push(obj);
                }
            }
            
            for(i = 0; i < this.map.objects.length; i++) {
                obj = this.map.objects[i];
                if(obj.draw) {
                    toDraw.push(obj);
                }
            }
            
            for(i = 0; i < this.map.layers.length; i++) {
                obj = this.map.layers[i];
                toDraw.push(obj);
            }
            
            toDraw.sort(function(a, b) {
                var az = a.z || 0;
                var bz = b.z || 0;
                
                if(az == bz) {
                    if(Object.getPrototypeOf(a) == Layer.prototype) {
                        return -1;
                    }
                    return 1;
                }
                
                return az - bz;
            });
            
            this.viewport.clear();
            var ctx = this.viewport.canvas.getContext("2d");
            ctx.translate(-this.map.left, -this.map.top);
            
            //if an object wants to reset the transform, they can do so on an adhoc basis
            // context.setTransform(1, 0, 0, 1, 0, 0);
            for(i = 0; i < toDraw.length; i++) {
                toDraw[i].draw(ctx, this.viewport);
            }
            //this.map.draw();
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
        },
        
        loadMap: function(url) {
            var map = new Map({
                url: url,
                gameManager: this
            });
            
            return map;
        }
        
    };
    
    GameManager.Map = Map;
    GameManager.SpriteSheet = SpriteSheet;
    GameManager.InputManager = InputManager;
    
    return GameManager;
});