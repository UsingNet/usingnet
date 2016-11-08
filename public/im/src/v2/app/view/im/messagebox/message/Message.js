/**
 * Created by henry on 16-1-19.
 */
define(['./IM','./SMS','./WECHAT', './SYSTEM'],function(IM, SMS, WECHAT, SYSTEM){
    var types = {
        IM:IM,
        SMS:SMS,
        WECHAT:WECHAT,
        SYSTEM:SYSTEM
    };
    return {
        create: function(messageRaw){
            if(types[messageRaw.type]){
                return new types[messageRaw.type](messageRaw)
            }else{
                return null;
            }
        }
    }
});