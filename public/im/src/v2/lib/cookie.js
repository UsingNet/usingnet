/**
 * Created by henry on 15-12-9.
 */
define([],function(){
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
            document.cookie=key+ "=" +escape(value) + "; path=/;";
        }
    };
});
