/**
 * Created by jhli on 15-12-12.
 */
Ext.define('Admin.store.communication.customerService.Track', {
    extend: 'Admin.store.Base',
    storeId: 'storeTrack',
    alias: 'store.track',
    autoSync: false,
    proxy: {
        type: 'rest',
        url: '/api/track',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    pageSize: 10
    // sorters: [{
    //     property: 'created_at',
    //     direction: 'DESC'
    // }]

});
