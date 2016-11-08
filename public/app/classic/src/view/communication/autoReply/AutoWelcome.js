Ext.define('Admin.view.communication.autoReply.AutoWelcome', {
    extend: 'Ext.panel.Panel',
    xtype: 'autowelcome',
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
                    var value = Admin.data.AutoReply.get('welcome.status');
                    var me = this;
                    if ('open' === value) {
                        me.setValue(true);
                    } else if ('close' === value) {
                        me.setValue(false);
                    }

                    me.on('change', function() {
                        if (me.value) {
                            Admin.data.AutoReply.set('welcome.status', 'open');
                        } else {
                            Admin.data.AutoReply.set('welcome.status', 'close');
                        }
                    });
                }
            }
        }, {
            margin :'0 0 0 10',
            xtype: 'displayfield',
            value: '自动发送欢迎消息'
        }]
    }, {
        xtype: 'displayfield',
        height: 30,
        value: '对话开始时，系统自动给客户发送您自定义的欢迎消息。'
    }, {
        xtype: 'panel',
        itemId: 'messageContainer',
        flex: 1,
        layout: {
            type: 'hbox',
            align: 'center'
        },
        style: {
            borderTop: '1px solid #EEEEEE',
            background: 'red'
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
                    this.setValue(Admin.data.AutoReply.get('welcome.message'));
                    this.focus();
                }
            }
        }, {
            xtype: 'automessage',
            getMessage: function() {
                var data = this.getData();
                data.message = Admin.data.AutoReply.get('welcome.message');
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
                Admin.data.AutoReply.set('welcome.message', me.up().down('textarea').getValue());
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
        }]
    }]
});