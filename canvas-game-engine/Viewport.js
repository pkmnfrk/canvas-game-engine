define(['jquery'], function($) {
    "use strict";
    
    var Viewport = function(options) {
        options = options || {};
        
        this.root = $(options.root);
        if(!this.root.length) {
            throw new Error("Invalid root");
        }
        
        this.root = this.root[0];
        
        this.canvas = $("<canvas/>")[0];
        
        Object.defineProperties(this, {
            width: {
                configurable: false,
                get: function() {
                    return this.canvas.width;
                },
                set: function(val) {
                    this.canvas.width = val;
                }
            },
            
            height: {
                configurable: false,
                get: function() {
                    return this.canvas.height;
                },
                
                set: function(val) {
                    this.canvas.height = val;
                }
            },
        });
        
        this.width = parseInt(options.width, 10);
        this.height = parseInt(options.height, 10);
        
        $(this.root).append(this.canvas);
    };
    
    Viewport.prototype = {
        root: null,
        width: 0,
        height: 0,
        canvas: null,
        
        clear: function() {
            this.canvas.width = this.canvas.width;
        }
        
    };
    
    return Viewport;
});