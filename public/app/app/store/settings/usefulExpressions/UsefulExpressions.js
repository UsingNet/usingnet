/**
 * Created by jhli on 16-3-21.
 */
Ext.define('Admin.store.settings.usefulExpressions.UsefulExpressions', {
    extend: 'Admin.store.Base',
    storeId: 'storeusefulexpressions',
    alias: 'store.usefulexpressions',

    model: 'Admin.model.settings.usefulExpressions.UsefulExpressions',
    proxy: {
        type: 'rest',
        url: '/api/setting/phrase',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        },
        writer: {
            type: 'json'
        }
    },
    sorters: [{
        property: 'id',
        direction: 'DESC'
    }]
});