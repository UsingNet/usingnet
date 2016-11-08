Ext.define('Admin.view.settings.members.Members', {
    extend: 'Ext.container.Container',
    xtype: 'members',
    layout: 'fit',
    scrollable: true,
    viewModel: {
        type: 'members'
    },
    items: [{
        xtype: 'grid',
        id: 'membersGrid',
        margin: 20,
        cls: 'shadow',
        title: '团队设置',
        tools: [{
            text: '添加',
            xtype: 'button',
            iconCls: 'fa fa-plus',
            ui: 'soft-green',
            handler: function() {
                Ext.create('Admin.view.settings.members.widgets.MembersRecordEditorWindow');
            }
        }],
        bind: {
            store: '{members}'
        },
        columns: [{
            xtype: 'rownumberer'
        }, {
            text: '姓名',
            dataIndex: 'name',
            width: 150
        }, {
            text: '邮箱',
            dataIndex: 'email',
            width: 300
        }, {
            text: '标签',
            dataIndex: 'tags',
            flex: 1,
            renderer: function(value, cls, record, rowIndex, columnIndex, store, grid) {
                var tags = null;
                if (record && record.data && record.data.source_tags) {
                    tags = record.data.source_tags;
                } else {
                    tags = [];
                }
                var colorField = [];
                for (var i = 0; i < tags.length; i++) {
                    colorField.push(Ext.util.Format.format('<span style="background-color: \#{0}; color: #FFF; padding: 5px; border-radius: 5px; margin-left: 2px;">{1}</span>', tags[i].color, tags[i].name));
                }
                return colorField.join('');
            }
        }, {
            text: '角色',
            dataIndex: 'role',
            width: 100,
            renderer: function(value, cls, record, rowIndex, columnIndex, store, grid) {
                var roleMap = {
                    MEMBER: '客服',
                    MANAGE: '管理员',
                    MASTER: '所有者'
                };
                return roleMap[value];
            }
        }, {
            text: '密码',
            dataIndex: 'password',
            width: 100,
            renderer: function(value, cls, record, rowIndex, columnIndex, store, grid) {
                return '******';
            }
        }, {
            text: '操作',
            align: 'center',
            xtype: 'actioncolumn',
            width: 100,
            items: [{
                iconCls: 'x-fa fa-edit',
                tooltip: '编辑',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    Ext.create('Admin.view.settings.members.widgets.MembersRecordEditorWindow', {
                        record: rec
                    });
                },
                isDisabled: function(tableView, row, colum, button, record) {
                    var role = Admin.data.User.get('role');
                    var userId = Admin.data.User.get('id');
                    if ('MASTER' === role) {
                        return false;
                    }
                    if ('MANAGE' === role && 'MANAGE' === record.data.role && userId === record.data.id) {
                        return false;
                    }
                    if ('MANAGE' === role && 'MEMBER' === record.data.role) {
                        return false;
                    }
                    return true;
                }
            }, {
                iconCls: 'x-fa fa-times-circle',
                tooltip: '删除',
                handler: function(grid, rowIndex, colIndex) {
                    Ext.Msg.confirm('确定', '确定要删除这个团队成员吗?', function(btnId) {
                        if ('yes' === btnId) {
                            var store = grid.getStore();
                            var rec = grid.getStore().getAt(rowIndex);
                            store.remove(rec);
                        }
                    });
                },
                isDisabled: function(tableView, row, colum, button, record) {
                    var role = Admin.data.User.get('role');
                    var userId = Admin.data.User.get('id');
                    if ('MASTER' === role && userId !== record.data.id) {
                        return false;
                    }
                    if ('MANAGE' === role && 'MEMBER' === record.data.role) {
                        return false;
                    }
                    return true;
                }
            }]
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{members}'
            },
            dock: 'bottom',
            displayInfo: true
        }]
    }]
});
