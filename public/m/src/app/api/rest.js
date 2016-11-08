/**
 * Created by henry on 16-2-20.
 */
define(['lib/class'], function(Class){
    var Rest = (new Class()).extend(function(options){
        if(!options['url']){
            throw('Class Rest Init need url options');
        }
        this.options = $.extend({
            id_field: 'id'
        },options);
        this.storage = [];
    });

    Rest.prototype.localSearch = function(condition){
        var val = [];
        for(var i = 0;i<this.storage.length;i++){
            var item = this.storage[i];
            if(!item){continue;}
            var match = true;
            for(var key in condition){
                if(item[key] != condition[key]){
                    match = false;
                    break;
                }
            }
            if(match){
                val.push(item);
            }
        }
        return val;
    };

    Rest.prototype.localUpdate = function(condition, object){
        var updated = false;
        if(condition){
            for(var i = 0;i<this.storage.length;i++){
                var item = this.storage[i];
                if(!item){continue;}
                var match = true;
                for(var key in condition){
                    if(item[key] != condition[key]){
                        match = false;
                        break;
                    }
                }
                if(match){
                    updated = true;
                    this.storage[i] = object;
                }
            }
        }
        if(!updated){
            this.storage.push(object);
        }
        this.dispatch(new Event('load'));
    };

    Rest.prototype.localRemove = function(condition){
        var removed = false;
        if(condition){
            for(var i = this.storage.length-1;i>=0;i--){
                var item = this.storage[i];
                if(!item){continue;}
                var match = true;
                for(var key in condition){
                    if(item[key] != condition[key]){
                        match = false;
                        break;
                    }
                }
                if(match){
                    removed = true;
                    this.storage.splice(i,1);
                }
            }
        }
        if(removed){
            this.dispatch(new Event('load'));
        }
    };

    Rest.prototype.get = function(id, success, failed, force_remote){
        var me = this;
        var condition = {};
        if(!force_remote){
            condition[this.options['id_field']] = id;
            var cache = this.localSearch(condition)[0];
            if(cache){
                return cache;
            }
        }
        return $.getJSON(this.options['url']+'/'+id+'?_='+Math.random(), function(object){
            if(object['success']) {
                me.localUpdate(condition, object['data']);
                if(typeof(success) == 'function'){
                    success(object['data']);
                }
            }else{
                if(typeof(failed) == 'function'){
                    failed(object);
                }
            }
        });
    };

    Rest.prototype.post = function(object, success, failed){
        var me = this;
        $.post(this.options['url'], JSON.stringify(object), function(object){
            if(object['success']) {
                me.localUpdate(null, object['data']);
                if(typeof(success) == 'function'){
                    success(object['data']);
                }
            }else{
                if(typeof(failed) == 'function'){
                    failed(object);
                }
            }
        });
    };

    Rest.prototype.put = function(id, update, success, failed){
        var me = this;
        var condition = {};
        condition[this.options['id_field']] = id;

        $.ajax({
            url: this.options['url']+'/'+id,
            method: 'PUT',
            data: JSON.stringify(update),
            success: function(object){
                if(object['success']) {
                    me.localUpdate(condition, object['data']);
                    if(typeof(success) == 'function'){
                        success(object['data']);
                    }
                }else{
                    if(typeof(failed) == 'function'){
                        failed(object);
                    }
                }
            }
        });
    };

    Rest.prototype.delete = function(id){
        var me = this;
        var condition = {};
        condition[this.options['id_field']] = id;

        $.ajax({
            url: this.options['url']+'/'+id,
            method: 'DELETE',
            success: function(object){
                if(object['success']) {
                    me.localRemove(condition, object['data']);
                    if(typeof(success) == 'function'){
                        success(object['data']);
                    }
                }else{
                    if(typeof(failed) == 'function'){
                        failed(object);
                    }
                }
            }
        });
    };

    Rest.prototype.list = function(condition, success, failed){
        var me = this;
        condition['_'] = Math.random();
        $.ajax({
            url: this.options['url'],
            method: 'GET',
            data: condition,
            success:function(object){
                if(object['success']) {
                    me.localRemove(condition, object['data']);
                    if(typeof(success) == 'function'){
                        success(object['data']);
                    }
                }else{
                    if(typeof(failed) == 'function'){
                        failed(object);
                    }
                }
            }
        });
    };

    Rest.prototype.sync = function(){
        var me = this;
        this.list({}, function(object){
            this.storage = object;
            var e = new Event('load');
            e.data = this.storage;
            me.dispatchEvent(e);
        });
    };

    return Rest;
});