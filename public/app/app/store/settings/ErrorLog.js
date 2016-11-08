/**
 * Created by henry on 16-02-01.
 */
Ext.define('Admin.store.settings.ErrorLog', {
    extend: 'Admin.store.Base',
    alias: 'store.errorlog',
    storeId: 'errorlogstore',
    proxy: {
        type: 'rest',
        url: '/api/customlog',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    sorters: [{
        property: '_id',
        direction: 'DESC'
    }],
    autoLoad: true,
    autoSync: true
});
