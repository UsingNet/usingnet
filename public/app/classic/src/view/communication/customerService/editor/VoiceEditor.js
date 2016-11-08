Ext.define('Admin.view.communication.customerService.editor.VoiceEditor', {
    extend: 'Ext.panel.Panel',
    xtype: 'voiceeditor',
    height: 150,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'textarea',
        fieldLabel: '备注',
        labelWidth: 59,
        flex: 1
    }, {
        xtype: 'panel',
        width: 150,
        layout: {
            type: 'vbox',
            pack: 'center',
            align: 'center'
        },
        items: [{
            xtype: 'tbtext',
            itemId: 'text',
            hidden: true,
            margin: 10
        }, {
            xtype: 'button',
            itemId: 'call',
            text: '呼叫',
            width: 50,
            height: 50,
            margin: 10,
            ui: 'soft-green',
            style: {
                borderRadius: '50%'
            },
            handler: function() {
                var node = Ext.getCmp('treelist').getSelection();
                Admin.data.AgentPhone.setOrder(node);
                var customerPhone = node.workOrder.contact.phone;
                var displayNumber = Admin.data.Team.get('voip') ? Admin.data.Team.get('voip')['bind_number'] : '';
                if (displayNumber) {
                    Cloopen.invitetel(customerPhone, displayNumber);
                } else {
                    Cloopen.invitetel(customerPhone);
                }
            }
        }, {
            xtype: 'button',
            itemId: 'hangup',
            hidden: true,
            text: '挂断',
            width: 50,
            height: 50,
            margin: 10,
            ui: 'soft-red',
            style: {
                borderRadius: '50%'
            },
            handler: function() {
                Cloopen.bye();
            }
        }, {
            xtype: 'button',
            text: '保存备注',
            margin: 10,
            handler: function() {
                var textarea = this.up('voiceeditor').down('textarea');
                var workOrder = this.up('chatpanel').down('workorderchatpanel').workOrder;
                if (!textarea.value) {
                    return;
                }
                var note = textarea.getValue();
                textarea.setValue('');
                Ext.Ajax.request({
                    url: '/api/message/agent',
                    method: 'POST',
                    jsonData: Ext.JSON.encode({
                        type: 'NOTE',
                        to: workOrder.contact.id,
                        // to: (workOrder.contact ? workOrder.contact.id : null) || workOrder.to,
                        // to: workOrder.id,
                        body: note
                    }),
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (!res.success) {
                            Ext.Msg.alert('错误', res.msg);
                            textarea.setValue(note);
                        }
                    },
                    failure: function() {
                        Ext.Msg.alert('错误', '服务器错误。');
                        textarea.setValue(note);
                    }
                });

            }
        }]
    }],
    listeners: {
        callingout: function() {
            Ext.getCmp('onlineswitch').isOnPhone = true;
            this.up('chatpanel').down('workorderchatpanel').workOrderComponent.isOnPhone = true;
            var panel = this.items.getAt(1);
            panel.items.each(function(item) {
                item.show();
            });
            panel.down('#call').hide();
            panel.down('#text').setText('正在呼叫...');
        },
        talking: function() {

            if ('#customerservice' != location.hash) {
                location.hash = '#customerservice';
            }
            Ext.getCmp('onlineswitch').isOnPhone = true;
            this.up('chatpanel').down('workorderchatpanel').workOrderComponent.isOnPhone = true;
            var startTime = Date.parse(new Date());
            var panel = this.items.getAt(1);
            panel.items.each(function(item) {
                item.show();
            });

            this.intervalId = setInterval(function() {
                panel.down('#text').setText(Admin.data.Tools.CustomTools.timeCounting(startTime));
            }, 1000);


            panel.down('#call').hide();

        },
        normalstate: function() {
            Ext.getCmp('onlineswitch').isOnPhone = false;
            this.up('chatpanel').down('workorderchatpanel').workOrderComponent.isOnPhone = false;
            var panel = this.items.getAt(1);
            panel.items.each(function(item) {
                item.show();
            });
            Admin.data.AgentPhone.setAgentReady();
            Admin.data.AgentPhone.clearOrder();
            clearInterval(this.intervalId);
            panel.down('#text').hide();
            panel.down('#text').setText('通话中: 00:00:00');
            panel.down('#hangup').hide();
        },
        afterrender: function() {
            var value = Ext.getCmp('treelist').getSelection().workOrder.note;
            this.down('textarea').setValue(value);
        }
    }
});
