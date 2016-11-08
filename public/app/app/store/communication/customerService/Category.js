/**
 * Created by jhli on 16-01-11.
 */
Ext.define('Admin.store.communication.customerService.Category', {
    extend: 'Admin.store.Base',
    storeId: 'storeCategory',
    alias: 'store.category',
    proxy: {
        type: 'rest',
        url: '/api/order/category',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    pageSize: 10,
    sorters: [{
        property: 'id',
        direction: 'DESC'
    }]

});
