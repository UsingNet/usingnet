/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.HistoryMessageFactory', {
    singleton: true,

    __onMessageEmit: function(message) {
        var chatPanel = this.container;
        var itemLength = chatPanel.items.items.length;
        while (itemLength--) {
            if (chatPanel.items.getAt(itemLength).createdAt <= message.createdAt) {
                break;
            }
        }
        chatPanel.insert(itemLength + 1, message);
        var panelDom = chatPanel.el.dom;
        Ext.Array.each(panelDom.querySelectorAll('img, video'), function(img) {
            if (!img.complete) {
                img.addEventListener('load', function() {
                    if (chatPanel) {
                        var height = chatPanel.getHeight();
                        chatPanel.setHeight(height - 1);
                        chatPanel.setHeight(height);
                    }
                });
            }
        });
    },


    emit: function(data, panel) {
        var me = this;
        me.container = panel;
        if (this.listeners.messages[data.type]) {

            me.listeners.messages[data.type](data, me);
        }
    },

    listeners: {
        messages: {
            MAIL: function(data, factory) {
                var pkg = data['package'];
                var message = {
                    xtype: 'mailmessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        message: data.body.replace(/<.*?>/ig, "").substr(0, 25),
                        img: 'SEND' === data.direction ? pkg.agent.img : pkg.contact.img,
                        name: 'SEND' === data.direction ? (pkg.agent.id === Admin.data.User.get('id') ? '我' : pkg.agent.name) : pkg.contact.name,
                        title: data.title,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            },
            SYSTEM: function(data, factory) {
                var message = {
                    xtype: 'systemmessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        message: data.body,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            },
            NOTE: function(data, factory) {
                var message = {
                    xtype: 'notemessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        message: data.body,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            },
            WECHAT: function(data, factory) {
                var pkg = data['package'];
                var message = {
                    xtype: 'wechatmessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        img: 'SEND' === data.direction ? pkg.agent.img : pkg.contact.img,
                        name: 'SEND' === data.direction ? pkg.agent.name : pkg.contact.name,
                        message: data.body,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            },
            IM: function(data, factory) {
                var pkg = data['package'];
                var message = {
                    xtype: 'immessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        img: 'SEND' === data.direction ? pkg.agent.img : pkg.contact.img,
                        name: 'SEND' === data.direction ? pkg.agent.name : pkg.contact.name,
                        message: data.body,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            },
            SMS: function(data, factory) {
                var message = {
                    xtype: 'smsmessage',
                    createdAt: data.created_at,
                    metaData: data,
                    data: {
                        time: Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000),
                        message: data.body,
                        remote: 'SEND' !== data.direction
                    }
                };
                factory.__onMessageEmit(message);
            }
        }
    }
});
