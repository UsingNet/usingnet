/**
 * Created by jhli on 16-02-15.
 */
Ext.define('Admin.store.statistics.Evaluate', {
    extend: 'Admin.store.Base',
    alias: 'store.evaluate',
    storeId: 'evaluatestore',
    proxy: {
        type: 'rest',
        url: '/api/stats/evaluation',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    remoteFilter: true,
    remoteSort: true
});
