define([], function() {
    "use strict";
    
    var LoadingScreen = function() {
        this.loadingTotal = 1;
        this.loadingComplete = 0;
        this.nowLoadingTotal = 1;
        this.nowLoadingComplete = 0;
        this.nowLoadingUrl = "";
    };
    
    LoadingScreen.prototype = {
        update: function(delta, input, map, gameManager) {
            //map is likely to be null
            
            var lm = gameManager.loadingManager;
            
            this.loadingTotal = lm.loadingTotal || 1;
            this.loadingComplete = lm.loadingComplete;
            this.nowLoadingUrl = lm.nowLoadingUrl;
            this.nowLoadingTotal = lm.nowLoadingTotal || 1;
            this.nowLoadingComplete = lm.nowLoadingComplete;
        },
        draw: function(ctx, viewport) {
            var w = viewport.width;
            var h = viewport.height;
            
            var centerX = w / 2;
            var margin = w * 0.2;
            
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            ctx.fillStyle = 'black';
            ctx.font = '16px Helvetica';
            ctx.textAlign = 'center';
            
            ctx.fillRect(0, 0, w, h);
            ctx.lineWidth = 1;
            
            ctx.fillStyle = 'white';
            
            ctx.fillText("Loading...", centerX, Math.floor(h * 0.30));
            
            var barH = Math.floor(h * 0.60) + 0.5;
            
            var perc = this.nowLoadingComplete / this.nowLoadingTotal;
            ctx.fillText(Math.floor(perc * 100) + "% - " + this.loadingComplete + "/" + this.loadingTotal, centerX, barH - 26);
            
            //the top gauge is the local item's progress
            ctx.fillStyle = "green";
            ctx.strokeStyle = "white";
            
            ctx.strokeRect(margin + 0.5, barH - 17, w - margin * 2, 15);
            ctx.fillRect(margin + 1.5, barH - 16, (w - margin * 2 - 2) * perc, 13);
            
            //the bottom gague is the global progress
            ctx.fillStyle = "blue";
            
            var perc2 = this.loadingComplete / this.loadingTotal + (1/this.loadingTotal) * perc;
            ctx.strokeRect(margin + 0.5, barH, w - margin * 2, 15);
            ctx.fillRect(margin + 1.5, barH + 1, (w - margin * 2 - 2) * perc2, 13);
            
            ctx.restore();
        }
    };
    
    return LoadingScreen;
});