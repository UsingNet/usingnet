Ext.define('Admin.view.communication.customerService.customerInfo.CustomerInfo', {
    extend: 'Ext.tab.Panel',
    xtype: 'customerinfopanel',
    height: '100%',
    title: '客户信息',
    activeTab: 0,
    tabPosition: 'right',
    items: [{
        xtype: 'customerbasic'
    }, {
        xtype: 'userdefinedinfo'
    }, {
        xtype: 'customeriframe'
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            var workOrderPanel = me.up('customerservice').down('workorderpanel');
            workOrderPanel.on('change', function(workorderpanel, newNode, oldNode, e) {
                var toolbars = me.query('toolbar'),
                    tabs = me.query('panel');
                if (!newNode) {
                    tabs.forEach(function(tab) {
                        tab.setHtml('');
                        tab.setDisabled(false);
                        tab.down('toolbar').show();
                    });
                } else {
                    toolbars.forEach(function(toolbar) {
                        toolbar.hide();
                    });
                    me.items.each(function(item, index, length) {
                        item.fireEvent('workordernodechange', item, me, workorderpanel, newNode, oldNode);
                    });
                }
            });
        }
    }
});
