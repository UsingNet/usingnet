/**
 * Created by jhli on 16-3-21.
 */
Ext.define('Admin.view.settings.usefulExpressions.UsefulExpressionsModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.usefulexpressions',
    stores: {
        usefulexpressions: {
            type: 'usefulexpressions'
        }
    },
    data: {}
});