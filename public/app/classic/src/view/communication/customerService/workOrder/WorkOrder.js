// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.workOrder.WorkOrder', {
    extend: 'Ext.panel.Panel',
    xtype: 'workorderpanel',
    id: 'treelist',
    viewModel: {
        type: 'workordermodel'
    },
    controller: 'workordercontroller',
    title: '进行中的对话',
    height: '100%',
    width: '100%',
    cls: 'shadow',
    scrollable: true,
    layout: 'vbox',
    // afterInit: false,
    getSelection: function() {
        // return this.items.filter('_isSelected', true);
        var rVal = null;
        this.items.each(function(item) {
            if (item.isSelected()) {
                rVal = item;
            }
        });
        return rVal;
    },
    select: function(orderNode) {
        var oldSelected = this.getSelection();
        if (oldSelected && oldSelected != orderNode) {
            this.oldSelected = oldSelected;
        }
        if (this.items.indexOf(orderNode) == -1) {
            throw 'This orderNode is not a child of orderPanel';
        }
        if (oldSelected == orderNode) {
            return false;
        }
        this.items.each(function(node) {
            node.deSelect();
        });
        orderNode.select();

        var data = orderNode.data;
        if ('block' === data.showNewOrderIcon) {
            data.time = '';
            data.content = '';
            data.contentColor = '';
            data.showNewOrderIcon = 'none';
            orderNode.setData(data);

            this.newOrdersCount--;
            Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({
                order: this.newOrdersCount
            });
        }
        this.fireEvent('change', this, orderNode, oldSelected);


    },

    tbar: [{
        xtype: 'displayfield',
        width: '100%',
        value: '你暂时没有对话',
        fieldStyle: 'color: #818181;',
        style: {
            textAlign: 'center',
            marginTop: '400px'
        }
    }],
    items: [

    ],
    listeners: {
        add: function(me, node) {
            if (me.afterInit) {
                me.newOrdersCount++;
                Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({
                    order: me.newOrdersCount
                });
            } else {
                node.addListener('afterrender', function() {
                    me.select(node);
                });
            }
            // Ext.getCmp('treelist').fireEvent('orderadded');
            me.down('toolbar').hide();
            Ext.getCmp('chatWindow').setStyle('borderBottom', '3px solid #367fa9');
            var customerservice = me.up('customerservice');
            customerservice.down('chatpanel').down('toolbar').hide();

            var sendTypeToolbar = Ext.getCmp('sendTypeToolbar');
            sendTypeToolbar.show();
            sendTypeToolbar.up().show();
        },
        remove: function(me, component) {
            //if (component.workOrderChatPanel.WebSocket) {
            //    component.workOrderChatPanel.WebSocket.close();
            //}
            // Ext.getCmp('treelist').fireEvent('orderremoved');
            if (me.items.length == 0) {
                me.fireEvent('change', me, null, null);
                //显示无数据提示
                me.down('toolbar').show();
                Ext.getCmp('chatWindow').setStyle('borderBottom', '0px');
                var customerservice = me.up('customerservice');
                customerservice.down('chatpanel').down('toolbar').show();

                var sendTypeToolbar = Ext.getCmp('sendTypeToolbar');
                sendTypeToolbar.hide();
                sendTypeToolbar.up().hide();
            }
        },
        afterrender: function() {
            this.newOrdersCount = 0;
            var workorderstore = this.getViewModel().storeInfo.workorderstore;
            workorderstore.addListener('load', this.controller.workOrderStoreLoad);
            workorderstore.load();

            var self = this;
            Admin.data.Team.addListener('sync', function() {
                self.fireEvent('beforerender');
            });
        },
        beforerender: function() {
            var me = this;
            var autoReply = Admin.data.Team.get('auto-reply');
            if (autoReply) {
                var timeout = autoReply['timeout'];

                if (me.chat_timeout_interval) {
                    clearInterval(me.chat_timeout_interval);
                }

                if (timeout['status'] == 'open' && timeout['message']) {

                    me.chat_timeout_interval = setInterval(function() {
                        var now = parseInt(Date.parse(new Date()) / 1000);
                        me.items.each(function(item) {
                            var lastMessage = item.workOrderChatPanel.lastMessage;
                            if (lastMessage) {
                                var time = lastMessage.created_at;
                                if (lastMessage.lastTypingTime && lastMessage.lastTypingTime > lastMessage.created_at) {
                                    time = lastMessage.lastTypingTime;
                                }
                                if (['IM', 'WECHAT'].indexOf(lastMessage.type) >= 0 &&
                                    'RECEIVE' === lastMessage.direction &&
                                    !lastMessage.isTail &&
                                    time < (now - timeout['timeout'])
                                ) {
                                    Ext.Ajax.request({
                                        url: '/api/message/agent',
                                        method: 'POST',
                                        jsonData: Ext.JSON.encode({
                                            type: item.workOrder.type,
                                            to: item.workOrder.contact.id,
                                            body: timeout['message'],
                                            timeout: 1
                                        })
                                    });
                                }
                            }
                        });
                    }, 5000);

                }
            }
        },
        change: function(me, newNode, oldNode) {
                // if (oldNode) {
                //     Ext.getCmp('chatWindow').remove(oldNode.workOrderChatPanel, false);
                // }
                // Ext.getCmp('chatWindow').items.each(function(item){
                //     item.setFlex(0);
                // });
                var toolbar = me.down('toolbar');
                Ext.getCmp('chatWindow').removeAll(false);
                if (newNode) {
                    // toolbar.hide();
                    Ext.getCmp('chatWindow').add(newNode.workOrderChatPanel);
                } else {
                    // toolbar.show();
                }
            }
            // add: 'afterAddOrder'
    }
});
