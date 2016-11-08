/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.dashboard.TaskList', {
    extend: 'Admin.store.Base',
    storeId: 'storeTaskList',
    alias: 'store.tasklist',

    proxy: {
        pageParam: undefined,
		startParam: undefined,
		limitParam: undefined,
        type: 'rest',
        url: '/api/tasklist',
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
