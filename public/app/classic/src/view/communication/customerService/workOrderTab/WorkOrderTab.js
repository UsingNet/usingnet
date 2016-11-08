Ext.define('Admin.view.communication.customerService.workOrderTab.WorkOrderTab', {
    extend: 'Ext.tab.Panel',
    xtype: 'workordertab',
    activeTab: 0,
    title: '工单列表',
    tabPosition: 'left',
    layout: 'fit',
    height: '100%',
    items: [{
        xtype: 'workorderpanel'
    }, {
        xtype: 'timingorderspanel'
    }]
});