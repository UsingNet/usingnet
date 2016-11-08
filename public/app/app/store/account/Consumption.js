/**
 * Created by jhli on 16-01-22.
 */
Ext.define('Admin.store.account.Consumption', {
    extend: 'Admin.store.Base',
    storeId: 'storeConsumption',
    alias: 'store.consumption',

    proxy: {
        type: 'rest',
        url: '/api/account/bill',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        }
    },

    sorters: [{
        property: 'id',
        direction: 'DESC'
    }]
});
