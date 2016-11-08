Ext.define('Admin.view.access.plugin.PluginModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.plugin',

    stores: {
        plugin: {
            type: 'plugin'
        },
        orderForm: {
            type: 'orderForm'
        }
    },
    data: {}
});
