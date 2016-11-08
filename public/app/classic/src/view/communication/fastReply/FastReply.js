Ext.define('Admin.view.communication.fastReply.FastReply', {
    extend: 'Ext.container.Container',
    xtype: 'fastreply',
    scrollable: true,
    viewModel: {
        type: 'fastreply'
    },
    layout: 'fit',
    items: [{
        xtype: 'grid',
        title: '快捷回复',
        empty: '<center>还没有设置快捷回复。</center>',
        cls: 'shadow',
        margin: 20,
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{fastreply}'
        },
        columns: [{
            xtype: 'rownumberer'
        }, {
            text: '内容',
            dataIndex: 'content',
            flex: 2,
            sortable: true,
            editor: 'textfield'
        }, {
            text: '更新时间',
            dataIndex: 'updated_at',
            flex: 1,
            sortable: true
        }, {
            text: '创建时间',
            dataIndex: 'created_at',
            flex: 1,
            sortable: true
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            flex: 1,
            items: [{
                iconCls: 'x-fa fa-edit',
                tooltip: '编辑',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    Ext.create('Admin.view.communication.fastReply.widgets.FastReplyEditor', {
                        metadata: {
                            record: rec,
                            store: grid.getStore()
                        }
                    });
                    // this.ownerCt.up().plugins[0].startEdit(rec, 0);
                }
            }, {
                iconCls: 'x-fa fa-times-circle',
                tooltip: '删除',
                handler: function(grid, rowIndex, colIndex) {
                    Ext.Msg.confirm('删除', '确定要删除此快捷回复吗?', function(btnId) {
                        if ('yes' === btnId) {
                            var store = grid.getStore();
                            var rec = grid.getStore().getAt(rowIndex);
                            store.remove(rec);
                        }
                    });
                }
            }]
        }],
        tools: [{
            xtype: 'button',
            //text: '添加',
            iconCls: 'x-fa fa-plus',
            ui: 'soft-green',
            handler: function() {
                var grid = this.up('grid');
                // var model = Ext.create('Admin.model.communication.fastReply.FastReply');
                // grid.store.setAutoSync(false);
                // var records = grid.store.insert(0, [model]);
                // grid.store.setAutoSync(true);
                // grid.plugins[0].startEdit(records[0], 0);
                Ext.create('Admin.view.communication.fastReply.widgets.FastReplyEditor', {
                    metadata: {
                        store: grid.store
                    }
                });
            }
        }],
        listeners: {
            celldblclick: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                if (1 === cellIndex) {
                    Ext.create('Admin.view.communication.fastReply.widgets.FastReplyEditor', {
                        metadata: {
                            record: record,
                            store: grid.getStore()
                        }
                    });
                }
            }
        }
        // plugins: [{
        //     ptype: 'rowediting',
        //     clicksToEdit: 2,
        //     listeners: {
        //         cancelEdit: function(rowEditing, context) {
        //             if (context.record.phantom) {
        //                 rowEditing.grid.store.remove(context.record);
        //             }
        //         }
        //     }
        // }]
    }]
});
