/**
 * Created by henry on 16-1-27.
 */
Ext.define('Admin.data.MessageListener', {
    singleton: true,
    socket: null,
    reconnectCount: 0,
    connect: function() {
        if (this.socket) {
            return;
        }
        var me = this;
        me.reconnectCount++;
        Ext.Ajax.request({
            url: '/api/message/agent?type=LISTENER',
            //async: false,
            success: function(response, eOpts) {
                var res = Ext.JSON.decode(response.responseText);
                if (!res.success) {
                    me.socket = null;
                    Ext.Msg.alert('错误', res.msg);
                    return;
                }
                var token = res.data;
                var listenerWebSocket = Ext.create('Admin.store.communication.customerService.WebSocket', {
                    token: token
                        //,reconnectByToken: function() {
                        //    me.socket = null;
                        //    setTimeout(function() {
                        //        me.connect();
                        //    }, Math.pow(2, me.reconnectCount) * 1000);
                        //}
                });
                me.socket = listenerWebSocket;
                var message_list_id = 0;

                listenerWebSocket.addListener('tokenerror', function(event) {
                    Ext.Ajax.request({
                        url: '/api/message/agent?type=LISTENER',
                        success: function(response) {
                            var res = Ext.JSON.decode(response.responseText);
                            if (res.success) {
                                event.target.token = res.data;
                            }
                        }
                    });
                });

                listenerWebSocket.addListener('open', function() {
                    if (Ext.getCmp('treelist')) {
                        Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load();
                    }
                });

                listenerWebSocket.addListener('message', function(event) {
                    (function(this_message_list_id) {
                        Admin.data.Dashboard.fireEvent('realtimedata');

                        var listener = event.response;
                        var data = listener.data;

                        if ('message' === listener.type && Object.getOwnPropertyNames(data).length) {
                            Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load();
                        }

                        if (!Object.getOwnPropertyNames(data).length) {
                            Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({
                                order: 0
                            });
                        }


                        // if ('message' === listener.type) {
                        //     for (var name in data) {
                        //         // if ('SEND' === data[name][0].direction) {
                        //         //     continue;
                        //         // }
                        //         if ('SYSTEM' === data[name][0].type) {
                        //             if (data[name][0].notice) {
                        //                 if ('#customerservice' !== location.hash) {
                        //                     location.hash = '#customerservice';
                        //                 }
                        //                 if (Ext.getCmp('treelist')) {
                        //                     Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load();
                        //                 }
                        //             }
                        //             delete data[name];
                        //         }
                        //     }
                        //     var orderCount = Object.getOwnPropertyNames(data).length;

                        //     if (orderCount) {
                        //         var userTags = Ext.Array.pluck(Admin.data.User.get('tags'), 'id');
                        //         var normalOrders = [],
                        //             tagOrders = [];
                        //         var count = Ext.Object.getSize(data);
                        //         for (var key in data) {
                        //             (function(key) {
                        //                 Ext.Ajax.request({
                        //                     url: '/api/contact/' + encodeURIComponent(data[key][0]['package'].contact.id),
                        //                     success: function(response) {
                        //                         count--;
                        //                         var res = Ext.decode(response.responseText);
                        //                         if (res.success) {
                        //                             var order = {
                        //                                 to: data[key][0].to,
                        //                                 from: data[key][0].from,
                        //                                 type: data[key][0].type,
                        //                                 text: res.data.name,
                        //                                 messageId: data[key][0]._id,
                        //                                 xtype: 'menuitem'
                        //                             };
                        //                             var customerTags = Ext.Array.pluck(res.data.tags, 'id');
                        //                             if (Ext.Array.intersect(userTags, customerTags).length) {
                        //                                 tagOrders.push(order);
                        //                             } else {
                        //                                 normalOrders.push(order);
                        //                             }
                        //                         }

                        //                         if (!count && this_message_list_id == message_list_id) {
                        //                             Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({
                        //                                 order: tagOrders.length + normalOrders.length
                        //                             });
                        //                             var normalOrderBtn = Ext.getCmp('messageReminding');
                        //                             var tagOrderBtn = Ext.getCmp('tagsReminding');
                        //                             normalOrderBtn.setMenu(new Ext.menu.Menu({
                        //                                 items: normalOrders
                        //                             }), true);
                        //                             normalOrderBtn.fireEvent('setmenu');
                        //                             tagOrderBtn.setMenu(new Ext.menu.Menu({
                        //                                 items: tagOrders
                        //                             }), true);
                        //                             tagOrderBtn.fireEvent('setmenu');
                        //                         }
                        //                     }
                        //                 });
                        //             })(key);
                        //         }
                        //     } else {
                        //         Ext.getCmp('tagsReminding').hide();
                        //         Ext.getCmp('messageReminding').hide();
                        //     }
                        // }
                    })(++message_list_id);
                });
            },
            failure: function(response, eOpts) {
                Ext.Msg.alert('错误', '发生异常，无法获取token，连接消息中心失败，请联系平台处理。');
            }
        });
    },
    close: function() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            //TODO: 清空工单， 清空工单提醒
        }
    },
    constructor: function() {}
});
