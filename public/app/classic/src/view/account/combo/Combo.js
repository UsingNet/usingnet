Ext.define('Admin.view.account.combo.Combo', {
    extend: 'Ext.container.Container',
    xtype: 'usingnetcombo',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    controller: 'combo',
    items: [{
        xtype: 'usingnetcurrentcombo',
        margin: 20
    }, {
        xtype: 'usingnetmodifycombo',
        flex: 1,
        margin: '0 20 20 20'
    }]
});
