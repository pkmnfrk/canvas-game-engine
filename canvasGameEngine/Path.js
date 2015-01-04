define([], function() {
    "use strict";
    
    var Path = {
        combine: function() {
            var ret = "";
            for(var i = 0; i < arguments.length; i++) {
                if(arguments[i]) {
                    if(arguments[i][0] == "/") {
                        ret = arguments[i];
                    } else {
                        ret += "/";
                        ret += arguments[i];
                    }
                }
            }
            
            return ret;
        }
    };
    
    return Path;
});