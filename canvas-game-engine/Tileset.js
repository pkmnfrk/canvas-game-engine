define(['canvas-game-engine/Path', 'jquery', 'emitter'], function(Path, $, emitter) {
    "use strict";
    
    var Tileset = function(options) {
        options = options || {};
        
        emitter(this);
        
        this.map = options.map;
        
        this.properties = {};
        this.tiles = {};
        
        if(options.data) {
            this.data = options.data;


            this.image = new Image();
            this.image.src = Path.combine(this.map.rootUrl, this.data.image);
            this.image.onload = options.onload;
        } else if(options.node) {
            this.parseTilesetNode(options.node);
        }
    };
    
    Tileset.prototype = {
        data: null,
        image: null,
        map: null,
        firstgid: null,
        name: null,
        tileWidth: 0,
        tileHeight: 0,
        properties: null,
        tiles: null,
        imageWidth: 0,
        imageHeight: 0,
        loaded: false,
        tilesPerRow: 0,
        
        parseTilesetNode: function(tileset) {
            var i;
            
            for(i = 0; i < tileset.attributes.length; i++) {
                var attr = tileset.attributes[i];
                switch(attr.name) {
                    case "firstgid":
                        this.firstgid = parseInt(attr.value, 10);
                        break;
                    case "source":
                        
                        this.handleSourceAttribute(attr);
                        
                        break;
                    case "name":
                        this.name = attr.value;
                        break;
                    case "tilewidth":
                        this.tileWidth = parseInt(attr.value, 10);
                        break;
                    case "tileheight":
                        this.tileHeight = parseInt(attr.value, 10);
                        break;
                    default:
                        window.console.warn("Unexpected tileset attribute", attr);
                        break;
                }
            }
            
            for(i = 0; i < tileset.childNodes.length; i++) {
                var node = tileset.childNodes[i];
                
                switch(node.nodeName) {
                    case "#text":
                        continue;
                    case "properties":
                        this.parseProperties(node);
                        break;
                    case "tile":
                        this.parseTile(node);
                        break;
                    case "image":
                        this.parseImage(node);
                        break;
                    default:
                        window.console.warn("Unexpected tileset node", node);
                }
            }
            
            this.tilesPerRow = Math.floor(this.imageWidth / this.tileWidth);
        },
        
        parseProperties: function(properties) {
            var i;
            
            for(i = 0; i < properties.childNodes.length; i++) {
                var node = properties.childNodes[i];
                
                switch(node.nodeName) {
                    case "#text":
                        break;
                    case "property":
                        var prop = this.parseProperty(node);
                        this.properties[prop.name] = prop.value;
                        break;
                    default:
                        window.console.warn("Unexpected tileset property node", node);
                        break;
                }
            }
        },
        
        parseProperty: function(property) {
            var i;
            var name, value;
            
            for(i = 0; i < property.attributes.length; i++) {
                var attr = property.attributes[i];
                switch(attr.name) {
                    case "name":
                        name = attr.value;
                        break;
                    case "value":
                        value = attr.value;
                        break;
                    default:
                        window.console.warn("Unexpected property attribute", attr);
                }
            }
            
            if(value === "true") value = true;
            else if(value === "false") value = false;
            else if(value === "null") value = null;
            
            // to be clear, yes, I want to compare, eg 99 == "99", and get true
            else if(parseInt(value, 10) == value) value = parseInt(value, 10); 
            
            return { name: name, value: value };
        },
        
        parseTile: function(tileNode) {
            var i;
            var id;
            var tile = {
                properties: {}
            };
            
            for(i = 0; i < tileNode.attributes.length; i++) {
                var attr = tileNode.attributes[i];
                switch(attr.name) {
                    case "id":
                        id = parseInt(attr.value, 10);
                        break;
                    default:
                        window.console.warn("Unexpected tile attribute", attr);
                }
            }
            
            for(i = 0; i < tileNode.childNodes.length; i++) {
                var node = tileNode.childNodes[i];
                
                switch(node.nodeName) {
                    case "#text":
                        break;
                    case "properties":
                        this.parseTileProperties(tile, node);
                        break;
                    default:
                        window.console.warn("Unexpected tile node", node);
                        break;
                }
            }
            
            this.tiles[id] = tile;
        },
        
        parseTileProperties: function(tile, properties) {
            var i;
            
            for(i = 0; i < properties.childNodes.length; i++) {
                var node = properties.childNodes[i];
                
                switch(node.nodeName) {
                    case "#text":
                        break;
                    case "property":
                        var prop = this.parseProperty(node);
                        tile.properties[prop.name] = prop.value;
                        break;
                    default:
                        window.console.warn("Unexpected tile property node", node);
                        break;
                }
            }
        },
        
        parseImage: function(image) {
            var i;
            
            for(i = 0; i < image.attributes.length; i++) {
                var attr = image.attributes[i];
                switch(attr.name) {
                    case "source":
                        
                        this.image = new Image();
                        this.image.src = Path.combine(this.map.rootUrl, attr.value);
                        this.image.onload = (function() {
                            
                            this.loaded = true;
                            this.emit('loaded');
                            
                        }).bind(this); //jshint ignore:line
                        
                        break;
                    case "width":
                        this.imageWidth = parseInt(attr.value, 10);
                        break;
                    case "height":
                        this.imageHeight = parseInt(attr.value, 10);
                        break;
                    default:
                        window.console.warn("Unexpected tile attribute", attr);
                }
            }
        },
        
        handleSourceAttribute: function(attr) {
            $.ajax({
                type: "GET",
                url: Path.combine(this.map.rootUrl, attr.value),
                dataType: "xml",
                success: (function(xmlData) {
                    this.parseTilesetNode(xmlData.documentElement);
                }).bind(this),
                error: function() {

                }
            });
        },
        
        drawTile: function(ctx, i, dx, dy) {
            i = i - this.firstgid;
            
            var sx = (i % this.tilesPerRow) * this.tileWidth;
            var sy = Math.floor(i / this.tilesPerRow) * this.tileHeight;
            
            ctx.drawImage(this.image, sx, sy, this.tileWidth, this.tileHeight,
                                      dx, dy, this.tileWidth, this.tileHeight);
        }
    };
    
    return Tileset;
});