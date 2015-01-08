define([], function() {
    "use strict";
    var BlankLayer = function(options) {
        options = options || {};
        
        this.map = options.map;
        
        if(this.map) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.map.tileWidth * this.map.width;
            this.canvas.height = this.map.tileHeight * this.map.height;
            this.context = this.canvas.getContext("2d");
        }
        this.z = options.zindex || 100;
        
        this.opacity = 1;
        
    };
    
    BlankLayer.prototype = {
        map: null,
        canvas: null,
        context: null,
        opacity: 1,
        z: 0,
        
        draw: function(ctx, viewport) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(this.canvas,
                          this.map.left, this.map.top, viewport.width, viewport.height,
                                      0,            0, viewport.width, viewport.height);
            ctx.restore();
        },
        
        update: function() {
            //this.canvas.style.left = (-this.map.left) + "px";
            //this.canvas.style.top = (-this.map.top) + "px";
        },
        
        clear: function() {
            this.canvas.width = this.canvas.width;
        }
    };
    
    return BlankLayer;
});