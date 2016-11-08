/**
 * Created by jhli on 16-2-25.
 */
Ext.define('Admin.store.communication.historyDialogue.HistoryChatRecord', {
    extend: 'Admin.store.Base',
    alias: 'store.historychatrecord',
    storeId: 'historychatrecordstore',

    pageSize: 20,
    proxy: {
        type: 'rest',
        url: '/api/message',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json'
        }
    }
});