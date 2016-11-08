/**
 * Created by jhli on 16-01-25.
 */
Ext.define('Admin.store.statistics.OrderStatistic', {
    extend: 'Admin.store.Base',
    alias: 'store.orderstatistic',
    storeId: 'orderstatistic',
    proxy: {
        type: 'rest',
        url: '/api/stats/order',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    remoteFilter: true,
    remoteSort: true
});
