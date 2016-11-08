Ext.define('Admin.view.dashboard2.widgets.OnlineVisitors', {
    extend: 'Ext.panel.Panel',
    xtype: 'onlinevisitors',
    title: '在线访客',
    flex: 1,
    layout: 'fit',
    items: [{
        xtype: 'grid',
        header: false,
        hideHeaders: true,
        viewConfig: {
            enableTextSelection: true
        },
        columns: [{
            dataIndex: 'name',
            flex: 1
        }, {
            dataIndex: 'count',
            flex: 4,
            renderer: function(value, meta, record) {
                return '<a target="_blank" style="text-decoration: none; color: #000; cursou： pointer;" href="' + record.data.url + '">' + record.data.title + '</a>';
            }
        }, {
            xtype: 'actioncolumn',
            flex: 1,
            align: 'center',
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
                        url: '/api/order/launch',
                        method: 'POST',
                        jsonData: {
                            contact_id: rec.data.contact_id,
                            user_info: rec.data.user_info,
                            track_id: rec.data.track_id,
                            ip: rec.data.ip
                        },
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            location.hash = '#customerservice';
                            Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load(function(records, opearation, success) {
                                var father = Ext.getCmp('treelist');
                                father.select(father.items.getAt(0));
                            });
                        },
                        failure: function() {
                            Ext.Msg.alert('错误', '服务器错误。');
                        }
                    });
                }
            }]
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('onlineready', function() {
                var res = this.get('online');
                var store = Ext.create('Ext.data.Store', {
                    data: res
                });
                me.down('grid').setStore(store);
            });
        }
    }
});
