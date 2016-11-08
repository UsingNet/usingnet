Ext.define('Admin.view.communication.autoReply.AutoTimeout', {
    extend: 'Ext.panel.Panel',
    xtype: 'autotimeout',
    margin: 20,
    padding: 20,
    //flex: 1,
    cls: 'shadow',
    style: {
        border: '1px solid #ECF0F5'
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'fieldcontainer',
        height: 30,
        layout: 'hbox',
        items: [{
            xtype: 'checkbox',
            listeners: {
                afterrender: function() {
                    var value = Admin.data.AutoReply.get('timeout.status');
                    var me = this;
                    if ('open' === value) {
                        me.setValue(true);
                    } else if ('close' === value) {
                        me.setValue(false);
                    }

                    me.on('change', function() {
                        if (me.value) {
                            Admin.data.AutoReply.set('timeout.status', 'open');
                        } else {
                            Admin.data.AutoReply.set('timeout.status', 'close');
                        }
                    });
                }
            }
        }, {
            xtype: 'displayfield',
            margin :'0 0 0 10',
            value: '自动发送无回复提醒'
        }]
    }, {
        xtype: 'displayfield',
        height: 30,
        value: '客服在一段时间内没有回复客户时，系统自动给客户发送您自定义的消息。'
    }, {
        xtype: 'panel',
        flex: 1,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        style: {
            borderTop: '1px solid #EEEEEE'
        },
        items: [{
            xtype: 'panel',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [{
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'displayfield',
                    value: '客服超过'
                }, {
                    xtype: 'numberfield',
                    width: 60,
                    minValue: 30,
                    margin :'0 0 0 10',
                    listeners: {
                        afterrender: function() {
                            this.setValue(Admin.data.AutoReply.get('timeout.timeout'));
                        },
                        blur: function() {
                            Admin.data.AutoReply.set('timeout.timeout', this.getValue());
                        }
                    }
                }, {
                    margin :'0 0 0 10',
                    xtype: 'displayfield',
                    value: '秒无回复时自动发送'
                }]
            }]
        }, {
            xtype: 'panel',
            itemId: 'messageContainer',
            flex: 2,
            layout: {
                type: 'hbox',
                align: 'center'
            },
            items: [{
                xtype: 'textarea',
                width: 250,
                hidden: true,
                style: {
                    border: '6px solid #EBF4FD',
                    borderRadius: '4px'
                },
                listeners: {
                    afterrender: 'switchComponet',
                    show: function() {
                        this.setValue(Admin.data.AutoReply.get('timeout.message'));
                        this.focus();
                    }
                }
            }, {
                xtype: 'automessage',
                getMessage: function() {
                    var data = this.getData();
                    data.message = Admin.data.AutoReply.get('timeout.message');
                    this.setData(data);
                },
                listeners: {
                    afterrender: function() {
                        var me = this;
                        me.getMessage();
                        me.up('autoreply').controller.switchComponet(me);
                    },
                    show: function() {
                        this.getMessage();
                    }
                }
            }, {
                xtype: 'button',
                itemId: 'modify',
                margin: '0 0 0 10',
                text: '修改',
                hidden: true,
                handler: function() {
                    this.isModifying = true;
                    this.hide();
                }
            }, {
                xtype: 'button',
                text: '保存',
                ui: 'soft-green',
                hidden: true,
                handler: function() {
                    var me = this;
                    var modifyBtn = me.up().down('#modify');
                    Admin.data.AutoReply.set('timeout.message', me.up().down('textarea').getValue());
                    modifyBtn.fireEvent('click');
                    modifyBtn.show();
                    modifyBtn.isModifying = false;
                },
                listeners: {
                    afterrender: 'switchComponet'
                }
            }, {
                xtype: 'button',
                text: '取消',
                ui: 'soft-blue',
                margin :'0 0 0 10',
                hidden: true,
                handler: function() {
                    var modifyBtn = this.up().down('#modify');
                    modifyBtn.fireEvent('click');
                    modifyBtn.show();
                    modifyBtn.isModifying = false;
                },
                listeners: {
                    afterrender: 'switchComponet'
                }
            }]
        }]
    }]
});