Ext.define('Admin.view.account.consumption.Consumption', {
    extend: 'Ext.container.Container',
    xtype: 'consumption',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'consumption'
    },
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        title: '消费记录',
        emptyText: '<center>暂未有消费记录</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{bill}'
        },
        // tools: [{
        //     xtype: 'displayfield',
        //     value: 'http://www.usingnet.com?invite=' + Admin.data.User.get('token')
        // }],
        columns: [{
            text: '日期',
            dataIndex: 'created_at',
            sortable: true,
            flex: 1
        }, {
            text: '类型',
            dataIndex: 'type_text',
            sortable: true,
            flex: 1
            // renderer: function(value) {
            //     var map = {
            //         AGENT_VOICE: '客服电话',
            //         AGENT_MAIL: '客服邮件',
            //         TASK_MAIL: '计划邮件',
            //         TASK_SMS: '计划短信',
            //         TASK_VOICE: '计划电话'
            //     };
            //     return map[value];
            // }
        }, {
            text: '消费（元）',
            dataIndex: 'money',
            sortable: true,
            flex: 1
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{bill}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }]
});
