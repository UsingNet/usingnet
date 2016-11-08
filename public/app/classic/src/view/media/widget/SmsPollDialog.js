/**
 * Created by henry on 16-1-4.
 */
Ext.define('Admin.view.media.widget.SmsPollDialog',{
    extend:'Ext.window.Window',
    title: '添加免审模板',
    closable: true,
    autoShow: true,
    modal: true,
    width:900,
    viewModel: {
        type: 'sms'
    },
    items:[{
        xtype:'grid',
        minHeight:400,
        bind:{
          store:'{mediaSmsPoll}'
        },
        columns: [
            { text: '标题', dataIndex: 'title' },
            { text: '内容', dataIndex: 'content', flex: 1 },
            { text: '已添加', xtype: 'booleancolumn', dataIndex: 'used', trueText: '已添加', falseText: '-'},
            { xtype:'actioncolumn',  text: '操作', align: 'center', items: [{
                    iconCls: 'action-x-fa x-fa fa-plus',
                    tooltip: '添加',

                    handler: function (grid, rowIndex, colIndex) {
                        var record = grid.getStore().getAt(rowIndex);
                        var smsStore = Ext.data.StoreManager.lookup('storeSms');
                        smsStore.addSystemTpl(record.data.id, {
                            success:function(data){
                                grid.store.reload();
                            },
                            failure:function(data){
                                Ext.Msg.alert("错误", data.msg?data.msg:'服务器错误, 请稍后重试');
                            }
                        });
                    },
                    isDisabled: function(tableView, row, colum, button, record) {
                        return record.data.used;
                    }
                }
            ]}
        ],
        dockedItems: [
            {
                xtype: 'pagingtoolbar',
                bind: {
                    store: '{mediaSmsPoll}'
                },
                dock: 'bottom',
                displayInfo: true
            }
        ]
    }]
});