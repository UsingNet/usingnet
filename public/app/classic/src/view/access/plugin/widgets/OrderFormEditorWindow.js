Ext.define('Admin.view.access.plugin.widgets.OrderFormEditorWindow', {
    extend: 'Ext.window.Window',
    width: '40%',
    height: '40%',
    autoShow: true,
    autoDestroy: true,
    modal: true,
    xtype: 'orderFormEditor',
    scrollable: 'y',
    items: [
        {
            xtype: 'textfield',
            name: 'title',
            fieldLabel: '分类标题',
            allowBlank: false,
            width: '95%',
            padding: 10
        },
        {
            xtype: 'grid',
            store: Ext.create('Admin.store.settings.OrderFormItem'),
            minHeight: 300,
            title: '咨询表单',
            tools: [{
                text: '添加',
                xtype: 'button',
                iconCls: 'fa fa-plus',
                ui: 'soft-green',
                handler: function () {
                    var grid = this.ownerCt.up();
                    var model = Ext.create('Admin.model.settings.OrderFormItem');
                    var records = grid.store.insert(0, [model]);
                    grid.plugins[0].startEdit(records[0], 0);
                }
            }],
            plugins: [{
                ptype: 'rowediting',
                clicksToEdit: 2
            }],
            columns: [
                {
                    text: '类型', dataIndex: 'type',
                    sortable : false,
                    allowBlank: false,
                    renderer: function (value, cls, record, rowIndex, columnIndex, store, grid) {
                        var types = {
                            textarea:'多行文本',
                            input:'单行文本'
                        };
                        return types[value];
                    },
                    editor: {
                        xtype: 'combobox',
                        fieldLabel: '',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['name', 'id'],
                            data: [
                                {id:'textarea', name:'多行文本'},
                                {id:'input', name:'单行文本'}
                            ]
                        }),
                        editable: false,
                        displayField: 'name',
                        valueField: 'id',
                        queryMode: 'local',
                        forceSelection: true
                    }
                },
                {text: '占位符', dataIndex: 'placeholder', editor: 'textfield', flex: 1, allowBlank: false,sortable : false},
                {
                    xtype: 'actioncolumn',
                    text: '操作',
                    sortable : false,
                    align: 'center',
                    width: 150,
                    items: [
                        {
                            iconCls: 'x-fa fa-long-arrow-up',
                            tooltip: '上移',
                            handler: function (grid, rowIndex, colIndex) {
                                var store = grid.getStore();
                                var rec = store.getAt(rowIndex);
                                store.remove(rec);
                                store.insert(rowIndex > 0 ? rowIndex - 1 : 0, rec);
                            }
                        },
                        {
                            iconCls: 'x-fa fa-long-arrow-down',
                            tooltip: '下移',
                            handler: function (grid, rowIndex, colIndex) {
                                var store = grid.getStore();
                                var rec = store.getAt(rowIndex);
                                store.remove(rec);
                                store.insert(rowIndex < store.count() ? rowIndex + 1 : store.count(), rec);
                            }
                        },
                        {
                            iconCls: 'x-fa fa-edit',
                            tooltip: '编辑',
                            handler: function (grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex);
                                this.ownerCt.up().plugins[0].startEdit(rec, 0);
                            }
                        }, {
                            iconCls: 'x-fa fa-times-circle',
                            tooltip: '删除',
                            handler: function (grid, rowIndex, colIndex) {
                                var store = grid.getStore();
                                var rec = store.getAt(rowIndex);
                                store.remove(rec);
                            }
                        }]
                }
            ]
        }],
    buttons: [
        {
            text: '保存', handler: function () {
            var dialog = this.up('orderFormEditor');
            var items = [];
            dialog.down('grid').store.data.items.forEach(function (item) {
                items.push({
                    field: item.data.field,
                    placeholder: item.data.placeholder,
                    type: item.data.type
                });
            });
            var data = {
                title: dialog.down('textfield[name="title"]').getValue(),
                items: items
            };
            if (!data.title || data.title.length == 0) {
                return false;
            }
            var orderFormStore = Ext.data.StoreManager.lookup('orderFormStore');

            if(!dialog.record) {
                orderFormStore.add(data);
                dialog.hide();
            }else{
                dialog.record.set(data);
                orderFormStore.setModel(dialog.record);
                orderFormStore.sync();
                dialog.hide();
            }
        }
        }
    ],
    listeners: {
        afterrender: function () {
            var grid = this.down('grid');
            if (this.record) {
                this.setTitle('编辑咨询分类');
                grid.getStore().setData(this.record.data.items);
                this.down('textfield[name="title"]').setValue(this.record.data.title);
            } else {
                this.setTitle('添加咨询分类');
                grid.getStore().setData([]);
            }
        }
    }
});
