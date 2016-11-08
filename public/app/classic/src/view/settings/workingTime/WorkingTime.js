/**
 * Created by jhli on 16-2-23.
 */
Ext.define('Admin.view.settings.workingTime.WorkingTime', {
    extend: 'Ext.container.Container',
    xtype: 'workingtime',
    scrollable: true,
    layout: 'fit',
    items: [{
        xtype: 'panel',
        title: '工作时间',
        margin: 20,
        cls: 'shadow',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'form',
            margin: 20,
            height: 120,
            fieldDefault: {
                margin: 15
            },
            items: [{
                xtype: 'fieldcontainer',
                fieldLabel: '每日工作时间',
                layout: 'hbox',
                items: [{
                    xtype: 'timefield',
                    format: 'H:i',
                    name: 'dayStartTime',
                    width: 200
                }, {
                    xtype: 'displayfield',
                    value: '--'
                }, {
                    xtype: 'timefield',
                    format: 'H:i',
                    name: 'dayEndTime',
                    width: 200
                }]
            }, {
                xtype: 'tagfield',
                name: 'weekWorkingDays',
                store: Ext.create('Ext.data.Store', {
                    fields: ['id', 'show'],
                    data: [
                        { id: 1, show: '周一' },
                        { id: 2, show: '周二' },
                        { id: 3, show: '周三' },
                        { id: 4, show: '周四' },
                        { id: 5, show: '周五' },
                        { id: 6, show: '周六' },
                        { id: 7, show: '周日' }
                    ]
                }),
                displayField: 'show',
                valueField: 'id',
                queryMode: 'local',
                width: 680,
                fieldLabel: '每周工作日'
            }],
            bbar: [{
                xtype: 'button',
                ui: 'soft-green',
                text: '保存',
                handler: function() {
                    var me = this;
                    var form = me.up('form').getForm();
                    Ext.Ajax.request({
                        url: '/api/setting/worktime',
                        method: 'POST',
                        jsonData: Ext.encode({
                            worktime: form.getValues().dayStartTime + '-' + form.getValues().dayEndTime,
                            workday: form.getValues().weekWorkingDays.join(',')
                        }),
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            Ext.Msg.alert('成功', '保存成功！');
                            me.up('form').fireEvent('beforerender');asdasd
                        },
                        failure: function() {
                            Ext.Msg.alert('错误', '服务器错误，无法提交数据。');
                        }
                    });
                }
            }, {
                xtype: 'button',
                ui: 'soft-blue',
                text: '重置',
                handler: function() {
                    this.up('form').fireEvent('beforerender');
                }
            }],
            listeners: {
                beforerender: function() {
                    var me = this;
                    Ext.Ajax.request({
                        url: '/api/setting/worktime',
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            me.getForm().setValues({
                                dayStartTime: res.data.worktime.substring(0, res.data.worktime.indexOf('-')),
                                dayEndTime: res.data.worktime.substring(res.data.worktime.indexOf('-') + 1),
                                weekWorkingDays: res.data.workday.split(',')
                            });
                        }
                    });
                }
            }
        }, {
            xtype: 'grid',
            margin: '0 20 20 20',
            cls: 'shadow',
            title: '设置特殊工作日/假期',
            flex: 1,
            viewModel: {
                type: 'workingtime'
            },
            bind: {
                store: '{workingtime}'
            },
            tools: [{
                text: '添加',
                xtype: 'button',
                iconCls: 'fa fa-plus',
                ui: 'soft-green',
                handler: function() {
                    var grid = this.up('grid');
                    var gridStore = grid.getViewModel().storeInfo.workingtime;
                    var model = Ext.create('Admin.model.settings.workingTime.WorkingTime');
                    gridStore.setAutoSync(false);
                    var records = gridStore.insert(0, [model]);
                    gridStore.setAutoSync(true);
                    grid.plugins[0].startEdit(records[0], 0);
                }
            }],
            columns: [{
                xtype: 'datecolumn',
                text: '日期',
                dataIndex: 'date',
                flex: 1,
                formatter: 'date("Y-m-d")',
                editor: {
                    xtype: 'datefield',
                    format: 'Y-m-d'
                }
            }, {
                text: '类型',
                dataIndex: 'work',
                flex: 1,
                editor: {
                    xtype: 'combobox',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['state', 'show'],
                        data: [
                            { state: 1, show: '工作日' },
                            { state: 0, show: '假期' }
                        ]
                    }),
                    queryMode: 'local',
                    displayField: 'show',
                    valueField: 'state'
                },
                renderer: function(value) {
                    var map = {
                        true: '工作日',
                        false: '假期'
                    };
                    return map[value];
                }
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
                        this.ownerCt.up().plugins[0].startEdit(rec, 0);
                    }
                }, {
                    iconCls: 'x-fa fa-times-circle',
                    tooltip: '删除',
                    handler: function(grid, rowIndex, colIndex) {
                        Ext.Msg.confirm('确定', '确定要删除这条数据吗?', function(btnId) {
                            if ('yes' === btnId) {
                                var store = grid.getStore();
                                var rec = grid.getStore().getAt(rowIndex);
                                store.remove(rec);
                            }
                        });
                    }
                }]
            }],
            plugins: [{
                ptype: 'rowediting',
                clicksToEdit: 2,
                listeners: {
                    cancelEdit: function(rowEditing, context) {
                        if (context.record.phantom) {
                            rowEditing.grid.store.remove(context.record);
                        }
                    }
                }
            }],
            dockedItems: [{
                xtype: 'pagingtoolbar',
                bind: {
                    store: '{workingtime}'
                },
                dock: 'bottom',
                displayInfo: true
            }]
        }]
    }]
});
