define([], function() {
    "use strict";
    
    var InputManager = function(options) {
        options = options || {};
        
        this.state = {};
        
        if(options.keyboard) {
            this.keyboard = true;
            this.keyboardTarget = options.keyboardTarget;
            this.keyboardKeys = {};
            
            this.onKeyDown = this._onKeyDown.bind(this);
            this.onKeyUp = this._onKeyUp.bind(this);
            
            this.keyboardTarget.addEventListener("keydown", this.onKeyDown);
            this.keyboardTarget.addEventListener("keyup", this.onKeyUp);
            
            this.keyMappings = this.keyMappings;
        }
        
        if(options.gamepad && navigator.getGamepads) {
            this.gamepad = true;
            this.buttonMappings = this.buttonMappings;
        }
    };
    
    InputManager.prototype = {
        keyboard: false,
        keyboardTarget: null,
        gamepad: false,
        gamepadState: null,
        keyboardKeys: null,
        
        state: null,
        stateNew: null,
        
        
        keyMappings: {
            left: 37,
            right: 39,
            up: 38,
            down: 40,
            action1: 90,
            action2: 88
        },
        
        buttonMappings: {
            left: 14,
            right: 15,
            up: 12,
            down: 13,
            action1: 0,
            action2: 2
        },
        
        update: function() {
            if(this.gamepad) {
                this.gamepadState = navigator.getGamepads();
            }
            
            var oldState = this.state;
            
            this.state = {
                left: this.checkButton(this.buttonMappings.left) || this.checkKey(this.keyMappings.left) || this.checkAxis(0) < -0.5,
                right: this.checkButton(this.buttonMappings.right) || this.checkKey(this.keyMappings.right) || this.checkAxis(0) > 0.5,
                up: this.checkButton(this.buttonMappings.up) || this.checkKey(this.keyMappings.up) || this.checkAxis(1) < -0.5,
                down: this.checkButton(this.buttonMappings.down) || this.checkKey(this.keyMappings.down) || this.checkAxis(1) > 0.5,
                action1: this.checkButton(this.buttonMappings.action1) || this.checkKey(this.keyMappings.action1),
                action2: this.checkButton(this.buttonMappings.action2) || this.checkKey(this.keyMappings.action2),
            };
            
            if(oldState) {
                if(this.state.left && oldState.left) this.state.left = 2;
                if(this.state.right && oldState.right) this.state.right = 2;
                if(this.state.up && oldState.up) this.state.up = 2;
                if(this.state.down && oldState.down) this.state.down = 2;
                if(this.state.action1 && oldState.action1) this.state.action1 = 2;
                if(this.state.action2 && oldState.action2) this.state.action2 = 2;
            }
            
        },
        
        checkKey: function(key) {
            if(!this.keyboard) return false;
            
            return !!this.keyboardKeys[key];
        },
        
        checkButton: function(button) {
            if(!this.gamepad) return false;
            for(var i = 0; i < this.gamepadState.length; i++) {
                if(this.gamepadState[i] && this.gamepadState[i].connected) {
                    if(this.gamepadState[i].buttons.length >= button) {
                        if(this.gamepadState[i].buttons[button] > 0.15) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        
        checkAxis: function(axis) {
            if(!this.gamepad) return false;
            for(var i = 0; i < this.gamepadState.length; i++) {
                if(this.gamepadState[i] && this.gamepadState[i].connected) {
                    if(this.gamepadState[i].axes.length >= axis) {
                        if(this.gamepadState[i].axis[axis] > 0.15) {
                            return this.gamepadState[i].axis[axis];
                        }
                    }
                }
            }
            return 0;
        },
        
        onKeyDown: null,
        _onKeyDown: function(e) {
            var key = e.key || e.keyCode;
            this.keyboardKeys[key] = true;
        },
        
        onKeyUp: null,
        _onKeyUp: function(e) {
            var key = e.key || e.keyCode;
            delete this.keyboardKeys[key];
        }
    };
    
    return InputManager;
});