/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.view.knowledge.widgets.Knowledge', {
    extend: 'Ext.tree.Panel',
    xtype: 'knowledgetree',
    scrollable: true,
    cls: 'shadow',
    title: '分类',
    rootVisible: false,
    height: '100%',
    margin: '20 -10 20 20',
    store: Ext.create('Ext.data.TreeStore'),
    tools: [{
        xtype: 'button',
        ui: 'soft-green',
        iconCls: 'fa fa-plus fa-1',
        text: '添加',
        handler: function() {
            Ext.create('Admin.view.knowledge.widgets.ClassifyEditorWindow');
        }
    }],
    columns: [{
        xtype: 'treecolumn',
        text: '分类名称',
        dataIndex: 'text',
        flex: 1
    }, {
        xtype: 'actioncolumn',
        text: '操作',
        align: 'center',
        width: 90,
        items: [{
            iconCls: 'x-fa fa-pencil-square-o',
            tooltip: '编辑',
            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                Ext.create('Admin.view.knowledge.widgets.ClassifyEditorWindow', {
                    record: record
                });
            }
        }, {
            iconCls: 'x-fa fa-trash-o',
            tooltip: '删除',
            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                Admin.data.Knowledge.fireEvent('writeClassifyData', 0, 'DELETE', record.data.id);
            }
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Knowledge.on('classifyDataLoaded', function(recordIndex) {
                me.fireEvent('afterrender', recordIndex);
            });
        },
        afterrender: function(classifyIndex) {
            var me = this;
            var classify = Admin.data.Knowledge.get('classify');
            var nodes = [];
            if (classify && classify.length) {
                Ext.each(classify, function(item, index) {
                    nodes.push({
                        text: item.title,
                        metadata: item,
                        id: item._id,
                        leaf: true
                    });
                });
                me.store.setRoot({
                    expanded: true,
                    children: nodes
                });
                if (classifyIndex && typeof classifyIndex === 'string') {
                    me.setSelection(me.getRootNode().childNodes[classifyIndex]);
                } else {
                    me.setSelection(me.getRootNode().childNodes[0]);
                }
            }
        },
        select: function(tree, record) {
            Admin.data.Knowledge.fireEvent('getIssuesByClassifyId', record.data.id);
        }
    }
});
