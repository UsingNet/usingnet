Ext.define('Admin.view.main.taskList.TaskList', {
    extend: 'Ext.button.Button',
    xtype: 'taskListBtn',
    iconCls: 'x-fa fa-thumb-tack',
    userCls: 'circular-icon',
    id: 'taskListIcon',
    tooltip: '计划列表',
    handler: function (self, event) {
        var taskListGrid = self.taskList;
        if (!taskListGrid) {
            self.taskList = Ext.create('Ext.grid.Panel', {
                floating: true,
                emptyText: '暂时没有计划',
                requires: [
                    'Admin.view.main.taskList.TaskListModel'
                ],
                id: 'taskList',
                //title: '计划列表',
                cls: 'shadow',
                hideHeaders: true,
                //height: 400,
                width: 400,
                style: {
                    border: '1px solid #cccccc'
                //    borderRadius: '10px'
                },
                viewModel: {
                    type: 'tasklistmodel'
                },
                bind: {
                    store: '{tasklist}'
                },
                listeners: {
                    cellclick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                        if (3 === cellIndex && record.data.progress !== record.data.jobs) {
                            Ext.Msg.confirm('接受任务', '确定接受这一个任务?', function (btnId) {
                                if ('yes' === btnId) {
                                    Ext.Ajax.request({
                                        url: '/api/tasklist/' + record.id,
                                        method: 'PUT',
                                        success: function (response) {
                                            var res = Ext.JSON.decode(response.responseText);
                                            if (200 === res.code) {
                                                Ext.data.StoreManager.lookup('storeTaskList').load();
                                                var orderStore = Ext.getCmp('chatWindow').up('customerservice').down('workorderpanel').viewModel.storeInfo.workorderstore;
                                                orderStore.load();
                                                location.hash = '#customerservice';
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    },
                    activate: function() {
                        this.store.load();
                    },
                    afterrender: function() {
                        Ext.getBody().on('click', this.config.listeners.gridLostFocus);
                    },
                    gridLostFocus: function(e) {
                        var taskListGrid = Ext.getCmp('taskList'),
                            taskListIcon = Ext.getCmp('taskListIcon'),
                            grid = taskListGrid.body.dom,
                            icon = taskListIcon.el.dom,
                            target = e.getTarget();
                        if (!grid.contains(target) && !icon.contains(target)) {
                            taskListGrid.hide();
                        }
                    }
                },
                columns: [{
                    xtype: 'rownumberer'
                }, {
                    text: '标题',
                    flex: 1,
                    dataIndex: 'title'
                }, {
                    text: '分派进度',
                    flex: 1,
                    renderer: function (value, metaData, record) {
                        return record.data.progress + ' / ' + record.data.jobs;
                    }
                }, {
                    text: '操作',
                    flex: 1,
                    align: 'center',
                    renderer: function (value, metaData, record) {
                        if (record.data.progress === record.data.jobs) {
                            return '任务已分派完毕';
                        }
                        return Ext.String.format('<div style="color: #fff; background-color: #35BAF6; border-radius: 5px; box-shadow: 0 0 2px 0 #000000; cursor: pointer;">接受任务</div>');
                    }
                }]
            });
            taskListGrid = self.taskList;
            taskListGrid.showAt(self.getX() - taskListGrid.width + self.getWidth(), self.getY() + self.getHeight(), true);
        } else {
            if (taskListGrid.isHidden()) {
                taskListGrid.showAt(self.getX() - taskListGrid.width + self.getWidth(), self.getY() + self.getHeight(), true);
            } else {
                taskListGrid.hide();
            }
        }
    }
});
