/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.statistics.Access', {
    extend: 'Admin.store.Base',
    alias: 'store.access',
    model: 'Admin.model.statistics.Access',
    storeId: 'accessStore',
    proxy: {
        type: 'rest',
        url: '/api/stats/visit',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }

    },
    remoteFilter: true,
    remoteSort: true
});
