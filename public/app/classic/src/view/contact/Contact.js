/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.contact.Contact', {
    extend: 'Ext.container.Container',
    scrollable: true,
    requires: [
        'Admin.view.contact.ContactModel',
        'Admin.view.contact.ContactController'
    ],
    xtype: 'contact',
    cls: 'shadow',
    width: '100%',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'contact'
    },
    controller: 'contact',
    items: [{
        xtype: 'grid',
        id: 'contactGrid',
        title: '客户管理',
        emptyText: '<center>暂无客户信息</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        bind: {
            store: '{contacts}'
        },
        columns: [{
            xtype: 'rownumberer',
            width: '2%'
        }, {
            text: '姓名',
            dataIndex: 'name',
            editor: 'textfield',
            width: '10%'
        }, {
            text: '备注',
            dataIndex: 'remark',
            editor: 'textfield',
            width: '10%'
        }, {
            text: '邮箱',
            dataIndex: 'email',
            editor: 'textfield',
            vtype: 'email',
            width: '15%'
        }, {
            text: '电话',
            dataIndex: 'phone',
            editor: 'textfield',
            width: '10%'
        }, {
            text: '标签',
            dataIndex: 'tags',
            flex: 1,
            renderer: function(value, cls, record, rowIndex, columnIndex, store, grid) {
                if (record && record.data && record.data.source_tags) {
                    var tags = record.data.source_tags;
                } else {
                    var tags = [];
                }

                var colorField = [];
                for (var i = 0; i < tags.length; i++) {
                    colorField.push(Ext.util.Format.format('<span style="background-color: \#{0}; color: #FFF; padding: 5px; border-radius: 5px; margin-left: 5px;">{1}</span>', tags[i].color, tags[i].name));
                }
                return colorField.join('');
            },
            editor: {
                xtype: 'tagfield',
                fieldLabel: '',
                bind: {
                    store: '{tags}'
                },
                displayField: 'name',
                valueField: 'name',
                queryMode: 'remote',
                filterPickList: true,
                forceSelection: false,
                createNewOnBlur: true,
                createNewOnEnter: true,
                listeners: {
                    expand: function(field, eOpts) {
                        field.store.load();
                    }
                }
            }
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            width: '10%',
            items: [{
                iconCls: 'x-fa fa-comment',
                tooltip: '发起对话',
                handler: function(grid, rowIndex, colIndex) {
                    if ('1' != Ext.util.Cookies.get('online')) {
                        Ext.Msg.alert('错误', '您目前处于离线状态，不能发起对话！');
                        return;
                    }
                    var responseType = [
                        // {
                        //     "type": "SMS",
                        //     "name": "短信",
                        //     need_field: "phone"
                        // },
                        {
                            "value": "VOICE",
                            "name": "电话",
                            need_field: "phone"
                        }, {
                            "value": "IM",
                            "name": "即时消息",
                            need_field: "track_id"
                        }, {
                            "value": "WECHAT",
                            "name": "微信",
                            need_field: "openid"
                        }, {
                            "value": "MAIL",
                            "name": "邮件",
                            need_field: "email"
                        }
                    ];
                    var rec = grid.getStore().getAt(rowIndex);
                    var data = [];
                    Ext.Array.each(responseType, function(item) {
                        if (rec.data[item.need_field]) {
                            data.push(item);
                        }
                    });


                    var store = Ext.create('Ext.data.Store', {
                        fields: ['name', 'value'],
                        data: data
                    });
                    Ext.create('Ext.window.Window', {
                        title: '发起对话',
                        autoShow: true,
                        modal: true,
                        width: 300,
                        height: 150,
                        layout: 'center',
                        items: [{
                            xtype: 'combo',
                            fieldLabel: '对话方式',
                            labelWidth: 60,
                            store: store,
                            displayField: 'name',
                            valueField: 'value'
                        }],
                        bbar: ['->', {
                            text: '确定',
                            ui: 'soft-green',
                            handler: function() {
                                var me = this;
                                var type = this.up('window').down('combo').getValue();
                                if (!type) {
                                    return;
                                }
                                Ext.Ajax.request({
                                    url: '/api/order/launch',
                                    jsonData: {
                                        contact_id: rec.id,
                                        type: type
                                    },
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText);
                                        if (!res.success) {
                                            Ext.Msg.alert('错误', res.msg);
                                            return;
                                        }
                                        location.hash = '#customerservice';
                                        me.up('window').close();
                                        Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load(function(records, opearation, success) {
                                            var father = Ext.getCmp('treelist');
                                            father.select(father.items.getAt(0));
                                        });

                                    },
                                    failure: function() {
                                        Ext.Msg.alert('错误', '服务器错误。');
                                    }
                                });
                            }
                        }, {
                            text: '取消',
                            ui: 'soft-blue',
                            handler: function() {
                                this.up('window').close();
                            }
                        }]
                    });
                }
            }, {
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
                    Ext.Msg.confirm('确定', '确定要删除这个客户吗?', function(btnId) {
                        if ('yes' === btnId) {
                            var store = grid.getStore();
                            var rec = grid.getStore().getAt(rowIndex);
                            Ext.Ajax.request({
                                url: '/api/contact/' + rec.data.id,
                                method: 'DELETE',
                                success: function(store) {
                                    return function(response) {
                                        var res = Ext.decode(response.responseText);
                                        if (!res.success) {
                                            Ext.Msg.alert('错误', res.msg);
                                            return;
                                        }
                                        store.reload();
                                    }
                                }(store)
                            });
                        }
                    });
                }
            }]
        }],
        plugins: {
            ptype: 'rowediting',
            clicksToEdit: 2,
            listeners: {
                cancelEdit: function(rowEditing, context) {
                    if (context.record.phantom) {
                        rowEditing.grid.store.remove(context.record);
                    }
                }
            }
        },
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{contacts}'
            },
            dock: 'bottom',
            displayInfo: true
        }],
        tools: [{
            xtype: 'fieldcontainer',
            layout: 'hbox',
            items: [{
                xtype: 'textfield',
                listeners: {
                    change: function() {
                        if (!this.value) {
                            this.up('grid').store.load();
                        }
                    },
                    specialkey: function(field, e) {
                        if (field.getValue() && e.getKey() === e.ENTER) {
                            field.up('fieldcontainer').down('button').handler();
                        }
                    }
                }
            }, {
                xtype: 'splitter'
            }, {
                xtype: 'button',
                text: '搜索',
                handler: function() {
                    this.up('grid').getStore().load({
                        params: {
                            query: this.up('fieldcontainer').down('textfield').value
                        }
                    });
                }
            }]
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'button',
            iconCls: 'x-fa fa-plus',
            text: '添加',
            ui: 'soft-green',
            handler: function() {
                var grid = this.ownerCt.up();
                var model = Ext.create('Admin.model.Contact');
                grid.store.setAutoSync(false);
                var records = grid.store.insert(0, [model]);
                grid.store.setAutoSync(true);
                grid.plugins[0].startEdit(records[0], 0);
            }
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'button',
            iconCls: 'x-fa fa-upload',
            text: '导入',
            ui: 'soft-green',
            handler: function() {
                var grid = this.up('grid');
                Ext.create('Ext.window.Window', {
                    title: '导入',
                    width: 400,
                    autoShow: true,
                    modal: true,
                    items: [{
                        xtype: 'form',
                        margin: 20,
                        items: [{
                            xtype: 'filefield',
                            width: '100%',
                            name: 'contacts',
                            fieldLabel: '导入客户',
                            labelWidth: 60,
                            buttonText: '选择',
                            allowBlank: false
                        }]
                    }],
                    buttons: [{
                        text: '确定',
                        ui: 'soft-green',
                        handler: function() {
                            var form = this.up('window').down('form');
                            if (form.isValid()) {
                                form.submit({
                                    url: '/api/contact',
                                    waitMsg: '正在上传...',
                                    success: function(fo, e) {
                                        Ext.Msg.alert('成功', e.result.data);
                                        grid.store.load();
                                    },
                                    failure: function(fo, e) {
                                        Ext.Msg.alert('错误', e.result.msg);
                                    }
                                });
                            }
                        }
                    }, {
                        text: '关闭',
                        ui: 'soft-blue',
                        handler: function() {
                            this.up('window').close();
                        }
                    }]
                });
            }
        }],
        listeners: {
            beforerender: function() {
                var me = this;
                Ext.getCmp('treelist').on('orderadded', function() {
                    me.getStore().load();
                });
            }
        }
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            Ext.getCmp('treelist').up('customerservice').down('customerbasic').on('customerbasicchange', function() {
                me.down('grid').getStore().reload();
            });
        },
        activate: function() {
            var status = Admin.data.Permission.get('contact.status')
            if (!status) {
                this.down('grid').setDisabled(true);
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用客户管理功能！');
            }
        }
    }
});
