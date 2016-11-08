/**
 * Created by jhli on 16-04-28.
 */
Ext.define('Admin.view.access.plugin.Plugin', {
    extend: 'Ext.container.Container',
    xtype: 'plugin',
    viewModel: {
        type: 'plugin'
    },
    requires: [
        'Admin.data.Team'
    ],
    scrollable: 'y',
    items: [
        {
            xtype: 'tabpanel',
            margin: 20,
            title: '网站接入',
            tools: [
                {
                    xtype: 'button',
                    tooltip: '添加站点', text: '添加站点', handler: function () {
                        var tabs = this.up('tabpanel');
                        if (tabs.items.length >= Admin.data.Team.get('plan.max_setting_web')) {
                            Ext.Msg.alert("无法添加", "已达到当前套餐的站点数上限，无法继续添加站点。");
                        } else {
                            tabs.setActiveItem(tabs.add({
                                title: '新站点',
                                xtype: 'im_editor'
                            }));
                        }
                    }
                }
            ],
            listeners: {
                afterrender: function () {
                    if (Admin.data.Team.get('plan.max_setting_web') <= 1) {
                        this.tabBar.setHidden(true);
                        this.header.down('button[tooltip="添加站点"]').setHidden(true);
                    }

                    var pluginStore = this.up('plugin').viewModel.data.plugin;
                    var tabs = this;
                    var init = function () {
                        var activeTab = tabs.getActiveTab();
                        var activeTabIndex = activeTab ? tabs.items.indexOf(activeTab) : 0;
                        tabs.removeAll();
                        pluginStore.each(function (plugin) {
                            tabs.add({
                                title: plugin.data.name,
                                xtype: 'im_editor',
                                record: plugin
                            });
                        });

                        if (activeTabIndex && activeTabIndex < tabs.items.length) {
                            tabs.setActiveTab(tabs.items.getAt(activeTabIndex));
                        } else {
                            tabs.setActiveTab(0);
                        }
                    };

                    if (pluginStore.count()) {
                        init();
                    } else {
                        pluginStore.addListener('load', init);
                    }
                }
            },
            items: []
        },


        {
            xtype: 'grid',
            title: '咨询表单',
            bind: {
                store: '{orderForm}'
            },
            margin: 20,
            cls: 'shadow',
            columns: [{
                sortable : false,
                xtype: 'rownumberer',
                width: 30
            }, {
                text: '分类',
                sortable : false,
                dataIndex: 'title',
                flex: 1
            }, {
                xtype: 'actioncolumn',
                text: '操作',
                align: 'center',
                width: 150,
                items: [
                    {
                        iconCls: 'x-fa fa-edit',
                        tooltip: '编辑',
                        handler: function (grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);
                            Ext.create('Admin.view.access.plugin.widgets.OrderFormEditorWindow', {
                                record: rec
                            });
                        }
                    }, {
                        iconCls: 'x-fa fa-times-circle',
                        tooltip: '删除',
                        handler: function (grid, rowIndex, colIndex) {
                            var store = grid.getStore();
                            var rec = store.getAt(rowIndex);
                            Ext.Msg.confirm('删除', '确定删除此分类？', function (btnId) {
                                if ('yes' === btnId) {
                                    store.remove(rec);
                                }
                            });
                        }
                    }]
            }],
            tools: [{
                text: '添加',
                xtype: 'button',
                iconCls: 'fa fa-plus',
                ui: 'soft-green',
                handler: function () {
                    Ext.create('Admin.view.access.plugin.widgets.OrderFormEditorWindow', {
                        record: null
                    });
                }
            }]
        }
    ]
});
