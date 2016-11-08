/**
 * Created by henry on 16-1-6.
 */
Ext.define('Admin.view.statistics.access.Access', {
    extend: 'Ext.container.Container',
    xtype: 'access',
    scrollable: true,
    requires: [
        'Ext.container.Container'
    ],
    viewModel: {
        type: 'access'
    },
    layout: 'fit',
    items: [{
        xtype: 'grid',
        id: 'lijiahong1',
        margin: 20,
        cls: 'shadow',
        title: '访客统计',
        bind: {
            store: '{access}'
        },
        viewConfig: {
            enableTextSelection: true
        },
        tools: [{
            xtype: 'button',
            text: '导出',
            ui: 'soft-green',
            iconCls: 'x-fa fa-download',
            handler: function() {
                var url = this.up('grid').lastRequestUrl;
                if (url.indexOf('?') > -1) {
                    url = url + '&';
                } else {
                    url = url + '?';
                }
                window.open(url + 'export');
            }
        }],
        tbar: [{
                xtype: 'button',
                text: '今天',
                id: 'todayAccessBtn',
                handler: function() {
                    var container = this.up('toolbar').down('container');
                    container.items.getAt(0).setValue(null);
                    container.items.getAt(1).setValue(null);
                    container.items.getAt(0).setValue(new Date());
                    container.items.getAt(1).setValue(new Date());
                }
            }, {
                xtype: 'button',
                text: '最近7天',
                handler: function() {
                    var container = this.up('toolbar').down('container');
                    container.items.getAt(0).setValue(null);
                    container.items.getAt(1).setValue(null);
                    container.items.getAt(0).setValue(new Date((new Date()).getTime() - 7 * 24 * 3600000));
                    container.items.getAt(1).setValue(new Date());
                }
            }, {
                xtype: 'button',
                text: '最近30天',
                handler: function() {
                    var container = this.up('toolbar').down('container');
                    container.items.getAt(0).setValue(null);
                    container.items.getAt(1).setValue(null);
                    container.items.getAt(0).setValue(new Date((new Date()).getTime() - 30 * 24 * 3600000));
                    container.items.getAt(1).setValue(new Date());
                }
            },
            '->', {
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                items: [{
                    xtype: 'datefield',
                    labelWidth: 60,
                    margin: '0 0 0 5',
                    name: 'startDate',
                    fieldLabel: '开始日期',
                    maxValue: new Date(),
                    value: new Date(),
                    listeners: {
                        change: function(field, newValue) {
                            this.nextSibling().setMinValue(newValue);
                            if (newValue && this.nextSibling().getValue()) {
                                this.up('grid').store.proxy.setUrl('/api/stats/visit?begin=' +
                                    Ext.Date.format(newValue, 'Y-m-d') +
                                    '&end=' +
                                    Ext.Date.format(this.nextSibling().getValue(), 'Y-m-d')
                                );
                                this.up('grid').store.reload();
                            }
                        }
                    }
                }, {
                    xtype: 'datefield',
                    labelWidth: 60,
                    margin: '0 0 0 5',
                    name: 'endDate',
                    fieldLabel: '结束日期',
                    value: new Date(),
                    maxValue: new Date(),
                    listeners: {
                        change: function(field, newValue) {
                            this.previousSibling().setMaxValue(newValue);
                            if (newValue && this.previousSibling().getValue()) {
                                this.up('grid').store.proxy.setUrl('/api/stats/visit?begin=' +
                                    Ext.Date.format(this.previousSibling().getValue(), 'Y-m-d') +
                                    '&end=' +
                                    Ext.Date.format(newValue, 'Y-m-d')
                                );
                                this.up('grid').store.reload();
                            }
                        }
                    }
                }]
            }
        ],
        columns: [{
            xtype: 'rownumberer',
            width: 35
        }, {
            text: '时间',
            dataIndex: 'created_at',
            width: '15%'
        }, {
            text: '访客',
            dataIndex: 'contact_name',
            flex: 1,
            renderer: function(value) {
                return value ? value : '未知';
            }
        }, {
            text: '来源',
            dataIndex: 'referrer',
            flex: 5,
            renderer: function(value, meta, record) {
                if (value.match('http')) {
                    return '<a target="_blank" style="text-decoration: none; color: #000; cursou： pointer;" href="' + value + '">' + value + '</a>';
                } else {
                    return value;
                }

            }
        }, {
            text: '停留时间',
            dataIndex: 'second',
            flex: 1,
            renderer: function(second) {
                var timeString = '';
                var names = ['秒', '分', '时', '天', '年'];
                var times = [1, 60, 3600, 86400, 3153600];
                for (var i = 0; i < 3; i++) {
                    timeString = ((parseInt(second % times[i + 1] / times[i])).toString() + names[i]) + timeString;
                }
                return timeString;
            }
        }, {
            text: '访问页数',
            dataIndex: 'times',
            flex: 1
        }, {
            xtype: 'actioncolumn',
            flex: 1,
            text: '查看轨迹',
            align: 'center',
            items: [{
                iconCls: 'x-fa fa-eye',
                tooltip: '查看轨迹',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    var track_id = record.data.track_id;
                    var timeRange = '&begin=' + Ext.Date.format(this.up('grid').query('datefield')[0].getValue(), 'Y-m-d') + '&end=' + Ext.Date.format(this.up('grid').query('datefield')[1].getValue(), 'Y-m-d');
                    var url = '/api/track?_id=' + track_id + timeRange;
                    Ext.Ajax.request({
                        url: url,
                        success: function(option) {
                            var objs = Ext.decode(option.responseText);
                            var store = Ext.create('Ext.data.Store', {
                                fields: ['created_at', 'title', 'url', 'updated_at', 'referrer'],
                                data: objs.data,
                                sorters: [{
                                    property: 'created_at',
                                    direction: 'DESC'
                                }]
                            });
                            store.setProxy({
                                type: 'rest',
                                url: url,
                                reader: {
                                    type: 'json',
                                    rootProperty: 'data'
                                }
                            });
                            var dialog = Ext.create('Ext.window.Window', {
                                title: '轨迹详情',
                                layout: 'fit',
                                modal: true,
                                autoDestroy: true,
                                items: [{
                                    xtype: 'grid',
                                    "store": store,
                                    width: 800,
                                    minHeight: 500,
                                    emptyText: '<center>暂无轨迹数据</center>',
                                    columns: [{
                                        text: '时间',
                                        dataIndex: 'created_at',
                                        flex: 2
                                    }, {
                                        text: '访问页面',
                                        dataIndex: 'title',
                                        flex: 3,
                                        renderer: function(value, eOpts, record) {
                                            return '<a style="text-decoration: none; color: #000;" target="_blank" href="' + record.data.url + '">' + record.data.title + '</a>';
                                        }
                                    }, {
                                        text: '离开时间',
                                        dataIndex: 'updated_at',
                                        flex: 2
                                    }, {
                                        text: '来源',
                                        dataIndex: 'referrer',
                                        flex: 2,
                                        renderer: function(value) {
                                            if (value.match('http')) {
                                                return '<a target="_blank" style="text-decoration: none; color: #000; cursou： pointer;" href="' + value + '">' + value + '</a>';
                                            } else {
                                                return value;
                                            }
                                        }
                                    }],
                                    dockedItems: [{
                                        xtype: 'pagingtoolbar',
                                        "store": store,
                                        dock: 'bottom',
                                        displayInfo: true
                                    }]
                                }]
                            });
                            dialog.show();
                        }
                    });
                }
            }]
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{access}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }],
    listeners: {
        activate: function() {
            var status = Admin.data.Permission.get('stats.status')
            if (!status) {
                this.down('grid').setDisabled(true);
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用访客统计功能！');
            } else {
                this.down('grid').getStore().reload();
            }
        },
        afterrender: function() {
            var me = this;
            var store = Ext.data.StoreManager.lookup('accessStore');
            store.on('load', function(store) {
                me.down('grid').lastRequestUrl = store.proxy.url;
            });
        }
    }
});
