define([], function() {
    "use strict";
    var BlankLayer = function(options) {
        options = options || {};
        
        this.map = options.map;
        
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.map.tileWidth * this.map.width;
        this.canvas.height = this.map.tileHeight * this.map.height;
        this.canvas.style.zIndex = 100;
        this.canvas.style.opacity = 1;
        
        this.drawMap();
        this.update();
    };
    
    BlankLayer.prototype = {
        map: null,
        canvas: null,
        
        attach: function(root) {
            root.appendChild(this.canvas);
        },
        
        detatch: function() {
            if(this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
            }
        },
        
        
        drawMap: function() {
                
        },
        
        update: function() {
            this.canvas.style.left = (-this.map.left) + "px";
            this.canvas.style.top = (-this.map.top) + "px";
        },
        
        clear: function() {
            this.canvas.width = this.canvas.width;
        }
    };
    
    return BlankLayer;
});