/**
 * Created by henry on 15-12-7.
 */
define(['./sizzle'],function(sizzle){
    Array.prototype.remove = function(b) {
        var a = this.indexOf(b);
        if (a >= 0) {
            this.splice(a, 1);
            return true;
        }
        return false;
    };

    Array.prototype.each = function(callback){
        for(var i = 0;i<this.length;i++){
            callback(this[i], i);
        }
    };

    if(!Array.prototype.filter) {
        Array.prototype.filter = function (filter) {
            var newArray = [];
            this.each(function (item, index) {
                if (filter(item, index)) {
                    newArray.push(item);
                }
            });
            return newArray;
        }
    }

    if(!Array.prototype.map){
        Array.prototype.map = function(map){
            var newArray = [];
            this.each(function(item, index){
                newArray.push(map(item, index));
            });
            return newArray;
        }
    }

    if(!Array.prototype.indexOf){
        Array.prototype.indexOf = function(item){
            for(var i = 0;i<this.length;i++){
                if(item == this[i]){
                    return i;
                }
            }
            return -1;
        }
    }

    Array.prototype.has = function(b){
        return this.indexOf(b)>=0;
    };


    Object.clone = function(obj) {
        if ("object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    };

    if (!document.querySelectorAll) {
        if(typeof(document.__createElement) == 'undefined'){
            document.__createElement = document.createElement;
            document.createElement = function(type){
                var dom = document.__createElement(type);
                if(!dom.addEventListener){
                    dom.addEventListener = function(type, callback){
                        return this.attachEvent("on"+type, callback);
                    };
                }
                if(!dom.querySelectorAll){
                    dom.querySelectorAll = function(selectors){
                        return sizzle(selectors, dom);
                    }
                }
                if(!dom.querySelector){
                    dom.querySelector = function(selectors){
                        return sizzle(selectors, dom)[0];
                    }
                }
                return dom;
            };
        }

        document.querySelectorAll = function (selectors) {
            return sizzle(selectors, document);
        };
    }

    if (!document.querySelector) {
        document.querySelector = function (selectors) {
            var elements = document.querySelectorAll(selectors);
            return (elements.length) ? elements[0] : null;
        };
    }


    if(typeof(HTMLInputElement) != 'undefined' && HTMLInputElement && !HTMLInputElement.prototype.addEventListener){
        HTMLPhraseElement.prototype.addEventListener = HTMLButtonElement.prototype.addEventListener = HTMLSpanElement.prototype.addEventListener = HTMLImageElement.prototype.addEventListener = HTMLDivElement.prototype.addEventListener = HTMLTextAreaElement.prototype.addEventListener = HTMLIFrameElement.prototype.addEventListener = HTMLInputElement.prototype.addEventListener = HTMLBodyElement.prototype.addEventListener = function(type, callback){
            return this.attachEvent("on"+type, callback);
        };
    }

    if(!window.JSON) {
        window.JSON = {
            parse: function (data) {
                return ( new Function("return " + data) )();
            },
            stringify: function (value) {
                var response = 'null';
                switch(typeof value){
                    case 'object':
                        if( value instanceof Array){
                            var pieces = [];
                            for(var i = 0;i<value.length;i++){
                                pieces.push(window.JSON.stringify(value[i]));
                            }
                            response = '['+pieces.join(',')+']';
                        }else{
                            var pieces = [];
                            for(var i in value){
                                pieces.push('"'+i.replace(/'/g,'\\\'').replace(/"/g,'\\\"')+'":'+window.JSON.stringify(value[i]));
                            }
                            response = '{'+pieces.join(',')+'}';
                        }
                        break;
                    case 'number':
                        response = isNaN(value)?null:value.toString();
                        break;
                    case 'string':
                        response = '"'+value.replace(/'/g,'\\\'').replace(/"/g,'\\\"')+'"';
                        break;
                }
                return response;
            }
        };
    }
});