Ext.define('Admin.view.communication.customerService.customerInfo.UserDefinedInfo', {
    extend: 'Ext.panel.Panel',
    xtype: 'userdefinedinfo',
    title: '客户自定义信息',
    id: 'lijiahong',
    tbar: [{
        xtype: 'displayfield',
        width: '100%',
        value: '从左侧列表选择客户',
        fieldStyle: 'color: #818181;',
        style: {
            textAlign: 'center',
            marginTop: '390px'
        }
    }],
    padding: 10,
    listeners: {
        workordernodechange: function(me, tabFather, workorderpanel, newNode, oldNode) {
            if (!Admin.data.Permission.get('chat.customerInfo.status')) {
                me.setDisabled(true);
                return;
            }
            var order = newNode.workOrder;
            var html = order.contact['package'].html;
            if (html) {
                me.setHtml(html);
                me.setDisabled(false);
            } else {
                me.setDisabled(true);
            }
        }
    }
});
