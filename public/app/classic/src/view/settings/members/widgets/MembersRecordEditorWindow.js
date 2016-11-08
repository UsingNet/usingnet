Ext.define('Admin.view.settings.members.widgets.MembersRecordEditorWindow', {
    extend: 'Ext.window.Window',
    width: 500,
    height: 350,
    autoShow: true,
    modal: true,
    viewModel: {
        type: 'members'
    },
    items: [{
        xtype: 'form',
        margin: 20,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaultType: 'textfield',
        fieldDefaults: {
            labelWidth: 40,
            margin: 10,
            allowBlank: false
        },
        items: [{
            fieldLabel: '姓名',
            name: 'name'
        }, {
            fieldLabel: '邮箱',
            name: 'email',
            vtype: 'email'
        }, {
            fieldLabel: '标签',
            xtype: 'tagfield',
            itemId: 'tags',
            name: 'tags',
            displayField: 'name',
            valueField: 'name',
            bind: {
                store: '{tags}'
            },
            allowBlank: true
        }, {
            fieldLabel: '角色',
            xtype: 'combobox',
            itemId: 'role',
            name: 'role',
            displayField: 'name',
            valueField: 'value'
        }, {
            fieldLabel: '密码',
            name: 'password',
            itemId: 'password'
        }]
    }],
    bbar: [{
        text: '重置',
        ui: 'soft-blue',
        handler: function() {
            var window = this.up('window');
            window.fireEvent('afterrender', window);
        }
    }, {
        text: '保存',
        ui: 'soft-green',
        handler: function() {
            var me = this;
            var window = me.up('window');
            var form = window.down('form');
            if (form.isValid()) {
                Ext.Ajax.request({
                    url: '/api/member' + (window.record ? '/' + window.record.data.id : ''),
                    method: window.record ? 'PUT' : 'POST',
                    jsonData: Ext.encode(form.getForm().getValues()),
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (!res.success) {
                            Ext.Msg.alert('错误', res.msg);
                            return;
                        } else {
                            Admin.view.widgets.BubbleMessage.alert('保存成功');
                            window.close();
                            Ext.getCmp('membersGrid').getStore().reload();
                        }
                    },
                    failure: function() {
                        Ext.Msg.alert('错误', '保存失败，服务器错误！');
                    }
                });
            }
        }
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            var form = me.down('form');
            var combo = form.down('#role');
            var password = form.down('#password');
            var record = me.record;
            var role = Admin.data.User.get('role');
            var userId = Admin.data.User.get('id');

            if (record) {
                // 编辑
                me.setTitle('编辑团队成员');
                if ('MASTER' === role && userId !== record.data.id) {
                    combo.setStore(Ext.create('Ext.data.Store', {
                        data: [
                            { name: '管理员', value: 'MANAGE' },
                            { name: '客服', value: 'MEMBER' }
                        ]
                    }));
                } else {
                    combo.setStore(Ext.create('Ext.data.Store', {
                        data: [
                            { name: '所有者', value: 'MASTER' },
                            { name: '管理员', value: 'MANAGE' },
                            { name: '客服', value: 'MEMBER' }
                        ]
                    }));
                    combo.setDisabled(true);
                }

                if ('MANAGE' === role && 'MANAGE' === record.data.role && userId !== record.data.id) {
                    password.setDisabled(true);
                }

                form.getForm().setValues(record.data);
                password.setValue('******');
            } else {
                // 新增
                me.setTitle('添加团队成员');
                if ('MASTER' === role) {
                    combo.setStore(Ext.create('Ext.data.Store', {
                        data: [
                            { name: '管理员', value: 'MANAGE' },
                            { name: '客服', value: 'MEMBER' }
                        ]
                    }));
                } else {
                    combo.setStore(Ext.create('Ext.data.Store', {
                        data: [
                            { name: '客服', value: 'MEMBER' }
                        ]
                    }));
                }
            }
        }
    }
});
