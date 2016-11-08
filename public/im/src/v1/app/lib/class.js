/**
 * Created by henry on 15-12-8.
 */
define([],function(){
    return function(){
        var eventListeners = {};

        this.triggerEvent = function(event){
            var self = this;
            var type = event.type;
            event.target = self;
            if(eventListeners[type]){
                eventListeners[type].map(function(callback){
                    callback.call(self, event);
                });
            }
        };

        this.addEventListener = function(type, listener){
            if(!eventListeners[type]){
                eventListeners[type] = [];
            }
            eventListeners[type].push(listener);
            return true;
        };

        this.removeEventListener = function(type, listener){
            if(eventListeners[type]){
                eventListeners[type].remove(listener);
                return true;
            }else{
                return false;
            }
        };

        this.extend = function(subClass){
            subClass.prototype = this;
            return subClass;
        };
    };
});



