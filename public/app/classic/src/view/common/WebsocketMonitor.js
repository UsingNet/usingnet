/**
 * Created by henry on 16-3-14.
 */
Ext.define('Admin.view.common.WebsocketMonitor', {
    extend:'Ext.window.Window',
    title: '网络状态管理器',
    modal: true,
    singleton: true,
    autoDestroy: false,
    closeAction: 'hide',
    width: '40%',
    __auto_increase_id : 0,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    poll: [],
    items:[
        {
            xtype: 'grid',
            flex:1,
            columns: [
                { text: '连接ID', dataIndex: 'id' },
                { text: '类型', dataIndex: 'type'},
                { text: '状态', dataIndex: 'status', renderer:function(value){
                    var status = {
                        'OPEN':'已连接',
                        'CONNECTING':'连接中',
                        'CLOSING':'断开中',
                        'CLOSED':'已断开'
                    };
                    return status[value];
                }},
                { text: '描述', dataIndex: 'description', flex: 1 }
            ],
            store: Ext.create('Ext.data.Store', {
                fields:['id','type','status','description'],
                data: [
                    //{id:1, type:'LISTENER', status: '连接中', description:'ws://ws.usingnet.com/'}
                ]
            })
        },
        {
            xtype: 'panel',
            padding: 10,
            'html':'如果这是您第一次看到此窗口，可能是由于网络环境波动造成的，系统将会在稍后自动重新连接服务器；<br/>如果您经常看到此窗口，请告知我们，或与您的网络管理员联系。'
        }
    ],

    buildModelData: function(socket){
        var me = this;
        var data = {
            id: socket.connection_id,
            type: 'Websocket',
            description: ''
        };
        if(!socket.socket){
            data['status'] = 'CLOSED';
        }else {
            switch(socket.socket.readyState){
                case WebSocket.CONNECTING:
                    data['status'] = 'CONNECTING';
                    break;
                case WebSocket.OPEN:
                    data['status'] = 'OPEN';
                    break;
                case WebSocket.CLOSING:
                    data['status'] = 'CLOSING';
                    break;
                case WebSocket.CLOSED:
                    data['status'] = 'CLOSED';
                    if(socket.reConnect) {
                        data['description'] = '即将第' + ((socket.reconnectCount ? socket.reconnectCount : 0) + 1) + '次自动重新连接';
                        if(socket.reconnectCount > 2){
                            me.show();
                        }
                    }else{
                        data['description'] = '';
                    }
                    break;
            }
        }
        return data;
    },

    refreshStore:function(socket, event_name){
        var me = this;
        var store = this.down('grid').store;
        if(typeof(socket) == 'undefined' || typeof(event_name) == 'undefined') {
            me.poll.forEach(function (socket) {
                var record = store.getById(socket.connection_id);
                if (record) {
                    store.remove(record);
                    store.add(me.buildModelData(socket));
                } else {
                    store.add(me.buildModelData(socket));
                }
            });
        }else{
            var record = store.getById(socket.connection_id);
            if(record){
                store.remove(record);
            }
            var data = me.buildModelData(socket);
            switch(event_name){
                case 'PREOPEN':
                    data['status'] = 'CONNECTING';
                    break;
                case 'PREOPEN_TIMEOUT':
                    if(data['status']!='OPEN'){
                        data['status'] = 'CLOSED';
                        if(socket.reConnect){
                            data['description'] = '即将第' + ((socket.reconnectCount?socket.reconnectCount:0) + 1) + '次自动重新连接';
                            if(socket.reconnectCount > 2){
                                me.show();
                            }
                        }
                    }
                    break;
            }
            store.add(data);
        }

        if(!me.isHidden()){
            var need_hide = true;
            me.poll.forEach(function (socket) {
                if(!socket.socket || socket.socket.readyState != WebSocket.OPEN){
                    need_hide = false;
                }
            });
            if(need_hide){
                me.hide();
            }
        }
    },


    registerWebsocket:function(socket){
        if(socket) {
            var me = this;
            me.poll.push(socket);
            socket.addListener('preopen', me.socket_listener.preopen);
            socket.addListener('open', me.socket_listener.open);
            socket.addListener('close', me.socket_listener.close);
            me.refreshStore(socket, 'INIT');
        }
    },

    deregisterWebsocket:function(socket){
        var me = this;
        var store = this.down('grid').store;
        if(me.poll.indexOf(socket)>=0){
            Ext.Array.remove(me.poll, socket);
            var record = store.getById(socket.connection_id);
            if(record){
                store.remove(record);
            }
        }
    },

    socket_listener:{
        'preopen':function(event){
            var me = Admin.view.common.WebsocketMonitor;
            if(me.poll.indexOf(event.target.ownerCt)<0){
                me.poll.push(event.target.ownerCt);
            }
            me.refreshStore(event.target.ownerCt, 'PREOPEN');
            setTimeout(function(){
                me.refreshStore(event.target.ownerCt, 'PREOPEN_TIMEOUT');
            },5000);
        },
        'open':function(event){
            var me = Admin.view.common.WebsocketMonitor;
            me.refreshStore(event.target.ownerCt,'OPEN');
        },
        'close':function(event){
            var me = Admin.view.common.WebsocketMonitor;
            me.refreshStore(event.target.ownerCt,'CLOSE');
        }
    },

    pop:function(){
        return this.poll.pop();
    },

    getAutoIncreaseId:function(){
        return ++this.__auto_increase_id;
    }
});
