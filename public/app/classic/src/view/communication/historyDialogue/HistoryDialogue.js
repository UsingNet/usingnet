/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.HistoryDialogue', {
    extend: 'Ext.container.Container',
    xtype: 'historydialogue',
    id: 'historydialogue',
    layout: 'fit',
    style: {
        backgroundColor: '#ECF0F5'
    },
    viewModel: {
        type: 'historydialogue'
    },
    items: [{
        xtype: 'grid',
        margin: 20,
        cls: 'shadow',
        title: '历史对话',
        columns: [{
            text: '客户',
            dataIndex: 'contact',
            sorter: 'contact_name',
            width: 160,
            renderer: function(value) {
                return value.remark ? value.remark + '（' + value.name + '）' : value.name;
            }
        }, {
            text: '客服',
            dataIndex: 'user_name',
            width: 120
        }, {
            text: '对话类型',
            dataIndex: 'type',
            width: 100,
            renderer: function(value) {
                var map = {
                    IM: '即时消息',
                    MAIL: '邮件',
                    WECHAT: '微信',
                    SMS: '短信',
                    VOICE: '电话'
                };
                return map[value];
            }
        }, {
            text: '设备',
            sortable: false,
            dataIndex: 'contact',
            flex: 1,
            minWidth: 120,
            renderer: function(value) {
                var userInfo = Admin.view.communication.customerService.singleton.UserAgentLib.parse(value['package'].user_agent);
                return userInfo.browser.family + '&nbsp;&nbsp;&nbsp;' + userInfo.os;
            }
        }, {
            text: '地区',
            sortable: false,
            dataIndex: 'contact',
            flex: 1,
            minWidth: 100,
            renderer: function(value) {
                return value['package'].address ? value['package'].address : '未知地区';
            }
        }, {
            text: '对话开始时间',
            dataIndex: 'created_at',
            width: 160
        }, {
            text: '对话结束时间',
            dataIndex: 'updated_at',
            width: 160
        }, {
            text: '对话时长',
            dataIndex: 'time',
            width: 160
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            width: 100,
            items: [{
                iconCls: 'x-fa fa-comment',
                tooltip: '发起对话',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    if ('1' != Ext.util.Cookies.get('online')) {
                        Ext.Msg.alert('错误', '您目前处于离线状态，不能发起对话！');
                        return;
                    }
                    Ext.Ajax.request({
                        url: '/api/order/restore',
                        method: 'POST',
                        jsonData: {
                            status: 'OPEN',
                            id: rec.data.id
                        },
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            location.hash = '#customerservice';
                            Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load(function(records, operation, success) {
                                var father = Ext.getCmp('treelist');
                                father.select(father.items.getAt(0));
                            });

                        },
                        failure: function() {
                            Ext.Msg.alert('错误', '服务器错误。');
                        }
                    });
                }
            }, {
                iconCls: 'x-fa fa-eye',
                tooltip: '查看聊天记录',
                handler: function(tableview, rowIndex, columnIndex, action, event, record, rowDom) {
                    var title = '客服&nbsp;' + record.data.user.name + '&nbsp;与客户&nbsp;' + record.data.contact.name + '&nbsp;的对话'
                    Ext.create('Admin.view.communication.historyDialogue.ChatRecordWin', {
                        customData: {
                            order_id: record.id,
                            metaData: record.data
                        },
                        listeners: {
                            beforerender: function() {
                                this.setTitle(title);
                            }
                        }
                    });
                }
            }]
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            //bind: {
            //    store: '{historydialogue}'
            //},
            dock: 'bottom',
            displayInfo: true
        }],
        listeners: {
            beforerender: function() {
                var me = this;
                Ext.getCmp('treelist').on('orderremoved', function() {
                    me.getStore().load();
                });
            },
            afterrender: function() {
                var config = {};
                if ('MEMBER' === Admin.data.User.get('role')) {
                    config.filters = [{
                        property: 'user_id',
                        value: Admin.data.User.get('id')
                    }];
                    config.remoteFilter = true;
                }
                var store = Ext.create('Admin.store.communication.historyDialogue.HistoryDialogue', config);
                this.setStore(store);
                this.down('pagingtoolbar').setStore(store);
            }
        }
    }]
});
