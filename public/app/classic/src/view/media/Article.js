/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.Article', {
    extend: 'Ext.container.Container',
    xtype: 'media-article',
    scrollable: true,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'article'
    },
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        id: 'articleGrid',
        title: '邮件模板',
        emptyText: '<center>暂未添加邮件模板</center>',
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
            store: '{article}'
        },
        //padding: '5 0 0 0',
        tools: [
            {
                xtype: 'button',
                text: '增加',
                iconCls: 'x-fa fa-plus',
                ui: 'soft-green',
                id: 'addArticleBtn',
                handler: function() {
                    Ext.create('Admin.view.media.widget.ArticleEditor', {
                        animateTarget: 'addArticleBtn'
                    });
                }
            }
        ],
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
            flex: 8
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
                    Ext.create('Admin.view.media.widget.ArticleEditor', {
                        title: '编辑模板',
                        isForEdit: true,
                        recordToEdit: rec
                    });
                    Ext.getCmp('articleForm').getForm().findField('title').setValue(rec.data.title);
                    Ext.getCmp('articleForm').getForm().findField('text').setValue(rec.data.content);
                }
            }, {
                iconCls: 'action-x-fa x-fa fa-trash-o',
                margin: '0 0 0 10',
                tooltip: '删除',
                handler: function(grid, rowIndex, colIndex) {
                    Ext.Msg.confirm('删除模板', '确定删除这一个模板?', function(btnId) {
                        if ('yes' === btnId) {
                            var rec = grid.getStore().getAt(rowIndex);
                            Ext.data.StoreManager.lookup('storeArticle').remove(rec);
                        }
                    });
                }
            }]
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{article}'
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
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用邮件模版功能！');
            }

        }
    }
});
