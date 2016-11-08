Ext.define('Admin.view.dashboard2.Dashboard2', {
    extend: 'Ext.container.Container',
    xtype: 'dashboard2',
    id: 'dashboard2',
    padding: 20,
    minWidth: 1200,
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        height: 400,
        bodyStyle: 'background: transparent;',
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    },
    items: [{
        xtype: 'lumps',
        height: 130
    }, {
        items: [{
            xtype: 'loadofservice',
            flex: 3
        }, {
            xtype: 'regionstatistics',
            margin: '0 0 0 20',
            flex: 2
        }],
        margin: '20 0 0 0'
    }, {
        items: [{
            xtype: 'ordertendency',
            flex: 3
        }, {
            xtype: 'tagstatistics',
            margin: '0 0 0 20',
            flex: 2
        }],
        margin: '20 0 0 0'
    }, {
        items: [{
            xtype: 'ongoingdialogue',
            flex: 3
        }, {
            // xtype: 'visitorsource',
            xtype: 'onlinevisitors',
            margin: '0 0 0 20',
            flex: 2
        }],
        margin: '20 0 0 0'
    }],
    listeners: {
        afterrender: function () {
            Admin.data.Dashboard.fireEvent('init');
        },
        activate: function() {
            Admin.data.Dashboard.fireEvent('realtimedata');
        }
    }
});
