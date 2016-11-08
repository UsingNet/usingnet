/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.proxy.Rest', {
    extend: 'Ext.data.Store',
    requires:[
        'Ext.data.proxy.Rest'
    ],
    proxy: {
        type: 'rest',
        url: '/api/rest',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    autoLoad: true,
    autoSync: true
});