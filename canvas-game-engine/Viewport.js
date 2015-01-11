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
        this.finalCanvas = $("<canvas/>")[0];
        
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
            
            finalWidth: {
                configurable: false,
                get: function() {
                    return this.finalCanvas.width;
                },
                set: function(val) {
                    this.finalCanvas.width = val;
                }
            },
            
            finalHeight: {
                configurable: false,
                get: function() {
                    return this.finalCanvas.height;
                },
                
                set: function(val) {
                    this.finalCanvas.height = val;
                }
            },
        });
        
        this.width = parseInt(options.width, 10) || 320;
        this.height = parseInt(options.height, 10) || 240;
        this.finalWidth = parseInt(options.finalWidth, 10) || 640;
        this.finalHeight = parseInt(options.finalHeight, 10) || 480;
        
        $(this.root).append(this.finalCanvas);
    };
    
    Viewport.prototype = {
        root: null,
        width: 0,
        height: 0,
        canvas: null,
        finalCanvas: null,
        
        clear: function() {
            this.canvas.width = this.canvas.width;
            this.finalCanvas.width = this.finalCanvas.width;
        },
        
        flip: function() {
            var ctx = this.finalCanvas.getContext("2d");
            
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            ctx.imageSmoothingEnabled = false;
            
            ctx.drawImage(this.canvas, 0, 0, this.width, this.height, 0, 0, this.finalWidth, this.finalHeight);
        }
        
    };
    
    return Viewport;
});