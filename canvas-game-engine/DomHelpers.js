define([], function() {
    "use strict";
    
    var DomHelpers = {
        attributes: function(node, func, context) {
            var i;
            
            for(i = 0; i < node.attributes.length; i++) {
                if(func.call(context, node.attributes[i])) return;
            }
        },
        
        children: function(node, func, context) {
            var i;
            
            for(i = 0; i < node.childNodes.length; i++) {
                if(func.call(context, node.childNodes[i])) return;
            }
        }
    };
    
    return DomHelpers;
});