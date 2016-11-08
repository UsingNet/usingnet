// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.chat.ChatController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.chatcontroller',
    chatpanelAdd: function(chatWin, component, index, eOpts) {
        var items = component.items.items;
        for (var i = 0; i < items.length; i++) {
            this.readEventHandler(component, items[i]);
        }
        component.on('add', this.readEventHandler, this);

    },

    chatpanelRemove: function(chatWin, component, eOpts) {
        component.un('add', this.readEventHandler, this);
    },
    readEventHandler: function(chatpanel, item, index) {
        if (item.metaData.direction == 'RECEIVE' && item.metaData['package'] && !item.metaData['package'].read) {
            chatpanel.WebSocket.send({
                action: 'read',
                _id: item.metaData._id
            });
        }
    },
    chatWinResize: function(chatWin, width, height) {
        var child = chatWin.items.getAt(0);
        if (child) {
            child.setHeight(height - 10);
        }
    },
    sendTypeChange: function(button, newValue, name, oldValue, ischangeorder) {
        var editorMap = {
            IM: 'imeditor',
            MAIL: 'maileditor',
            WECHAT: 'wechateditor',
            SMS: 'smseditor',
            VOICE: 'voiceeditor'
        };
        var panel = button.up('panel');
        var workorderpanel = button.up('customerservice').down('workorderpanel');
        var selection = workorderpanel.getSelection();
        if (!selection.editorStore) {
            selection.editorStore = {};
        }
        if (newValue) {
            button.workOrder.type = newValue;
            button.setText(name);
            button.value = newValue;
        }
        if (panel.items.getAt(0)) {
            if (panel.items.length) {
                var node = ischangeorder ? workorderpanel.oldSelected : selection;
                if (node) {
                    if (!node.editorStore) {
                        node.editorStore = {};
                    }
                    node.editorStore[oldValue] = panel.remove(panel.items.getAt(0), false);
                } else {
                    panel.remove(panel.items.getAt(0), false);
                }

            }
        }
        if (newValue) {
            panel.add(selection.editorStore[newValue] ? selection.editorStore[newValue] : {
                xtype: editorMap[newValue]
            });
        }
    },
    transferOrder: function(selection, user_id) {
        var url = '/api/order/shift';
        Ext.Ajax.request({
            url: url,
            method: 'POST',
            params: {
                type: selection.workOrder.type,
                id: selection.workOrder.id,
                user_id: user_id
            },
            success: function(response) {
                var treelist = Ext.getCmp('treelist');
                var selection = treelist.getSelection();

                if ('VOICE' === selection.workOrder.type) {
                    Admin.data.AgentPhone.setAgentReady();
                    var voiceeditor = selection.workOrderChatPanel.up('chatpanel').down('voiceeditor');
                    voiceeditor.fireEvent('normalstate');
                }
                treelist.remove(selection);
                if (selection.workOrderChatPanel.WebSocket) {
                    selection.workOrderChatPanel.WebSocket.close();
                }
                var root = treelist.items.getAt(0);
                if (root) {
                    treelist.select(root);
                }
            },
            failure: function(response) {
                Ext.Msg.alert('错误', '服务器错误，转接工单失败！');
            }
        });
    }
});
