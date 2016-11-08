Ext.define('Admin.view.communication.customerService.chat.WorkOrderChatPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'workorderchatpanel',
    margin: '5 0 5 0',
    width: '100%',
    scrollable: 'vertical',
    // layout: {
    //     type: 'vbox',
    //     slign: 'stretch'
    // },
    items: [],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        margin: 0,
        padding: 0,
        height: 12,
        items: [{
            xtype: 'tbtext',
            padding: '0 12',
            hidden: true,
            style: {
                width: '100%',
                height: '12px',
                fontSize: '12px',
                lineHeight: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }
        }]
    }],
    showLastMessage: function() {
        var items = this.items.items;
        var len = items.length;
        var types = ['IM', 'MAIL', 'SMS', 'VOICE', 'WECHAT'];

        if (len) {
            this.lastMessage = items[len-1].metaData;
        }
        while (len--) {
            var metaData = items[len].metaData;
            if ('RECEIVE' === metaData.direction && metaData.type && types.indexOf(metaData.type) > -1) {
                this.lastReceiveMessage = metaData;
                this.fireEvent('lastReceiveMessageChange');
                break;
            }
        }
    },
    unreadCountInc: function() {
        this.unreadCount++;
        //if (!this.isChatting) {
        //    Admin.data.Tools.CustomTools.playRemindingAudio();
        //}
        this.fireEvent('unreadCountChange');
    },
    unreadCountDes: function() {
        this.unreadCount--;
        this.fireEvent('unreadCountChange');
    },
    onResize: function() {
        var me = this;
        var parent = this.up();
        if (parent) {
            me.setHeight(parent.getHeight() - 10);
        }
    },
    listeners: {

        customertyping: function(message) {
            var me = this;
            var typing = me.down('toolbar').items.getAt(0);
            clearTimeout(me.hideTypingTimeoutId);
            if (!message) {
                typing.hide();
                return;
            }

            typing.setText('客户正在输入：' + message);
            typing.show();

            me.hideTypingTimeoutId = setTimeout(function() {
                typing.hide();
            }, 3000);
        },

        add: function(me, component, index, eOpts) {

            if (!component.createdAt || 'systemmessge' === component.type) {
                return;
            }
            var next = me.items.getAt(index + 1);
            var prev = me.items.getAt(index - 1);
            var data = null;
            if ((prev && !prev.createdAt) || (next && !prev) || (!next && !prev)) {
                component.data.displayTime = 'block';
                component.setData(component.data);
            }
            if (next) {
                if (next.createdAt - component.createdAt > 120) {
                    next.data.displayTime = 'block';
                    next.setData(next.data);
                } else {
                    next.data.displayTime = 'none';
                    next.setData(next.data);
                }
            } else if (prev && prev.createdAt) {
                if (component.createdAt - prev.createdAt > 120) {
                    component.data.displayTime = 'block';
                    component.setData(component.data);
                }
            }
        },
        added: function(me, parent, pos, eOpts) {
            me.onResize();
            parent.addListener('resize', me.onResize);
        },
        removed: function(me, parent) {
            parent.removeListener('resize', me.onResize);
        },
        beforerender: function() {
            this.reconnectCount = 0;
        },
        afterrender: function(panel) {
            panel.unreadCount = 0;
            panel.initScorll = false;
            panel.reconnectCount++;
            var remote = panel.config.workOrder.contact.token;
            Ext.Ajax.request({
                url: '/api/message/agent',
                method: 'GET',
                params: {
                    type: 'IM',
                    remote: remote
                },
                success: function(response, eOpts) {
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert('错误', res.msg);
                        return;
                    }
                    var data = res.data;
                    panel.WebSocket = Ext.create('Admin.store.communication.customerService.WebSocket', {
                        token: data
                        //,reconnectByToken: function() {
                        //    setTimeout(function() {
                        //        panel.fireEvent('afterrender', panel);
                        //    }, Math.pow(2, panel.reconnectCount) * 1000);
                        //}
                    });
                    panel.WebSocket.addListener('tokenerror',function(event){
                        Ext.Ajax.request({
                            url: '/api/message/agent',
                            method: 'GET',
                            params: {
                                type: 'IM',
                                remote: remote
                            },
                            success: function (response, eOpts) {
                                var res = Ext.decode(response.responseText);
                                if (!res.success) {
                                    Ext.Msg.alert('错误', res.msg);
                                    return;
                                }
                                event.target.token = res.data;
                            }
                        });
                    });
                    panel.WebSocket.addListener('message', function(event) {
                        var res = event.response;
                        Admin.view.communication.customerService.singleton.MessageFactory.emit(res, panel);
                    });
                },
                failure: function(response, eOpts) {
                    //TODO: On Error Message
                }
            });
        },
        afterlayout: function() {
            var self = this;
            if (this.unreadCount || !this.initScorll) {
                if (self.clickTailBtn) {
                    self.scrollBy(0, 0);
                } else {
                    self.scrollBy(0, 10000000);
                }

                setTimeout(function() {
                    if (self.isChatting) {
                        self.initScorll = true;
                    }
                }, 1000);
            }
        }
    }
});
