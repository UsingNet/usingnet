/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.store.task.Task', {
    extend: 'Admin.store.Base',
    alias: 'store.task',
    storeId: 'taskStore',
    model: 'Admin.model.task.Task',
    proxy: {
        type: 'rest',
        url: '/api/task',
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
