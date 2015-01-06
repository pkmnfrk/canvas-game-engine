define([], function() {
    "use strict";
    
    var GameObject = function(options) {
        options = options || {};
        
        for(var i in options) {
            if(i != "x" && i != "y") {
                this[i] = options[i];
            }
        }
        
        this.x = parseInt(options.x, 10);
        this.y = parseInt(options.y, 10);
        if(options.width) this.width = parseInt(options.width, 10);
        if(options.height) this.height = parseInt(options.height, 10);
        
        if(typeof this.x != "undefined" && 
           typeof this.y != "undefined" && 
           typeof this.width != "undefined" &&
           typeof this.height != "undefined") {
            
            this.boundingBox = [this.x, this.y, this.width, this.height];
        }
        
    };
    
    GameObject.prototype = {
        x: 0,
        y: 0,
        boundingBox: null,
        name: null,
        
        update: function() {},
        draw: function() {}
        
    };
    
    return GameObject;
    
});