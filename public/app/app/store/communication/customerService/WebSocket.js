/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.communication.customerService.WebSocket', {
    extend: 'Ext.Base',
    //socket: null,
    baseUrl: (function() {
        return 'wss://ws.' + location.host.replace('app.', '') + '/ws?_token=';
    })(),
    //poll: [],
    //token: null,
    //heartBeatTrigger: null,
    //backgroundTaskTrigger: null,
    //backgroundTasks: [],
    callbackStore: {},

    closeAll: function() {
        var socket = null;
        while (socket = Admin.view.common.WebsocketMonitor.pop()) {
            socket.close();
        }
    },

    messageStore: {
        'heartbeat': {
            action: 'heartbeat'
        }
    },
    /**
     * @param config {token}
     */
    constructor: function(config) {
        if (Ext.Object.isEmpty(config)) {
            return;
        }
        this.token = config['token'];
        //this.reconnectByTokenFn = config['reconnectByToken']
        this.backgroundTasks = [];
        this.delaySendMessages = [];
        this.listeners = {
            'preopen': [],
            'close': [],
            'open': [],
            'message': [],
            'tokenerror': []
        };
        this.reconnectCount = 0;
        this.connection_id = Admin.view.common.WebsocketMonitor.getAutoIncreaseId();
        this.alive = true;
        this.init_socket();

        Admin.view.common.WebsocketMonitor.registerWebsocket(this);
    },

    init_socket: function() {
        if(!this.alive){
            return false;
        }
        var self = this;
        var event = {
            target : {ownerCt:self}
        };
        Ext.Array.each(self.listeners['preopen'], function(item) {
            item(event);
        });

        this.socket = new WebSocket(this.baseUrl + this.token);

        try {
            this.socket.addEventListener('open', this.root_listeners.open);
            this.socket.addEventListener('close', this.root_listeners.close);
            this.socket.addEventListener('message', this.root_listeners.message);
        } catch (e) {;
        }
        // this.socket.onopen = his.root_listeners.open;
        // this.socket.onclose = this.root_listeners.close;
        // this.socket.onmessage = this.root_listeners.message;
        this.socket.ownerCt = this;
    },

    root_listeners: {
        open: function(event) {
            var self = event.target.ownerCt;
            event.target = self;
            if(self.heartBeatTrigger){
                clearInterval(self.heartBeatTrigger);
            }
            self.heartBeatTrigger = setInterval(function() {
                self.send(self.messageStore.heartbeat, function(type){
                    if(type=='TIMEOUT'){
                        if (self.heartBeatTrigger) {
                            clearInterval(self.heartBeatTrigger);
                            self.heartBeatTrigger = null;
                        }
                        if (self.backgroundTaskTrigger) {
                            clearInterval(self.backgroundTaskTrigger);
                            self.backgroundTaskTrigger = null;
                        }
                        self.close(true);
                        self.init_socket();
                    }
                });
            }, 20000);
            self.backgroundTaskTrigger = setInterval(function() {
                if (self.backgroundTasks.length) {
                    var task = self.backgroundTasks.shift();
                    self.send(task[0]);
                    if (typeof(task[1]) == 'function') {
                        task[1](task[2]);
                    }
                }
            }, 20);

            Ext.Array.each(self.listeners['open'], function(item) {
                item(event);
            });
        },
        close: function(event) {
            var self = event.target.ownerCt;
            event.target = self;

            if (self.heartBeatTrigger) {
                clearInterval(self.heartBeatTrigger);
                self.heartBeatTrigger = null;
            }
            if (self.backgroundTaskTrigger) {
                clearInterval(self.backgroundTaskTrigger);
                self.backgroundTaskTrigger = null;
            }

            self.reConnect = !!self.socket;
            Ext.Array.each(self.listeners['close'], function(item) {
                var rVal = item(event);
                if(typeof(rVal) != 'undefined' && rVal === false){
                    self.reConnect = false;
                }
            });

            if (self.reConnect) {
                try {
                    self.socket.removeEventListener('close', self.root_listeners.close);
                    self.socket.removeEventListener('message', self.root_listeners.message);
                } catch (e) {;
                }

                setTimeout(function() {
                    self.init_socket();
                }, Math.pow(2, self.reconnectCount) * 1000);
                self.reconnectCount++;
            }else{
                Admin.view.common.WebsocketMonitor.deregisterWebsocket(self);
            }
        },
        message: function(event) {
            var self = event.target.ownerCt;
            var data = Ext.decode(event.data);
            if (!data.ok && 'Illegal Token' == data.error) {
                Ext.Array.each(self.listeners['tokenerror'], function(item) {
                    item({target:self});
                });
                return;
            }
            var next_event = new Event(event.type);

            next_event.response = JSON.parse(event.data);
            next_event.target = self;

            if(next_event.response && next_event.response['message_id'] && self.callbackStore[next_event.response['message_id']]){
                self.callbackStore[next_event.response['message_id']]('MESSAGE', next_event.response);
                delete self.callbackStore[next_event.response['message_id']];
            }

            if (next_event.response.type != 'event' || next_event.response.data.action != 'heartbeat') {
                Ext.Array.each(self.listeners['message'], function(item) {
                    item(next_event);
                });
            }
        },
        error: function(event){
            var self = event.target.ownerCt;
            if(self.heartBeatTrigger){
                clearInterval(self.heartBeatTrigger);
            }
        }
    },

    close: function(keepAlive) {
        if(typeof(keepAlive) == 'undefined' || !keepAlive){
            this.alive = false;
        }
        var need_close = this.socket;
        this.socket = null;
        if(need_close){
            need_close.removeEventListener('message', this.root_listeners.message);
            need_close.close();
        }
    },

    send: function(obj, callback, timeout) {
        var key = JSON.stringify(obj);
        var self = this;
        obj['message_id'] = Math.random();
        if(typeof(callback) == 'function'){
            self.callbackStore[obj['message_id']] = callback;
            if(typeof(timeout) != 'number' || timeout < 1 || Number.isNaN(timeout)){
                timeout = 5000;
            }else{
                timeout = parseInt(timeout);
            }
            setTimeout(function(){
                if(self.callbackStore[obj['message_id']]){
                    delete self.callbackStore[obj['message_id']];
                    callback('TIMEOUT', null);
                }
            }, timeout);
        }
        if (self.socket && self.socket.readyState == WebSocket.OPEN) {
            if (self.delaySendMessages.length) {
                while (obj = JSON.parse(self.delaySendMessages.shift() || null)) {
                    self.sendBackground(obj, null, null);
                }
            }
            return self.socket.send(JSON.stringify(obj));
        } else {
            if (self.delaySendMessages.indexOf(key) !== -1) {
                self.delaySendMessages.push(key);
            }
            return false;
        }
    },

    sendBackground: function(obj, callback, context) {
        this.backgroundTasks.push([obj, callback, context]);
    },

    addListener: function(eventName, fn) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        if (typeof(fn) == 'function') {
            return this.listeners[eventName].push(fn);
        }
        return false;
    },

    removeListener: function(eventName, fn) {
        if (this.listeners[eventName]) {
            return Ext.Array.remove(this.listeners[eventName], fn);
        }
        return false;
    }
});
