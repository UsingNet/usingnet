/**
 * Created by jhli on 16-01-29.
 */
Ext.define('Admin.view.settings.errorLog.ErrorLogModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.errorlog',
    stores: {
        errorlog: {
            type: 'errorlog',
            autoLoad: true
        }
    },
    data: {}
});
