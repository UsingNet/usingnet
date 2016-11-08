Ext.define('Admin.view.dashboard2.widgets.OngoingDialogue', {
    extend: 'Ext.panel.Panel',
    xtype: 'ongoingdialogue',
    flex: 1,
    layout: 'fit',
    items: [{
        xtype: 'grid',
        title: '进行中的对话',
        scrollable: true,
        columns: [{
            xtype: 'rownumberer'
        }, {
            text: '客户',
            dataIndex: 'contact',
            sortable: false,
            renderer: function(value) {
                return (value && value['name']) ? value['name'] : '未知';
            },
            flex: 1
        }, {
            text: '方式',
            dataIndex: 'type',
            sortable: false,
            renderer: function(value) {
                return {
                    'IM': '即时对话',
                    'WECHAT': '微信',
                    'SMS': '短信',
                    'MAIL': '电子邮件',
                    'VOICE': '语音',
                    'LM': '留言'
                }[value];
            }
        }, {
            text: '客服',
            dataIndex: 'user',
            sortable: false,
            // sorter: function(record1, record2) {
            //     var name1 = record1.data.user.name,
            //         name2 = record2.data.user.name;
            //     return name1 > name2 ? 0 : 1;
            // },
            renderer: function(value) {
                return (value && value['name']) ? value['name'] : '未知';
            },
            flex: 1
        }, {
            text: '开始时间',
            dataIndex: 'created_at',
            flex: 1
        }, {
            text: '持续时间',
            sortable: false,
            dataIndex: 'time',
            flex: 1
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('agentready', function() {
                var data = this.get('agent.orders');
                var store = Ext.create('Ext.data.Store', {
                    data: data,
                    remoteSort: true
                });
                me.down('grid').setStore(store);
            });
        }
    }
});
