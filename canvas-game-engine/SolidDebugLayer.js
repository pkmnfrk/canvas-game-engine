define(['canvas-game-engine/BlankLayer'], function(BlankLayer) {
    "use strict";
    var SolidDebugLayer = function(options) {
        options = options || {};
        
        BlankLayer.call(this, options);
        
        this.data = options.data;
        this.opacity = 0.5;
        
        this.drawMap();
        
    };
    
    SolidDebugLayer.prototype = new BlankLayer();
    
    var newPrototype = {
        data: null,
        
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
                
        }
    };
    
    for(var p in newPrototype) {
        SolidDebugLayer.prototype[p] = newPrototype[p];
    }
    
    return SolidDebugLayer;
});