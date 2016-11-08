// add by jhli on 15-12-24
Ext.define('Admin.store.communication.customerService.WorkOrder', {
    extend: 'Ext.data.Store',
    alias: 'store.workorderstore',
    storeId: 'workOrderStore',

    proxy: {
        pageParam: undefined,
        startParam: undefined,
        limitParam: undefined,
        type: 'rest',
        url: '/api/order',
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
        property: '_id',
        direction: 'DESC'
    }],
    autoLoad: true,
    autoSync: true
});