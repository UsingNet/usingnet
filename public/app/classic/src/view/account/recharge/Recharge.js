Ext.define('Admin.view.account.recharge.Recharge', {
    extend: 'Ext.container.Container',
    xtype: 'recharge',
    viewModel: {
        type: 'recharge'
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        title: '充值记录',
        emptyText: '<center>暂未有充值记录</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{pay}'
        },
        columns: [{
            text: '时间',
            dataIndex: 'created_at',
            sortable: true,
            flex: 1
        }, {
            text: '方式',
            dataIndex: 'type',
            sortable: true,
            flex: 1,
            renderer: function(value) {
                var map = {
                    ALIPAY: '支付宝',
                    TENPAY: '微信'
                };
                return map[value];
            }
        }, {
            text: '金额',
            dataIndex: 'money',
            sortable: true,
            flex: 1
        }, {
            text: '状态',
            dataIndex: 'status',
            sortable: true,
            flex: 1,
            renderer: function(value, cls, record, index) {
                var map = {
                    INIT: '未支付<a style="float: right;text-decoration: none;color: #666;" target="_black" href="/api/account/pay/to/' + record.data.id + '">去支付</a>',
                    FAIL: '支付失败',
                    SUCCESS: '支付完成'
                };
                return map[value];
            }
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{pay}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }],
    listeners: {
        activate: function() {
            this.down('grid').getStore().reload();
        }
    }
});
