define(['emitter', 'canvas-game-engine/DomHelpers', 'canvas-game-engine/Binary', 'gunzip', 'inflate'], function(emitter, DOM, Binary, Gunzip, Inflate) {
    "use strict";
    var Layer = function(options) {
        options = options || {};
        
        emitter(this);
        
        this.map = options.map;
        this.canvas = document.createElement("canvas");
        this.canvas.style.zIndex = options.zindex;
        this.context = this.canvas.getContext("2d");
        
        if(options.data) {
            this.data = options.data;
            this.canvas.width = this.map.tileWidth * this.width;
            this.canvas.height = this.map.tileHeight * this.height;
            this.canvas.style.opacity = this.opacity;

            this.drawMap();
            this.update();
        } else if(options.node) {
            this.parseLayer(options.node);
        }
    };
    
    Layer.prototype = {
        map: null,
        data: null,
        canvas: null,
        attached: null,
        loaded: false,
        opacity: 1,
        width: 1,
        height: 1,
        tileWidth: 0,
        tileHeight: 0,
        context: null,
        rawBuffer: null,
        x: 0,
        y: 0,
        
        
        parseLayer: function(layer) {
//            var i;
            
            DOM.attributes(layer, function(attr) {
                switch(attr.name) {
                    case "name":
                        this.name = attr.value;
                        break;
                    case "width":
                        this.width = parseInt(attr.value, 10);
                        break;
                    case "height":
                        this.height = parseInt(attr.value, 10);
                        break;
                    default: 
                        window.console.warn("Unexpected layer attribute", attr);
                }
            }, this);
            
            DOM.children(layer, function(node) {
                switch(node.nodeName) {
                    case "#text":
                        break;
                    case "data":
                        this.parseData(node);
                        break;
                    default:
                        window.console.warn("Unexpected layer node", node);
                }
            }, this);
        },
        
        parseData: function(data) {
            var encoding = null, compression = null, i;
            DOM.attributes(data, function(attr) {
                switch(attr.name) {
                    case "encoding":
                        encoding = attr.value;
                        break;
                    case "compression":
                        compression = attr.value;
                        break;
                    default:
                        window.console.warn("Unexpected layer data attribute", attr);
                }
            }, this);
            
            this.data = new Array(this.width);
            
            var els, dataLoaded = false;
            
            if(encoding == "csv") {
                els = data.innerHTML.replace(/\s/g, "");

                els = els.split(",");
                if(els.length != this.width * this.height) {
                    window.console.error("Incorrect number of data elements. Expected", this.width * this.height, "got", els.length);
                    this.loaded = true;
                    this.emit("loaded");
                    return;
                }
                
                this.rawBuffer = new ArrayBuffer(els.length * 4);
                
            } else if(encoding == "base64") {
                els = data.innerHTML.replace(/\s/g,"");
                
                this.rawBuffer = Binary.base64DecToBuffer(els);
                
                var inputArray, inflated;
                if(compression == "gzip") {
                    inputArray = new Uint8Array(this.rawBuffer);
                    
                    var gunzip = new Gunzip(inputArray);
                    inflated = gunzip.decompress();
                    
                    this.rawBuffer = inflated.buffer;
                } else if(compression == "zlib") {
                    inputArray = new Uint8Array(this.rawBuffer);
                    
                    var inflate = new Inflate(inputArray, {
                        bufferSize: this.width * this.height * 4,
                        bufferType: Inflate.BufferType.BLOCK
                    });
                    inflated = inflate.decompress();
                    
                    this.rawBuffer = inflated.buffer;
                    
                } else if(!compression) {
                    
                } else {
                    window.console.error("Unsupported compression", compression);
                    this.loaded = true;
                    this.emit("loaded");
                    return;
                }
                
                dataLoaded = true;
            } else if(!encoding) {
                window.console.error("Explicitly not support XML encoding format. Why would you use that when literally any other option is better?");
                this.loaded = true;
                this.emit("loaded");
                return;
            } else {
                window.console.error("Unsupported encoding", encoding);
                this.loaded = true;
                this.emit("loaded");
                return;
            }
                
            
            var tileCache = {};
            
            for(i = 0; i < this.height; i++) {
                this.data[i] = new Uint32Array(this.rawBuffer, this.width * 4 * i, this.width);
            }
            
            var tiles = this.width * this.height;
            for(i = 0; i < tiles; i++) {
                var x = i % this.width;
                var y = Math.floor(i / this.width);
                
                if(!dataLoaded) {
                    this.data[y][x] = parseInt(els[i], 10);
                }
                
                tileCache[this.data[y][x]] = true;
            }
            
            var tilesets = [];
            
            //if we're lucky, all the tilesets have loaded by now!
            
            //first, collect a unique set of tilesets
            for(i in tileCache) {
                tileCache[i] = this.map.tilesetForTile(parseInt(i, 10));
                
                if(tileCache[i] && tilesets.indexOf(tileCache[i]) === -1) {
                    tilesets.push(tileCache[i]);
                }
            }
            
            var onLoad = (function() {
                toLoad--;
                window.console.log("Waiting for", toLoad, "more tilesets");
                if(toLoad === 0) {
                    this.tilesetsLoaded();
                }
            }).bind(this);
            
            var toLoad = 0;
            //next, check each unique tileset
            for(i = 0; i < tilesets.length; i++) {
                if(!tilesets[i].loaded) {
                    toLoad++;
                    tilesets[i].on('loaded', onLoad);
                }
            }
            
            if(toLoad === 0) {
                this.tilesetsLoaded();
            }
        },
        
        tilesetsLoaded: function() {
            this.canvas.width = this.map.tileWidth * this.width;
            this.canvas.height = this.map.tileHeight * this.height;
            this.canvas.style.opacity = this.opacity;
            
            this.drawMap();
            
            this.loaded = true;
            this.emit('loaded');
        },
        
        attach: function(root) {
            if(this.attached) {
                this.detatch();
            }
            
            this.attached = root;
            if(this.canvas) {
                root.appendChild(this.canvas);
            }
        },
        
        detatch: function() {
            if(this.attached) {
                if(this.canvas) this.attached.removeChild(this.canvas);
                this.attached = null;
            }
        },
        
        drawMap: function() {
            var ptr = 0;
            
            
            for(var y = 0; y < this.height; y++) {
                var dy = y * this.map.tileHeight;
                for(var x = 0; x < this.width; x++) {
                    var dx = x * this.map.tileWidth;
                    
                    if(x == 169 && y == 92) {
                        window.console.log(this.data[y][x]);
                    }
                    
                    this.map.drawTile(this.context, this.data[y][x], dx, dy);
                    
                    ptr++;
                }
            }
                
        },
        
        update: function() {
            if(this.canvas) {
                this.canvas.style.left = Math.floor(this.x - this.map.left) + "px";
                this.canvas.style.top = Math.floor(this.y - this.map.top) + "px";
            }
        }
    };
    
    return Layer;
});