/**
 * Created by henry on 15-12-13.
 */
define([],function(){
    return function(type){
        if(typeof(Event) == 'undefined'){
            this.prototype = {};
        }else if(Event.constructor){
            this.prototype = Event.constructor();
        }else{
            this.prototype = Event.create(type);
        }
        this.type = type;
    };
});
