/**
 * Created by jhli on 16-01-15.
 */
Ext.define('Admin.view.statistics.orderStatistic.OrderStatistic', {
    extend: 'Ext.container.Container',
    xtype: 'orderstatistic',
    scrollable: true,
    requires: [
        'Ext.container.Container'
    ],
    viewModel: {
        type: 'orderstatistic'
    },
    layout: 'fit',
    items: [{
        xtype: 'grid',
        margin: 20,
        cls: 'shadow',
        title: '工单统计',
        bind: {
            store: '{orderstatistic}'
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
                                this.up('grid').store.proxy.setUrl('/api/stats/order?begin=' +
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
                                this.up('grid').store.proxy.setUrl('/api/stats/order?begin=' +
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
            text: '工单分类',
            dataIndex: 'title',
            flex: 1
        }, {
            text: '工单数',
            dataIndex: 'order_count',
            flex: 1
        }, {
            xtype: 'actioncolumn',
            flex: 1,
            text: '查看',
            align: 'center',
            items: [{
                iconCls: 'x-fa fa-eye',
                tooltip: '查看工单记录',
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    var categoryId = record.data.category_id;
                    var timeRange = '&begin=' + Ext.Date.format(this.up('grid').query('datefield')[0].getValue(), 'Y-m-d') + '&end=' + Ext.Date.format(this.up('grid').query('datefield')[1].getValue(), 'Y-m-d');
                    var url = '/api/stats/orderlist?category_id=' + categoryId + timeRange;
                    Ext.Ajax.request({
                        url: url,
                        success: function(option) {
                            var objs = Ext.decode(option.responseText);
                            var store = Ext.create('Ext.data.Store', {
                                fields: ['created_time', 'type', 'contact', 'message_count'],
                                data: objs.data
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
                                title: '工单记录',
                                layout: 'fit',
                                modal: true,
                                autoDestroy: true,
                                items: [{
                                    xtype: 'grid',
                                    store: store,
                                    width: 800,
                                    height: 500,
                                    //minHeight: 500,
                                    emptyText: '<center>暂无工单记录</center>',
                                    columns: [{
                                        xtype: 'rownumberer'
                                    }, {
                                        text: '时间',
                                        dataIndex: 'created_at',
                                        flex: 1
                                    }, {
                                        text: '类型',
                                        dataIndex: 'type',
                                        flex: 1,
                                        renderer: function(value) {
                                            var map = {
                                                IM: '网页挂件',
                                                WECHAT: '微信',
                                                SMS: '短信',
                                                VOICE: '电话',
                                                MAIL: '邮件'
                                            };
                                            return map[value];
                                        }
                                    }, {
                                        text: '消息数',
                                        dataIndex: 'message_count',
                                        flex: 1
                                    }, {
                                        text: '联系人',
                                        dataIndex: 'contact',
                                        flex: 1,
                                        renderer: function(value) {
                                            if (value) {
                                                return value.name;
                                            }
                                        }
                                    }, {
                                        xtype: 'actioncolumn',
                                        align: 'center',
                                        text: '聊天记录',
                                        items: [{
                                            iconCls: 'x-fa fa-eye',
                                            tooltip: '查看聊天记录',
                                            handler: function(tableview, rowIndex, columnIndex, action, event, record, rowDom) {
                                                var title = '客服&nbsp;' + record.data.user.name + '&nbsp;与客户&nbsp;' + record.data.contact.name + '&nbsp;的对话'
                                                Ext.create('Admin.view.communication.historyDialogue.ChatRecordWin', {
                                                    customData: {
                                                        order_id: record.id,
                                                        metaData: record.data
                                                    },
                                                    listeners: {
                                                        beforerender: function() {
                                                            this.setTitle(title);
                                                        }
                                                    }
                                                });
                                            }
                                        }]
                                    }],
                                    dockedItems: [{
                                        xtype: 'pagingtoolbar',
                                        store: store,
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
                store: '{orderstatistic}'
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
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用工单统计功能！');
            } else {
                this.down('grid').getStore().reload();
            }
        },
        afterrender: function() {
            var me = this;
            var store = Ext.data.StoreManager.lookup('orderstatistic');
            store.on('load', function(store) {
                me.down('grid').lastRequestUrl = store.proxy.url;
            });
        }
    }
});
