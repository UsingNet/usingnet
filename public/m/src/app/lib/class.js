/**
 * Created by henry on 15-12-8.
 */
define([],function(){
    var LibClass = function(){
        this.eventTarget = document.createDocumentFragment();

        this.addEventListener = function( type, listener, useCapture ){
            this.eventTarget.addEventListener( type, listener, useCapture );
        };

        this.removeEventListener = function( type, listener, useCapture ){
            this.eventTarget.removeEventListener( type, listener, useCapture );
        };

        this.dispatchEvent = function( event ){
            this.eventTarget.dispatchEvent(event);
        };
    };

    LibClass.prototype.extend = function(subClass){
        var me = this;
        return function(){
            this.__parent = me.constructor;
            this.__child = subClass;
            this.__parent.apply(this, arguments);
            this.__child.apply(this, arguments);
            delete this.__parent;
            delete this.__child;
        };
    };

    return LibClass;
});



