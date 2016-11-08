/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.Contact', {
    extend: 'Admin.store.Base',
    alias: 'store.contacts',
    model: 'Admin.model.Contact',
    storeId: 'contactStore',
    proxy: {
        type: 'rest',
        url: '/api/contact',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json'
        }
    },
    sorters: [{
        property: 'extend_id',
        direction: 'DESC'
    }, {
        property: 'created_at',
        direction: 'DESC'
    }],
    remoteSort: true
});
