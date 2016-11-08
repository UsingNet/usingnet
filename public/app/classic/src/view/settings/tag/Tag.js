/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.settings.tag.Tag', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.ux.colorpick.Field'
    ],
    xtype: 'tag',
    title: '标签管理',
    margin: 20,
    width: '100%',
    layout: 'fit',
    items: [{
        xtype: 'grid',
        cls: 'shadow',
        title: '标签管理',
        emptyText: '<center>暂未添加标签</center>',
        viewModel: {
            type: 'team'
        },
        bind: {
            store: '{tags}'
        },
        columns: [{
            xtype: 'rownumberer'
        }, {
            text: '标签',
            dataIndex: 'name',
            editor: 'textfield',
            flex: 2
        }, {
            text: '颜色',
            dataIndex: 'color',
            editor: 'colorfield',
            allowBlank: false,
            flex: 1,
            renderer: function (color, row, updateRocode) {
                var record = row.record || updateRocode;
                return record.toHtml();
                //return Ext.util.Format.format('<span style="background-color:\#{0};color:#FFF;padding:5px;border-radius:5px;">{1}</span>', color, record.data.name);
            }
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            items: [{
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
                    Ext.Msg.confirm('确定', '确定要删除这个标签吗?', function (btnId) {
                        if ('yes' === btnId) {
                            var store = grid.getStore();
                            var rec = grid.getStore().getAt(rowIndex);
                            store.remove(rec);
                        }
                    });
                }
            }]
        }],
        plugins: {
            ptype: 'rowediting',
            clicksToEdit: 2,
            listeners: {
                cancelEdit: function (rowEditing, context) {
                    if (context.record.phantom) {
                        rowEditing.grid.store.remove(context.record);
                    }
                }
            }
        },
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{tags}'
            },
            dock: 'bottom',
            displayInfo: true
        }],
        tools: [
            {
                text: '添加',
                xtype: 'button',
                iconCls: 'x-fa fa-plus',
                ui: 'soft-green',
                handler: function () {
                    var grid = this.ownerCt.up();
                    var model = Ext.create('Admin.model.Tag');
                    grid.store.add(model);
                    grid.plugins[0].startEdit(model, 1);
                }
            }
        ]
    }],
    listeners: {
        activate: function() {
            var status = Admin.data.Permission.get('contact.status')
            if (!status) {
                this.down('grid').setDisabled(true);
                Ext.Msg.alert('提醒', '需要升级至基础版或其以上的套餐才能使用客户标签功能！');
            }
        }
    }
});
