Ext.define('Admin.view.task.Task', {
    extend: 'Ext.container.Container',
    xtype: 'task',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    viewModel: {
        type: 'task'
    },
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        title: '计划',
        emptyText: '<center>暂未添加计划</center>',
        id: 'taskGrid',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{task}'
        },
        tools: [{
            xtype: 'splitbutton',
            text: '添加',
            iconCls: 'fa fa-plus',
            ui: 'soft-green',
            menu: new Ext.menu.Menu({
                items: [
                    // these will render as dropdown menu items when the arrow is clicked:
                    { text: '邮件回访计划', handler: function() { Ext.create('Admin.view.task.widgets.CreateEmailPlanWindow'); } },
                    { text: '短信回访计划', handler: function() { Ext.create('Admin.view.task.widgets.CreateSmsPlanWindow'); } },
                    { text: '录音回访计划', handler: function() { Ext.create('Admin.view.task.widgets.CreateVoicePlanWindow'); } },
                    { text: '客服电话回访计划', handler: function() { Ext.create('Admin.view.task.widgets.CreatePhonePlanWindow'); } }
                ]
            }),
            handler: function() {
                this.showMenu();
            }
        }],
        columns: [{
                xtype: 'rownumberer'
            }, {
                text: '计划类型',
                dataIndex: 'type',
                sortable: true,
                width: '10%',
                renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                    var map = {
                        MAIL: '邮件回访',
                        SMS: '短信回访',
                        VOIP_RECORD: '录音回访',
                        VOIP_STAFF: '客服电话回访'
                    };
                    return map[value];
                }
            }, {
                text: '名称',
                dataIndex: 'title',
                sortable: true,
                flex: 2
            },
            /*{
                           text: '被分配人',
                           dataIndex: 'assigners',
                           sortable: true,
                           flex: 1,
                           renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                               if (value.length) {
                                   var name = [];
                                   for (var i = 0; i < value.length; i++) {
                                       name.push(value[i].name);
                                   }
                                   return name.join(', ');
                               } else {
                                   return 'N/A';
                               }
                           }
                       },*/
            {
                text: '客户人数',
                dataIndex: 'jobs',
                flex: 1
                    /*,renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                        return value.length;
                        if (value.length) {
                            var name = [];
                            for (var i = 0; i < value.length; i++) {
                                name.push(value[i].name);
                            }
                            return name.join(', ');
                        } else {
                            return 'N/A';
                        }
                    }*/
            },
            /*{
                           text: '任务资料',
                           dataIndex: 'media',
                           flex: 1,
                           renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                               if (value) {
                                   return value.title;
                               } else {
                                   return 'N/A';
                               }
                           }
                       },*/
            {
                text: '任务状态',
                dataIndex: 'status',
                flex: 1,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                    var map = {
                        INIT: '未开始',
                        COMPILE: '进行中',
                        FINISH: '完成'
                    };
                    return map[value];
                }
            }, {
                text: '任务进度',
                dataIndex: '',
                flex: 1,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                    var
                        jobs = record.data.jobs,
                        progress = record.data.progress;

                    return ((progress / jobs) * 100).toFixed(1) + '%';
                }
            }, {
                text: '创建时间',
                flex: 1,
                dataIndex: 'created_at'
            }, {
                text: '操作',
                flex: 1,
                align: 'center',
                xtype: 'actioncolumn',
                items: [{
                    iconCls: 'action-x-fa x-fa fa-trash-o',
                    margin: '0 0 0 10',
                    tooltip: '删除',
                    handler: function(grid, rowIndex, colIndex) {
                        Ext.Msg.confirm('删除任务', '确定删除这一个任务?', function(btnId) {
                            if ('yes' === btnId) {
                                var rec = grid.getStore().getAt(rowIndex);
                                Ext.getCmp('taskGrid').getStore().remove(rec);

                                var taskListStore = Ext.data.StoreManager.lookup('storeTaskList');
                                if (taskListStore) {
                                    taskListStore.reload();
                                }
                            }
                        });
                    },
                    isDisabled: function(tableView, row, colum, button, record) {
                        return 'INIT' !== record.data.status;
                    }
                }]
            }
        ],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{task}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }],
    listeners: {
        activate: function() {
            var status = Admin.data.Permission.get('task.status');
            if (!status) {
                this.down('grid').setDisabled(true);
                Ext.Msg.alert('提醒', '需要升级至专业版或其以上的套餐才能使用计划功能！');
            }
        }
    }
});
