Ext.define('Admin.view.communication.autoReply.AutoBye', {
    extend: 'Ext.panel.Panel',
    xtype: 'autobye',
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
        width: 30,
        layout: 'hbox',
        items: [{
            xtype: 'checkbox',
            listeners: {
                afterrender: function() {
                    var value = Admin.data.AutoReply.get('bye.status');
                    var me = this;
                    if ('open' === value) {
                        me.setValue(true);
                    } else if ('close' === value) {
                        me.setValue(false);
                    }

                    me.on('change', function() {
                        if (me.value) {
                            Admin.data.AutoReply.set('bye.status', 'open');
                        } else {
                            Admin.data.AutoReply.set('bye.status', 'close');
                        }
                    });

                }
            }
        }, {
            margin :'0 0 0 10',
            xtype: 'displayfield',
            value: '自动发送结束消息'
        }]
    }, {
        xtype: 'displayfield',
        width: 30,
        value: '对话结束后，系统自动给客户发送您自定义的信息'
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
        items: [
        //{
        //    xtype: 'tbtext',
        //    text: '客服人为结束时：',
        //    padding: '10 0'
        //},
        {
            xtype: 'panel',
            flex: 1,
            itemId: 'messageContainer',
            layout: {
                type: 'hbox',
                align: 'center'
            },
            items: [
                {
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
                            this.setValue(Admin.data.AutoReply.get('bye.message'));
                            this.focus();
                        }
                    }
                }, {
                    xtype: 'automessage',
                    getMessage: function() {
                        var data = this.getData();
                        data.message = Admin.data.AutoReply.get('bye.message');
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
                    margin :'0 0 0 10',
                    xtype: 'button',
                    itemId: 'modify',
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
                        Admin.data.AutoReply.set('bye.message', me.up().down('textarea').getValue());
                        modifyBtn.fireEvent('click');
                        modifyBtn.show();
                        modifyBtn.isModifying = false;
                    },
                    listeners: {
                        afterrender: 'switchComponet'
                    }
                }, {
                    margin :'0 0 0 10',
                    xtype: 'button',
                    text: '取消',
                    ui: 'soft-blue',
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
                }
            ]
        }
        //, {
        //    xtype: 'tbtext',
        //    text: '系统自动结束时：',
        //    padding: '10 0'
        //}, {
        //    xtype: 'panel',
        //    flex: 1,
        //    layout: {
        //        type: 'hbox',
        //        align: 'center'
        //    },
        //    items: [
        //        {
        //            xtype: 'textarea',
        //            width: 250,
        //            hidden: true,
        //            style: {
        //                border: '6px solid #EBF4FD',
        //                borderRadius: '4px'
        //            },
        //            listeners: {
        //                afterrender: 'switchComponet',
        //                show: function() {
        //                    this.setValue(Admin.data.AutoReply.get('bye.system_message'));
        //                    this.focus();
        //                }
        //            }
        //        }, {
        //            xtype: 'automessage',
        //            getMessage: function() {
        //                var data = this.getData();
        //                data.message = Admin.data.AutoReply.get('bye.system_message');
        //                this.setData(data);
        //            },
        //            listeners: {
        //                afterrender: function() {
        //                    var me = this;
        //                    me.getMessage();
        //                    me.up('autoreply').controller.switchComponet(me);
        //                },
        //                show: function() {
        //                    this.getMessage();
        //                }
        //            }
        //        }, {
        //            xtype: 'button',
        //            itemId: 'modify',
        //            text: '修改',
        //            handler: function() {
        //                this.hide();
        //            }
        //        }, {
        //            xtype: 'button',
        //            text: '保存',
        //            ui: 'soft-green',
        //            hidden: true,
        //            handler: function() {
        //                var me = this;
        //                Admin.data.AutoReply.set('bye.system_message', me.up().down('textarea').getValue());
        //                me.up().down('#modify').fireEvent('click');
        //                me.up().down('#modify').show();
        //            },
        //            listeners: {
        //                afterrender: 'switchComponet'
        //            }
        //        }, {
        //            xtype: 'splitter',
        //            hidden: true,
        //            listeners: {
        //                afterrender: 'switchComponet'
        //            }
        //        }, {
        //            xtype: 'button',
        //            text: '取消',
        //            ui: 'soft-blue',
        //            hidden: true,
        //            handler: function() {
        //                var me = this;
        //                me.up().down('#modify').fireEvent('click');
        //                me.up().down('#modify').show();
        //            },
        //            listeners: {
        //                afterrender: 'switchComponet'
        //            }
        //        }
        //    ]
        //}
        ]
    }]
});