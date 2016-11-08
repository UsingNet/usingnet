Ext.define('Admin.view.communication.customerService.chat.EditorContainer', {
    extend: 'Ext.panel.Panel',
    xtype: 'editorContainer',
    items: [
        //Editor
    ],
    dockedItems: [{
        xtype: 'toolbar',
        id: 'sendTypeToolbar',
        hidden: true,
        dock: 'top',
        padding: '0 0 5 0',
        items: [{
                xtype: 'displayfield',
                fieldLabel: '回复方式',
                labelWidth: 56
            }, {
                xtype: 'splitbutton',
                menuAlign: 'tl-tr',
                style: {
                    marginLeft: '-5px'
                },
                id: 'sendTypeCombo',
                value: null,
                getValue: function() {
                    return this.value;
                },
                showEmptyMenu: true,
                listeners: {
                    afterrender: function() {
                        var me = this;
                        me.up('customerservice').down('workorderpanel').on('change', function(workOrderPanel, newNode, oldNode) {
                            if (!newNode) {
                                return;
                            }
                            var oldValue = me.workOrder ? me.workOrder.type : null;
                            me.workOrder = newNode.workOrder;
                            me.workOrderComponent = newNode;
                            var responseType = [
                                // {
                                //     "type": "SMS",
                                //     "name": "短信",
                                //     need_field: "phone"
                                // },
                                {
                                    "type": "VOICE",
                                    "name": "电话",
                                    need_field: "phone",
                                    status: Admin.data.Permission.get('chat.voip.status')
                                }, {
                                    "type": "IM",
                                    "name": "即时消息",
                                    need_field: "track_id",
                                    status: true
                                }, {
                                    "type": "WECHAT",
                                    "name": "微信",
                                    need_field: "openid",
                                    status: true
                                }, {
                                    "type": "MAIL",
                                    "name": "邮件",
                                    need_field: "email",
                                    status: Admin.data.Permission.get('chat.mail.status')
                                }
                            ];
                            var items = [];
                            Ext.Array.each(responseType, function(item) {
                                var isDisabled = true;
                                items.push({
                                    metaData: item,
                                    text: item.name,
                                    xtype: 'menuitem',
                                    disabled: !me.workOrder.contact[item.need_field],
                                    hidden: !item.status,
                                    handler: function() {
                                        oldValue = me.workOrder.type;
                                        this.up('chatpanel').controller.sendTypeChange(this.up('splitbutton'), this.metaData.type, this.metaData.name, oldValue, false);
                                    }
                                });
                            });
                            var menu = new Ext.menu.Menu({
                                items: items
                            });
                            me.setMenu(menu, true);
                            var name = Ext.Array.findBy(responseType, function(item) {
                                return item.type === me.workOrder.type;
                            }).name;
                            me.up('chatpanel').controller.sendTypeChange(me, me.workOrder.type, name, oldValue, true);
                        });
                    }
                },
                handler: function() {
                    this.showMenu();
                }
            },
            '->', {
                xtype: 'button',
                text: '延期处理',
                handler: function() {
                    var me = this;
                    var sendTypeCombo = Ext.getCmp('sendTypeCombo');
                    var workOrderId = sendTypeCombo.workOrder.id;
                    var workOrderNode = sendTypeCombo.workOrderComponent;
                    if (workOrderNode.isOnPhone) {
                        Ext.Msg.alert('错误', '通话状态下的工单不能执行此操作！');
                        return;
                    }
                    Ext.create('Ext.window.Window', {
                        autoShow: true,
                        width: '30%',
                        height: '20%',
                        bodyPadding: 20,
                        modal: true,
                        title: '延期处理',
                        layout: 'fit',
                        items: [{
                            xtype: 'textarea',
                            fieldLabel: '备注',
                            labelWidth: 40
                        }],
                        dockedItems: [{
                            xtype: 'toolbar',
                            dock: 'bottom',
                            items: ['->', {
                                text: '取消',
                                ui: 'soft-blue',
                                handler: function() {
                                    this.up('window').close();
                                }
                            }, {
                                text: '提交',
                                ui: 'soft-green',
                                handler: function() {
                                    var self = this;
                                    var remark = self.up('window').down('textarea').getValue();
                                    Ext.Ajax.request({
                                        url: '/api/order/timing',
                                        method: 'POST',
                                        jsonData: Ext.encode({
                                            id: workOrderId,
                                            remark: remark
                                        }),
                                        success: function(response) {
                                            var res = Ext.decode(response.responseText);
                                            if (res.success) {
                                                workOrderNode.up('workordertab').down('timingorderspanel').fireEvent('afterrender');
                                                workOrderNode.up().remove(workOrderNode);
                                                self.up('window').close();
                                                Ext.Msg.alert('成功', '延期成功，请到“工单列表” - “延期的对话”进行查看。');
                                            } else {
                                                Ext.Msg.alert('错误', res.msg);
                                            }
                                        },
                                        failure: function(response) {
                                            Ext.Msg.alert('错误', '服务器错误！');
                                        }
                                    });
                                }
                            }]
                        }]
                    });
                }
            }, {
                xtype: 'splitbutton',
                menuAlign: 'tl-tr',
                text: '转接',
                showEmptyMenu: true,
                arrowHandler: function() {
                    var dropButton = this;
                    var chatpanel = this.up('chatpanel');
                    Ext.Ajax.request({
                        url: '/api/online',
                        success: function(response) {
                            var responseData = Ext.decode(response.responseText);
                            var items = [];
                            Ext.Array.each(responseData.data, function(item) {
                                items.push({
                                    text: item.name,
                                    xtype: 'menuitem',
                                    disabled: item.id === Admin.data.User.get('id'),
                                    handler: function() {
                                        chatpanel.controller.transferOrder(Ext.getCmp('treelist').getSelection(), item.id);
                                    }
                                });
                            });
                            var menu = new Ext.menu.Menu({
                                items: items
                            });
                            dropButton.setMenu(menu, true);
                            dropButton.showMenu();
                        }
                    });
                },
                handler: function() {
                    this.arrowHandler();
                }
            }
        ]
    }]
});
