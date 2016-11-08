/**
 * Created by henry on 15-12-9.
 */
define(['evercookie', 'app/config/app'],function(evercookie,appConfig){
    if(appConfig.COOKIE_FOREVER){
        var ec = new evercookie({'phpuri':'/resources/evercookie/php', 'asseturi':'/resources/evercookie/assets', 'history':false, baseurl:appConfig['IM_BASE_URL']});
        var cache = {};
        var callback_list = {};
        return {
            get:function(key, callback){
                if(typeof(cache[key]) != 'undefined'){
                    if(typeof callback == 'function'){
                        callback(cache[key]);
                    }
                }else{
                    if(callback_list[key]){
                        callback_list[key].push(callback);
                    }else{
                        callback_list[key] = [callback];
                        ec.get(key,function(value, othervalues){
                            var need_call_backs = callback_list[key];
                            delete callback_list[key];
                            cache[key] = value;
                            for(var i in need_call_backs){
                                need_call_backs[i](value);
                            }
                        });
                    }
                }
            },
            set:function(key, value){
                cache[key] = value;
                ec.set(key,value);
            }
        }
    }else{
        return {
            get:function(key,callback){
                if (document.cookie.length>0)
                {
                    var c_start=document.cookie.indexOf(key + "=");
                    if (c_start!=-1)
                    {
                        c_start=c_start + key.length+1;
                        var c_end=document.cookie.indexOf(";",c_start);
                        if (c_end==-1) c_end=document.cookie.length;
                        callback(unescape(document.cookie.substring(c_start,c_end)));
                        return;
                    }
                }
                callback(null);
            },
            set:function(key,value){
                document.cookie=key+ "=" +escape(value);
            }
        };
    }
});
