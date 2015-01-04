define(['./sylvester'], function($S) {
    "use strict";
    
    
    var Physics = function(options) {
        options = options || options;
        
        this.gridWidth = options.gridWidth || this.gridWidth;
        this.gridHeight = options.gridHeight || this.gridHeight;
    };
    
    Physics.prototype = {
        gridWidth: 16,
        gridHeight: 16,
        
        
        
    };
    
    return Physics;
});