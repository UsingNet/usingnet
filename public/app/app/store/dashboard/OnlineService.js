/**
 * Created by jhli on 15-12-12.
 */
Ext.define('Admin.store.dashboard.OnlineService', {
    extend: 'Admin.store.Base',
    storeId: 'storeOnlineService',
    alias: 'store.onlineservice',

    proxy: {
        pageParam: undefined,
		startParam: undefined,
		limitParam: undefined,
        type: 'rest',
        url: '/api/online',
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
    }]

});
