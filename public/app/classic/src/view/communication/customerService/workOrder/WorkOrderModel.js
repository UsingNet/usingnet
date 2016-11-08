// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.workOrder.WorkOrderModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.workordermodel',
    stores: {
        workorderstore: {
            type: 'workorderstore',
            autoLoad: true
        },
        workordertreeliststore: {
            type: 'workordertreeliststore'
        },
        category: {
            type: 'category'
        }
    },
    data: {}
});
