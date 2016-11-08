/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.Voice', {
    extend: 'Ext.container.Container',
    xtype: 'media-voice',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'voice'
    },
    // margin: 20,
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        id: 'voiceGrid',
        title: '录音',
        emptyText: '<center>暂未添加录音</center>',
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
            store: '{voice}'
        },
        //padding: '5 0 0 0',
        tools: [{
            xtype: 'button',
            text: '增加',
            ui: 'soft-green',
            iconCls: 'x-fa fa-plus',
            handler: function() {
                Ext.create('Admin.view.media.widget.VoiceUpload');
            }
        }],
        columns: [{
                xtype: 'rownumberer'
            }, {
                text: '标题',
                dataIndex: 'title',
                sortable: true,
                flex: 1
            }, {
                text: '链接',
                dataIndex: 'content',
                width: '45%',
                sortable: true
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
                        FAIL: '审核不通过',
                        SUCCESS: '审核通过'
                    };
                    return map[value];
                }
            }, {
                text: '操作',
                flex: 1,
                align: 'center',
                xtype: 'actioncolumn',
                items: [
                    //{
                    //    iconCls: 'action-x-fa x-fa fa-pencil-square-o',
                    //    tooltip: '编辑',
                    //    handler: function (grid, rowIndex, colIndex) {
                    //
                    //    }
                    //},
                    {
                        iconCls: 'action-x-fa x-fa fa-trash-o',
                        margin: '0 0 0 10',
                        tooltip: '删除',
                        handler: function(grid, rowIndex, colIndex) {
                            Ext.Msg.confirm('删除录音', '确定删除这一条录音?', function(btnId) {
                                if ('yes' === btnId) {
                                    var rec = grid.getStore().getAt(rowIndex);
                                    Ext.data.StoreManager.lookup('storeVoice').remove(rec);
                                }
                            });
                        }
                    }
                ]
            }
        ],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{voice}'
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
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用录音功能！');
            }

        }
    }
});
