/**
 * Created by henry on 15-12-7.
 */
define(['../class', '../event', './websocket-plugin'],function(Class, Event, WebSocketPlugin){
    return new Class().extend(function(url){
        WebSocketPlugin.init();
        var self = this;
        var heartBeatPackage = {"action":"heartbeat"};
        var defaultUrl = url || null;

        var connector = null;
        var heartBeatTrigger = null;
        var sendCallbackStore = {};
        var sendDelayStore = [];
        var reconnectTimes = 0;

        var log = function(message){
            if(console && typeof console.log == 'function'){
                console.log("WebSocket Log: ", message);
                var event = new Event("log");
                event.data = message;
                self.triggerEvent(event);
            }
        };

        var clearTimeoutSendCallback = function(){
            var now = (new Date()).getTime();
            for(var i in sendCallbackStore){
                if(sendCallbackStore[i]['timeout'] < now){
                    var event = new Event('timeout');
                    sendCallbackStore[i]['callback'].call(self, null, event);
                }
            }
        };

        this.connect = function(url){
            if(connector){
                return false;
            }

            connector = new WebSocket((url || defaultUrl) + ('&_='+Math.random()));

            connector.addEventListener("open", function(){
                sendCallbackStore = {};
                heartBeatTrigger = setInterval(function(){
                    self.send(heartBeatPackage, function(data, event){
                        if(event.type=='timeout'){
                            self.close(true);
                        }else{
                            reconnectTimes = 0;
                        }
                    },5000);
                    clearTimeoutSendCallback();
                },20000);
                var event = new Event("open");
                self.triggerEvent(event);
                if(sendDelayStore.length){
                    while(sendDelayStore.length){
                        self.send.apply(self, sendDelayStore.shift());
                    }
                }
            });

            connector.addEventListener("close", function(){
                if(heartBeatTrigger){
                    clearInterval(heartBeatTrigger);
                }
                var event = new Event("close");
                event.reconnect = !!connector;
                self.triggerEvent(event);
                if(connector){
                    connector = null;
                    reconnectTimes++;
                    setTimeout(function(){
                        self.connect();
                    },Math.pow(2,reconnectTimes)*1000);
                }
            });

            connector.addEventListener("error", function(event){
                log(event);
            });

            connector.addEventListener("message", function(event) {
                var message = JSON.parse(event.data);
                if(message && message['message_id'] && sendCallbackStore[message['message_id']]){
                    sendCallbackStore[message['message_id']]['callback'].call(self, message, event);
                    delete sendCallbackStore[message['message_id']];
                }
                var subEvent = new Event("message");
                subEvent.data = message;
                self.triggerEvent(subEvent);
            });

            return true;
        };

        this.send = function(obj, callback, timeout){
            var data = Object.clone(obj);
            var message_id = (new Date()).getTime() + Math.random();
            if(callback && typeof(callback) == 'function'){
                sendCallbackStore[message_id] = {
                  'callback': callback,
                  'timeout': (Math.max(timeout,0) || 20000) + ((new Date()).getTime())
                };
            }
            data['message_id'] = message_id;
            if(connector.readyState == WebSocket.OPEN){
                connector.send(JSON.stringify(data));
            }else{
                sendDelayStore.push([obj, callback, timeout]);
            }
            return true;
        };

        this.close = function(reconnect){
            if(typeof reconnect == 'undefined'){
                reconnect = false;
            }
            if(reconnect){
                connector.close();
            }else{
                var needToClose = connector;
                connector = null;
                needToClose.close();
            }
            return true;
        };
    });
});