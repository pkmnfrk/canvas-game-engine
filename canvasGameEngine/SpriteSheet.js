define(['jquery','canvasGameEngine/Path'], function($, Path) {
    "use strict";
    
    var SpriteSheet = function(options) {
        
        options = options || {};
        
        this.url = options.url;
        
        if(this.url.lastIndexOf('/') != -1) {
            this.rootUrl = this.url.substr(0, this.url.lastIndexOf('/'));
        }
        
        $.getJSON(this.url).done((function(data) {
            this.data = data;
            this.parseData();
            
            this.loaded = true;
        }).bind(this)).fail(function(err) {
            window.console.error("Failed", err);
            window.console.log(JSON.parse(err.responseText));
        });
    };
    
    SpriteSheet.prototype = {
        url: null,
        rootUrl: null,
        data: null,
        image: null,
        frames: null,
        animations: null,
        loaded: false,
        
        parseData: function() {
            this.image = new Image();
            this.image.src = Path.combine(this.rootUrl, this.data.image);
            
            this.frames = {};
            this.animations = {};
            
            var i;
            
            for(i in this.data.frames) {
                this.frames[i] = {
                    x: this.data.frames[i][0],
                    y: this.data.frames[i][1],
                    w: this.data.frames[i][2],
                    h: this.data.frames[i][3],
                    ox: this.data.frames[i][4],
                    oy: this.data.frames[i][5],
                };
            }
            
            for(i in this.data.animations) {
                var anim = {
                    repeat: typeof(this.data.animations[i].repeat) != "boolean" ? true  : this.data.animations[i].repeat,
                    frames: new Array(this.data.animations[i].frames.length),
                     flipX: typeof(this.data.animations[i].flipX ) != "boolean" ? false : this.data.animations[i].flipX,
                 keepFrame: this.data.animations[i].keepFrame
                };
                
                for(var j = 0; j < this.data.animations[i].frames.length; j++) {
                    anim.frames[j] = {
                        frame: this.frames[this.data.animations[i].frames[j][0]],
                        length: this.data.animations[i].frames[j][1]
                    };
                }
                
                this.animations[i] = anim;
            }
        },
        
        drawFrame: function(map, frame, x, y, flipX /*, flipY*/) {
            if(!map || !this.frames || !this.image) return;
            
            var ctx = map.spriteContext;
            x -= map.left;
            y -= map.top;
            
            if(typeof frame == "string") {
                frame = this.frames[frame];
            }
            
            var sx = frame.x;
            var sy = frame.y;
            
            var ox = frame.ox;
            var oy = frame.oy;
            
            if(flipX) {
                sx = (this.image.width / 2) - frame.x;
                sx += (this.image.width / 2);
                sx -= frame.w;
                ox = frame.w - ox;
            }
            
            x -= ox;
            y -= oy;
            
            
            ctx.drawImage(this.image, sx, sy, frame.w, frame.h, x, y, frame.w, frame.h);
        },
        
        getAnimator: function() {
            var ret = new SpriteSheet.Animator({
                spriteSheet: this
            });
            
            return ret;
        },
    };
    
    SpriteSheet.Cache = {
        sheets: {},
        
        get: function(url) {
            if(!SpriteSheet.Cache.sheets[url]) {
                SpriteSheet.Cache.sheets[url] = new SpriteSheet({
                    url: url
                });
            }
            
            return SpriteSheet.Cache.sheets[url];
        }
    };
    
    SpriteSheet.Animator = function(options) {
        options = options || {};
        
        this.spriteSheet = options.spriteSheet;
    };
    
    SpriteSheet.Animator.prototype = {
        spriteSheet: null,
        curAnimation: null,
        curFrame: 0,
        curFrameTime: 0,
        speed: 1,
        running: false,
        
        update: function(delta) {
            if(!this.running) return;
            
            this.curFrameTime += delta * this.speed;
            
            if(!this.spriteSheet.loaded) return;
            if(!this.spriteSheet.animations[this.curAnimation]) return;
            
            while(true) {
                var frames = this.spriteSheet.animations[this.curAnimation].frames;

                var t = frames[this.curFrame].length;

                if(this.curFrameTime >= t) {
                    this.curFrameTime -= t;
                    
                    if(this.spriteSheet.animations[this.curAnimation].repeat) {
                        this.curFrame++;

                        if(this.curFrame >= frames.length) {
                            this.curFrame = 0;
                        }
                    } else {
                        if(this.curFrame < frames.length - 1) {
                            this.curFrame ++;
                        } else {
                            this.running = false;
                        }
                    }
                    
                } else {
                    break;
                }
            }
        },
        
        draw: function(map, x, y) {
            if(!this.spriteSheet.loaded) return;
            
            var anim = this.spriteSheet.animations[this.curAnimation];
            
            if(!anim) return;
            
            this.spriteSheet.drawFrame(map, anim.frames[this.curFrame].frame, x, y, anim.flipX, anim.flipY);
        },
        
        currentHeight: function() {
            if(!this.spriteSheet.loaded) return 0;
            var anim = this.spriteSheet.animations[this.curAnimation];
            
            if(!anim) return 0;
            
            return anim.frames[this.curFrame].frame.h;
        },
        
        setAnimation: function(anim) {
            if(this.curAnimation == anim) return;
            if(!this.curAnimation ||
               !this.spriteSheet.animations[this.curAnimation] ||
               !this.spriteSheet.animations[this.curAnimation].keepFrame ||
                this.spriteSheet.animations[this.curAnimation].keepFrame.indexOf(anim) === -1) {
                
                this.curFrame = 0;
                this.curFrameTime = 0;
                this.running = true;
                
            }
            
            this.curAnimation = anim;
            
        }
    };
    
    return SpriteSheet;
});