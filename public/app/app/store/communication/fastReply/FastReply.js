/**
 * Created by jhli on 16-02-04.
 */
Ext.define('Admin.store.communication.fastReply.FastReply', {
    extend: 'Admin.store.Base',
    storeId: 'storefastreply',
    alias: 'store.fastreply',

    model: 'Admin.model.communication.fastReply.FastReply',
    proxy: {
        type: 'rest',
        url: '/api/setting/quick-reply',
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
        property: 'id',
        direction: 'DESC'
    }]
});
