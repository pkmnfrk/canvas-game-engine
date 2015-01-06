define([], function() {
    "use strict";
    var SolidDebugLayer = function(options) {
        options = options || {};
        
        this.data = options.data;
        this.map = options.map;
        
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.map.tileWidth * this.data.length;
        this.canvas.height = this.map.tileHeight * this.data[0].length;
        this.canvas.style.zIndex = 99;
        this.canvas.style.opacity = 0.5;
        
        this.drawMap();
        this.update();
    };
    
    SolidDebugLayer.prototype = {
        map: null,
        data: null,
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
            this.canvas.width = this.canvas.width;
            
            var ctx = this.canvas.getContext("2d");
            ctx.fillStyle = "red";
            
            for(var x = 0; x < this.data.length; x++) {
                var dx = x * this.map.tileWidth;
                
                for(var y = 0; y < this.data[x].length; y++) {
                    var dy = y * this.map.tileHeight;
                    
                    if(this.data[y][x]) ctx.fillRect(dx, dy, this.map.tileWidth, this.map.tileHeight);
                }
            }
                
        },
        
        update: function() {
            this.canvas.style.left = (-this.map.left) + "px";
            this.canvas.style.top = (-this.map.top) + "px";
        }
    };
    
    return SolidDebugLayer;
});