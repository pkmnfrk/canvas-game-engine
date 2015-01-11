define(['emitter'], function(emitter) {
    "use strict";
    
    var LoadingManager = function(options) {
        options = options || {};
        emitter(this);
        
        this.maxLoading = options.maxLoading || this.maxLoading;
        
        this.loadingActive = false;
        this.loadingQueue = [];
        
        this.loadNext = this.loadNext.bind(this);
    };
    
    LoadingManager.prototype = {
        loadingActive: false,
        loadingQueue: null,
        loadingTotal: 0,
        loadingComplete: 0,
        loadingCount: 0,
        
        completeCallback: null,
        
        maxLoading: 2,
        
        beginLoading: function() {
            if(this.loadingActive) return;
            
            this.loadingActive = true;
            this.loadingTotal = 0;
            this.loadingComplete = 0;
            
            this.emit('loadingstart');
        },
        
        completeLoading: function(callback) {
            if(!this.loadingActive) return;
            
            if(this.loadingComplete == this.loadingTotal) {
                this.loadingActive = false;
                setTimeout(callback, 0);
                return;
            }
            
            this.completeCallback = callback;
        },
        
        load: function(url, type, userData, callback, context) {
            if(typeof userData == "function" && typeof callback != "function") {
                callback = userData;
                userData = null;
            }
            
            var newItem = {
                url: url,
                type: type,
                userData: userData,
                callback: callback,
                context: context
            };
            
            this.loadingTotal += 1;
            this.loadingQueue.push(newItem);
            
            this.loadNext();
        },
        
        loadNext: function() {
            if(this.loadingCount >= this.maxLoading) {
                return;
            }
            
            if(!this.loadingQueue.length) {
                return;
            }
            
            this.loadingCount++;
            
            var toLoad = this.loadingQueue.shift();
            
            var xhr = new XMLHttpRequest();
            
            xhr.onreadystatechange = (function() {
                
                if(xhr.readyState == 4) {
                    
                    if(isImage) {
                        
                        if(!xhr.response) {
                            toLoad.callback.call(toLoad.context, null, xhr);
                            onComplete();
                            return;
                        }
                        
                        var fileReader = new FileReader();
                        fileReader.onloadend = (function() {
                            
                            var img = new Image();
                            img.src = fileReader.result;
                            
                            toLoad.callback.call(toLoad.context, img, xhr);
                            
                            onComplete();
                            
                        }).bind(this);
                        fileReader.readAsDataURL(xhr.response);
                        
                    } else {
                    
                        toLoad.callback.call(toLoad.context, xhr.response, xhr);

                        onComplete();
                    }
                }
                
            }).bind(this);
            
            var isImage = false;
            
            if(toLoad.type == "xml") {
                xhr.overrideMimeType("text/xml");
                toLoad.type = "document";
            } else if(toLoad.type == "image") {
                isImage = true;
                toLoad.type = "blob";
            }
            
            xhr.responseType = toLoad.type;
            xhr.open("GET", toLoad.url, true);
            xhr.send();
            
            var onComplete = (function() {
                this.loadingCount--;
                this.loadingComplete++;
                
                this.emit("loadingprogress", {
                    total: this.loadingTotal,
                    complete: this.loadingComplete,
                    percent: this.loadingComplete / this.loadingTotal
                });
                
                if(this.loadingComplete == this.loadingTotal && this.completeCallback) {
                    this.loadingActive = false;
                    this.completeCallback();
                } else {
                    this.loadNext();
                }
                
                
                
            }).bind(this);
            
        },
        
    };
    
    return LoadingManager;
});