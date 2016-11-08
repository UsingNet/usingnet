Ext.define('Admin.view.communication.customerService.editor.WeChatEditor', {
    extend: 'Admin.view.communication.customerService.editor.BaseEditor',
    xtype: 'wechateditor',

    flex: 1,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'textarea',
        enableKeyEvents: true,
        //id: 'messageEditor',
        fieldLabel: '内容',
        labelWidth: 59,
        width: '100%',
        flex: 1,
        listeners: {
            change: function(textarea, newValue, oldValue, eOpts) {
                var workOrderChatPanel = Ext.getCmp('treelist').getSelection().workOrderChatPanel;
                var webSocket = workOrderChatPanel.WebSocket;
                if (webSocket.alive) {
                    webSocket.send({
                        action: 'typing',
                        message: newValue
                    });
                }
                if(workOrderChatPanel.lastMessage) {
                    workOrderChatPanel.lastMessage.lastTypingTime = parseInt(Date.parse(new Date()) / 1000);
                }
            }
        }
    }],
    dockedItems: {
        xtype: 'toolbar',
        dock: 'bottom',
        padding: '0 0 0 64',
        items: [{
            xtype: 'facetool'
        }, {
            xtype: 'imagetool'
        },
        // {
        //     xtype: 'linktool'
        // },
        {
            xtype: 'wikitool'
        }, {
            xtype: 'widgetfastreply'
        }, {
            xtype: 'usefulexpressionscombo'
        }, '->', {
            xtype: 'sendbtn'
        }]
    }

});
