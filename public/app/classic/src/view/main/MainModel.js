Ext.define('Admin.view.main.MainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.main',

    stores: {
        notices: {
            type: 'notices'
        }
    },

    data: {
        currentView: null
    }
});
