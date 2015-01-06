define(['jquery',
        'canvas-game-engine/Layer',
        'canvas-game-engine/Tileset',
        'canvas-game-engine/SolidDebugLayer',
        'canvas-game-engine/BlankLayer',
        'emitter',
        'canvas-game-engine/DomHelpers',
        'canvas-game-engine/GameObject'],
function($, Layer, Tileset, SolidDebugLayer, BlankLayer, emitter, DOM, GameObject) {
    "use strict";
    
    var Map = function(options) {
        options = options || {};

        emitter(this);
        
        this.url = options.url;
        this.layers = [];
        this.tilesets = [];
        this.solid = [];
        this.tilesetCache = {};
        this.objects = [];
        this.objectNames = {};
        
        if(this.url.lastIndexOf('/') != -1) {
            this.rootUrl = this.url.substr(0, this.url.lastIndexOf('/'));
        }
        
        
        $.ajax({
            type: "GET",
            url: this.url,
            dataType: "xml",
            success: (function(xmlData) {
                this.data = xmlData;
                this.parseData(options.gameManager);
            }).bind(this),
            error: function() {
                
            }
        });
        
        Object.defineProperties(this, {
            left: {
                configurable: false,
                get: function() {
                    return this._left;
                },
                set: function(val) {
                    this._left = val;
                    this.updateLayers();
                }
            },
            
            top: {
                configurable: false,
                get: function() {
                    return this._top;
                },
                
                set: function(val) {
                    this._top = val;
                    this.updateLayers();
                }
            },
        });
    };
    
    Map.prototype = {
        url: null,
        data: null,
        layers: null,
        tilesets: null,
        rootUrl: "",
        attached: null,
        solid: null,
        tileWidth: 0,
        tileHeight: 0,
        width: 0,
        height: 0,
        pixelWidth: 0,
        pixelHeight: 0,
        objects: null,
        gameManager: null,
        
        
        spriteLayer: null,
        spriteContext: null,
        backgroundColor: "white",
        loaded: false,
        
        objectNames: null,
        
        _left: 0,
        _top: 0,
        
        frozen: false,
        
        parseData: function(gameManager) {
            var i;
            var toLoad = 0;
            
            
            this.parseMapNode(gameManager, this.data.documentElement);
            
            
            if(this.backgroundColor && this.attached) {
                this.attached.style.backgroundColor = this.backgroundColor;
            }
            
            this.solid = new Array(this.height);
            for(i = 0; i < this.height; i++) {
                this.solid[i] = new Array(this.width);
            }
            
            this.pixelWidth = this.width * this.tileWidth;
            this.pixelHeight = this.height * this.tileHeight;
            
            var onTilesetLoad = (function() {
                toLoad--;
                window.console.log("Waiting for", toLoad, "more tilesets and layers");
                if(toLoad === 0) {
                    this.tilesetsLoaded();
                }
            }).bind(this);
            
            for(i = 0; i < this.tilesets.length; i++) {
                if(!this.tilesets[i].loaded) {
                    toLoad++;
                    this.tilesets[i].on('loaded', onTilesetLoad);
                }
            }
            
            for(i = 0; i < this.layers.length; i++) {
                if(!this.layers[i].loaded) {
                    toLoad++;
                    this.layers[i].on('loaded', onTilesetLoad);
                }
            }
            
            if(!toLoad) {
                this.tilesetsLoaded();
            }
            
            
        },
        
        tilesetsLoaded: function() {
            this.recalculateSolids();
            
            if(false) {
                var solidLayer = new SolidDebugLayer({
                    data: this.solid,
                    map: this
                });

                this.layers.push(solidLayer);

                if(this.attached) {
                    solidLayer.attach(this.attached);
                }
            }
            
            this.updateLayers();
            this.loaded = true;
            this.emit('loaded');
        },
        
        parseMapNode: function(gameManager, map) {
            DOM.attributes(map, function(attr) {
                switch(attr.name) {
                    case "width":
                        this.width = parseInt(attr.value, 10);
                        break;
                    case "height":
                        this.height = parseInt(attr.value, 10);
                        break;
                    case "tilewidth":
                        this.tileWidth = parseInt(attr.value, 10);
                        break;
                    case "tileheight":
                        this.tileHeight = parseInt(attr.value, 10);
                        break;
                    case "backgroundcolor":
                        this.backgroundColor = attr.value;
                        break;
                    case "version":
                    case "orientation":
                    case "renderorder":
                        break;
                    default:
                        window.console.warn("Unexpected attribute", attr);
                }
            }, this);
            
            DOM.children(map, function(node) {
                switch(node.nodeName) {
                    case "#text":
                        break;
                    case "tileset":
                        var tst = new Tileset({
                            map: this,
                            node: node
                        });

                        this.tilesets.push(tst);
                        break;
                    case "layer":
                        var layer = new Layer({
                            map: this,
                            node: node
                        });

                        this.layers.push(layer);

                        if(this.attached) {
                            layer.attach(this.attached);
                        }
                        break;
                    case "objectgroup":
                        this.parseObjectgroup(gameManager, node);
                        break;
                    default:
                        window.console.warn("Unexpected map node", node);
                }
            }, this);
        },
        
        makeObject: function(obj) {
            var o = {};
            DOM.attributes(obj, function(attr) {
                o[attr.name] = attr.value;
            }, this);
            
            DOM.children(obj, function(node) {
                if(node.nodeName == "properties") {
                    DOM.children(node, function(property) {
                        var name, val;
                        if(property.nodeName != "property") return;
                        
                        DOM.attributes(property, function(attr) {
                            if(attr.name == "name") {
                                name = attr.value;
                            } else if(attr.name == "value") {
                                val = attr.value;
                            }
                        }, this);
                        
                        if(name) {
                            o[name] = val;
                        }
                    }, this);
                }
            }, this);
            
            return o;
        },
        
        parseObjectgroup: function(gameManager, objectgroup) {
            DOM.children(objectgroup, function(node) {
                if(node.nodeName == "object") {
                    var obj;
                    var o = this.makeObject(node);
                    if(gameManager.objectLoader) {
                        obj = gameManager.objectLoader.createObject(o);
                    } else {
                        obj = new GameObject(o);
                    }
                    
                    if(obj) {
                        this.addObject(obj);
                    }
                }
            }, this);
        },
        
        recalculateSolids: function () {
            for(var y = 0; y < this.height; y++) {
                for(var x = 0; x < this.width; x++) {
                //this.solid[x] = [];
                
                    var solid = false;
                    
                    for(var l = 0; l < this.layers.length; l++) {
                        var tile = this.layers[l].data[y][x];
                        
                        var tst = this.tilesetForTile(tile);
                        if(!tst) continue;
                        
                        var ltile = tile - tst.firstgid;

                        if(tst.tiles[ltile] && typeof tst.tiles[ltile].properties.solid != "undefined") {
                            if(tst.tiles[ltile].properties.solid === true) {
                                solid = true;
                            } else {
                                solid = false;
                            }
                        } else if(tst.properties.defaultSolid === true) {
                            solid = true;
                        }

                        if(solid) break;
                        
                    }
                    
                    this.solid[y][x] = solid;
                }
            }
        },
        
        detatch: function() {
            for(var i = 0; i < this.layers.length; i++) {
                this.layers[i].detatch();
            }
            delete this.attached;
            
            if(this.spriteLayer) {
                this.spriteLayer.parentElement.removeChild(this.spriteLayer);
                delete this.spriteLayer;
                delete this.spriteContext;
            }
            
            this.gameManager = null;
        },
        
        attach: function(root, manager) {
            for(var i = 0; i < this.layers.length; i++) {
                this.layers[i].attach(root);
            }
            this.attached = root;
            
            this.spriteLayer = document.createElement("canvas");
            this.spriteLayer.width = 512;
            this.spriteLayer.height = 512;
            this.spriteLayer.style.zIndex = 200;
            this.spriteLayer.style.position = "absolute";
            this.spriteContext = this.spriteLayer.getContext("2d");
            root.appendChild(this.spriteLayer);
            
            this.gameManager = manager;
        },
        
        freeze: function() {
            if(this.gameManager) this.gameManager.freeze();
        },
        
        unfreeze: function() {
            if(this.gameManager) this.gameManager.unfreeze();
        },
        
        drawTile: function(ctx, i, dx, dy) {
            var tst = this.tilesetForTile(i);
            
            if(tst) {
                if(ctx == "sprite") {
                    ctx = this.spriteContext;
                    dx -= this._left;
                    dy -= this._top;
                }
                tst.drawTile(ctx, i, dx, dy);
            }
        },
        
        updateLayers: function() {
            for(var i = 0; i < this.layers.length; i++) {
                this.layers[i].update();
            }
        },
        
        update: function(delta, input) {
            var i;
            
            for(i = 0; i < this.objects.length; i++) {
                this.objects[i].update(delta, input, this);
            }
        },
        
        draw: function() {
            var i;
            
            for(i = 0; i < this.objects.length; i++) {
                this.objects[i].draw(this);
            }
        },
        
        tilesetForTile: function(i) {
            if(i === 0) return null;
            if(!this.tilesetCache[i]) {
                for(var t = this.tilesets.length - 1; t >= 0; t--) {
                    if(this.tilesets[t].firstgid <= i) {
                        this.tilesetCache[i] = this.tilesets[t];
                        break;
                    }
                }
            }
            
            return this.tilesetCache[i];
        },
        
        rectContainsSolid: function(rect) {
            //if(!this.loaded) return true;
            var rxa = Math.floor(rect[0] / this.tileWidth);
            var rxb = Math.floor((rect[0] + rect[2] - 1) / this.tileWidth);
            var rya = Math.floor(rect[1] / this.tileHeight);
            var ryb = Math.floor((rect[1] + rect[3] - 1) / this.tileHeight);
            
            for(var x = rxa; x <= rxb; x++) {
                for(var y = rya; y <= ryb; y++) {
                    if(this.solid[y][x]) return true;
                }
            }
            
            //no tiles, but maybe objects?
            var hasSolid = false;
            this.rectContainsObject(rect, function(obj){
                if(obj.solid) {
                    hasSolid = true;
                    return true;
                }
            }, this);
            
            return hasSolid;
        },
        
        rectContainsObject: function(rect, cb, context) {
            for(var i = 0; i < this.objects.length; i++) {
                var obj = this.objects[i];
                
                if(obj === context) continue;
                
                var box = obj.boundingBox;
                
                if(!box) continue;
                
                if(rect[0] + rect[2] > box[0] &&
                   rect[0] < box[0] + box[2]  &&
                   rect[1] + rect[3] > box[1] &&
                   rect[1] < box[1] + box[3]) {
                    
                    if(cb.call(context, obj))
                        return;
                }
            }
        },
        
        clearSprites: function() {
            if(this.spriteLayer) {
                this.spriteLayer.width = this.spriteLayer.width;
            }
            if(this.debugLayer) {
                this.debugLayer.clear();
            }
        },
        
        drawDebugRect: function(rect) {
            if(!this.debugLayer) {
                this.debugLayer = new BlankLayer({
                    map: this
                });
                this.layers.push(this.debugLayer);
                if(this.attached) this.debugLayer.attach(this.attached);
            }
            
            var ctx = this.debugLayer.canvas.getContext("2d");
            
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(rect[0], rect[1], rect[2], rect[3]);
            ctx.stroke();
            
        },
        
        findObjectByName: function(name) {
            return this.objectNames[name];
        },
        
        addObject: function(obj) {
            this.objects.push(obj);
            
            if(obj.name) {
                this.objectNames[obj.name] = obj;
            }
        },
        
        destroyObject: function(obj) {
            if(this.objects.indexOf(obj) !== -1) {
                this.objects.splice(this.objects.indexOf(obj), 1);
            }
            if(obj.name) {
                delete this.objectNames[obj.name];
            }
        }
    };
    
    return Map;
});