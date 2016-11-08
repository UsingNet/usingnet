// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.CustomerService', {
    extend: 'Ext.container.Container',
    xtype: 'customerservice',
    scrollable: true,
    layout: 'hbox',
    padding: 20,
    items: [{
        xtype: 'workordertab',
        width: 240
    }, {
        xtype: 'chatpanel',
        flex: 1,
        margin: '0 0 0 10'
    }, {
        xtype: 'customerinfopanel',
        width: 300,
        margin: '0 0 0 10'
    }],
    listeners: {
        render: function() {
            this.sendWithCtrl = Admin.data.User.get('extend.sendWithCtrl');
            this.sendWithCtrl = !!this.sendWithCtrl;
        },
        activate: function(me) {
            me.down('workordertab').setActiveTab(0);
        }
    }
});
