Ext.define('Admin.view.communication.customerService.customerInfo.CustomerIframe', {
    extend: 'Ext.panel.Panel',
    xtype: 'customeriframe',
    title: '客服插件',
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
            var iframe = order.contact.iframe;
            if (iframe) {
                me.setDisabled(false);
                me.setHtml('<iframe src="//' + location.hostname + '/api/proxy?url=' + encodeURIComponent(iframe) + '" style="width: 100%; height: 100%;"></iframe>');
            } else {
                me.setDisabled(true);
            }
        }
    }
});
