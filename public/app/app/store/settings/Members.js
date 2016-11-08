/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.store.settings.Members', {
    extend: 'Admin.store.Base',

    alias: 'store.members',

    model: 'Admin.model.Member',
    storeId: 'memberStore',

    proxy: {
        type: 'rest',
        url: '/api/member',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json'
        }
    },
    sorters: [{
        property: 'id',
        direction: 'DESC'
    }],

    autoLoad: true,
    autoSync: true
});
