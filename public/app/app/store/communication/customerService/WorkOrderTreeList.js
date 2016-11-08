// add by jhli on 15-12-24
Ext.define('Admin.store.communication.customerService.WorkOrderTreeList', {
    extend: 'Ext.data.TreeStore',

    storeId: 'workOrderTreeListStore',
    alias: 'store.workordertreeliststore',
    root: {
        expanded: true,
        children: []
    },
    listeners: {
        add: 'workOrderTreeListInserted'
    }
});
