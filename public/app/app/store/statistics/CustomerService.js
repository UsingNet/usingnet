/**
 * Created by jhli on 16-01-15.
 */
Ext.define('Admin.store.statistics.CustomerService', {
    extend: 'Admin.store.Base',
    alias: 'store.customerservice',
    storeId: 'customerServiceStatis',
    proxy: {
        type: 'rest',
        url: '/api/stats/agent',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }

    }
});
