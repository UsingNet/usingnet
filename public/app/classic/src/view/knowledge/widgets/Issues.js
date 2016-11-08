/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.view.knowledge.widgets.Issues', {
    extend: 'Ext.grid.Panel',
    xtype: 'issueslist',
    requires: ['Admin.view.knowledge.widgets.IssueEditorWindow'],
    scrollable: true,
    cls: 'shadow',
    title: '问答列表',
    height: '100%',
    margin: 20,
    emptyText: '<center>暂无数据</center>',
    store: Ext.create('Ext.data.Store'),
    tools: [{
        xtype: 'button',
        ui: 'soft-green',
        iconCls: 'fa fa-plus fa-1',
        text: '添加',
        handler: function() {
            Ext.create('Admin.view.knowledge.widgets.IssueEditorWindow');
        }
    }],
    columns: [{
        xtype: 'rownumberer',
        width: 30
    }, {
        text: '问题',
        dataIndex: 'title',
        flex: 2
    }, {
        text: '关键字',
        dataIndex: 'keywords',
        flex: 1,
        renderer: function(value) {
            return value.join('，');
        }
    }, {
        xtype: 'actioncolumn',
        text: '操作',
        align: 'center',
        width: 90,
        items: [{
            iconCls: 'x-fa fa-pencil-square-o',
            tooltip: '编辑',
            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                Ext.create('Admin.view.knowledge.widgets.IssueEditorWindow', {
                    record: record
                });
            }
        }, {
            iconCls: 'x-fa fa-trash-o',
            tooltip: '删除',
            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                Admin.data.Knowledge.fireEvent('writeIssuesData', 0, 'DELETE', record.data._id);
            }
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Knowledge.on('issuesDataLoaded', function() {
                var issues = Admin.data.Knowledge.get('issues');
                me.getStore().setData(issues);
            });
        }
    }
});
