/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.Sms', {
    extend: 'Ext.container.Container',
    xtype: 'media-sms',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'sms'
    },
    // margin: 20,
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        id: 'smsGrid',
        title: '短信',
        emptyText: '<center>暂未添加短信</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        //minHeight: 500,
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{sms}'
        },
        //padding: '5 0 0 0',
        tools: [{
            xtype: 'button',
            text: '增加免审模板',
            ui: 'soft-green',
            iconCls: 'x-fa fa-plus',
            id: 'addSmsFromPoll',
            handler: function() {
                var me = this;
                Ext.create('Admin.view.media.widget.SmsPollDialog', {
                    animateTarget: 'addSmsFromPoll',
                    listeners: {
                        close: function() {
                            me.up('grid').store.reload();
                        }
                    }
                });
            }
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'button',
            text: '增加自定义模板',
            id: 'addSmsBtn',
            iconCls: 'x-fa fa-plus',
            ui: 'soft-green',
            handler: function() {
                Ext.create('Admin.view.media.widget.SmsEditor', {
                    animateTarget: 'addSmsBtn'
                });
            }
        }],
        columns: [{
                xtype: 'rownumberer'
            }, {
                text: '标题',
                dataIndex: 'title',
                sortable: true,
                flex: 2
            }, {
                text: '内容',
                dataIndex: 'content',
                sortable: true,
                flex: 6
            },
            /*{
                text: '发送',
                dataIndex: 'sent',
                flex: 1
            },*/
            {
                text: '状态',
                dataIndex: 'status',
                flex: 1,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                    var map = {
                        CHECKING: '审核中',
                        FAIL: '驳回',
                        SUCCESS: '通过'
                    };
                    return map[value];
                }
            }, {
                text: '操作',
                flex: 1,
                align: 'center',
                xtype: 'actioncolumn',
                items: [{
                    iconCls: 'action-x-fa x-fa fa-pencil-square-o',
                    tooltip: '编辑',
                    handler: function(grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        Ext.create('Admin.view.media.widget.SmsEditor', {
                            title: '编辑短信',
                            isForEdit: true,
                            recordToEdit: rec
                        });
                        Ext.getCmp('smsForm').getForm().findField('smsTitle').setValue(rec.data.title);
                        Ext.getCmp('smsForm').getForm().findField('smsContent').setValue(rec.data.content);
                    }
                }, {
                    iconCls: 'action-x-fa x-fa fa-trash-o',
                    margin: '0 0 0 10',
                    tooltip: '删除',
                    handler: function(grid, rowIndex, colIndex) {
                        Ext.Msg.confirm('删除短信', '确定删除这一条数据?', function(btnId) {
                            if ('yes' === btnId) {
                                var rec = grid.getStore().getAt(rowIndex);
                                Ext.data.StoreManager.lookup('storeSms').remove(rec);
                            }
                        });
                    }
                }]
            }
        ],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{sms}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }],
    listeners: {
        activate: function() {
            var status = Admin.data.Permission.get('media.status')
            if (!status) {
                this.down('grid').setDisabled(true);
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用短信模版功能！');
            }

        }
    }
});
