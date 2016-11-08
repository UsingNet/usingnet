/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.store.communication.historyDialogue.HistoryDialogue', {
    extend: 'Admin.store.Base',
    alias: 'store.historydialogue',
    storeId: 'historydialoguestore',

    proxy: {
        type: 'rest',
        url: '/api/order/history',
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