/**
 * Created by jhli on 16-3-3.
 */
Ext.define('Admin.view.wiki.WikiTree', {
    extend: 'Ext.tree.Panel',
    xtype: 'wikitree',
    scrollable: true,
    cls: 'shadow',
    title: '知识库',
    rootVisible: false,
    store: Ext.create('Ext.data.TreeStore'),
    tools: [{
        cls: 'fa fa-plus fa-1',
        style: {
            color: '#3C8DBC'
        },
        tooltip: '添加根问题',
        height: 15,
        handler: function() {
            this.up('wiki').down('wikieditor').show();
        }
    }],
    columns: [{
        xtype: 'treecolumn',
        text: '问题列表',
        dataIndex: 'text',
        flex: 1
    }, {
        xtype: 'actioncolumn',
        text: '操作',
        align: 'center',
        width: 90,
        items: [{
            iconCls: 'x-fa fa-plus',
            tooltip: '添加子问题',
            handler: function(view, rowIndex, columnIndex, action, eOpts, model) {
                var data = model.data.metadata;
                var wikiEditor = this.up('wiki').down('wikieditor');
                wikiEditor.hasParentNoteId = data._id;
                wikiEditor.show();
            }
        }, {
            iconCls: 'x-fa fa-trash-o',
            tooltip: '删除此问题',
            handler: function(view, rowIndex, columnIndex, action, eOpts, model) {
                var data = model.data.metadata;
                Ext.Ajax.request({
                    url: '/api/knowledge/' + data._id,
                    method: 'DELETE',
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (res.success) {
                            Admin.data.WikiTree.fireEvent('updatetreedata');
                        } else {
                            Ext.Msg.alert('错误', '删除失败。');
                        }
                    }
                });
            }
        }, {
            iconCls: 'x-fa fa-pencil-square-o',
            tooltip: '编辑此问题',
            handler: function(view, rowIndex, columnIndex, action, eOpts, model) {
                var data = model.data.metadata;
                var wikiEditor = this.up('wiki').down('wikieditor');
                wikiEditor.modifyNode = data;
                wikiEditor.show();
            }
        }]
    }],
    updateTreeData: function(treeNodeId) {
        var me = this;
        var map = Admin.data.WikiTree.get('map')
        me.view.wikiMap = map;
        me.store.setRoot({
            expanded: true,
            children: Admin.data.WikiTree.get('nodes')
        });
        if (treeNodeId) {
            me.setSelection(me.store.byIdMap[map[treeNodeId]['id']]);
            me.expandNode(me.store.byIdMap[map[treeNodeId]['id']].parentNode);
        } else {
            var firstNode = me.getRootNode().childNodes[0];
            if (firstNode) {
                me.setSelection(firstNode);
            }
        }
    },
    listeners: {
        beforerender: function(me) {
            Admin.data.WikiTree.on('nodesloaded', me.updateTreeData, me);
            me.updateTreeData();
        },
        select: function(treeModel, record, index, eOpts) {
            var wikiEditor = this.up('wiki').down('wikieditor');
            if (!wikiEditor.isHidden()) {
                wikiEditor.hide();
            }

            var data = record.data.metadata;
            var wikicontent = this.next('wikicontent');

            if (!record.isLeaf()) {
                record.expand();
            }
            wikicontent.setData({
                title: data.title,
                message: data.message
            });
        }
    }
});