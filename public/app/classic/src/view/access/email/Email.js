/**
 * Created by jiahonglee on 2016/3/25.
 */
Ext.define('Admin.view.access.email.Email', {
    extend: 'Ext.container.Container',
    xtype: 'emailaccess',
    controller: 'emailaccess',
    items: [{
        xtype: 'panel',
        margin: 20,
        cls: 'shadow',
        title: '邮件接入',
        items: [{
            xtype: 'form',
            url: '/api/setting/mail',
            width: '60%',
            layout: 'vbox',
            defaultType: 'textfield',
            trackResetOnLoad: true,
            fieldDefaults: {
                margin: 10,
                labelWidth: 60,
                allowBlank: false
            },
            items: [{
                fieldLabel: '电子邮件',
                name: 'email',
                width: 290
            }, {
                fieldLabel: '密码',
                name: 'password',
                inputType: 'password',
                width: 290
            }, {
                xtype: 'fieldcontainer',
                margin: '20 0 0 0',
                width: '100%',
                layout: 'hbox',
                items: [{
                    xtype: 'tbtext',
                    text: '服务器主机名',
                    margin: '0 0 0 175'
                }, {
                    xtype: 'tbtext',
                    text: '端口',
                    margin: '0 0 0 130'
                }, {
                    xtype: 'tbtext',
                    text: 'SSL',
                    margin: '0 0 0 155'
                }]
            }, {
                xtype: 'fieldcontainer',
                width: '100%',
                margin: 10,
                fieldLabel: '发出',
                layout: 'hbox',
                fieldDefaults: {
                    margin: 0
                },
                items: [{
                    xtype: 'displayfield',
                    value: 'SMTP',
                    width: 50
                }, {
                    xtype: 'textfield',
                    margin: '0 0 0 20',
                    name: 'smtp'
                }, {
                    xtype: 'numberfield',
                    margin: '0 0 0 20',
                    name: 'smtp_port'
                }, {
                    xtype: 'combobox',
                    margin: '0 0 0 20',
                    name: 'smtp_mode',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'value'],
                        data: [
                            { name: '加密', value: 'ENCRYPTION' },
                            { name: '明文', value: 'EXPRESS' }
                        ]
                    }),
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value'
                }]
            }, {
                xtype: 'fieldcontainer',
                width: '100%',
                margin: 10,
                fieldLabel: '接收',
                layout: 'hbox',
                fieldDefaults: {
                    margin: 0,
                    allowBlank: true
                },
                items: [{
                    xtype: 'displayfield',
                    value: 'IMAP',
                    width: 50
                }, {
                    xtype: 'textfield',
                    margin: '0 0 0 20',
                    name: 'imap'
                }, {
                    xtype: 'numberfield',
                    margin: '0 0 0 20',
                    name: 'imap_port'
                }, {
                    xtype: 'combobox',
                    margin: '0 0 0 20',
                    name: 'imap_mode',
                    store: Ext.create('Ext.data.Store', {
                        fields: ['name', 'value'],
                        data: [
                            { name: '加密', value: 'ENCRYPTION' },
                            { name: '明文', value: 'EXPRESS' }
                        ]
                    }),
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value'
                }]
            }]
        }],
        tbar: [{
            xtype: 'tbtext',
            hidden: true,
            text: '请完成以下设置，即可使用邮件功能。',
            style: {
                color: 'red'
            }
        }, {
            xtype: 'tbtext',
            hidden: true,
            text: '接入成功。',
            style: {
                color: 'green'
            }
        }, {
            xtype: 'tbtext',
            hidden: true,
            style: {
                color: 'red'
            }
        }],
        bbar: [{
            text: '重置',
            ui: 'soft-blue',
            handler: function() {
                this.up('panel').fireEvent('afterrender');
            }
        }, {
            text: '提交',
            ui: 'soft-green',
            handler: function() {
                var me = this;
                var form = this.up('panel').down('form').getForm();
                if (!form.isDirty()) {
                    Ext.Msg.alert('错误', '表单数据没有更新。');
                    return;
                }
                if (form.isValid()) {
                    Admin.data.Team.set('mail', form.getFieldValues());
                    Admin.data.Team.sync();
                } else {
                    Ext.Msg.alert('错误', '请正确填写表单！');
                }
            }
        }]
    }],
    listeners: {
        beforerender: function(container) {
            var me = this;
            Admin.data.Team.on('mailReady', function() {
                me.fireEvent('activate', me);
            });
            container.query('toolbar').forEach(function(item) {
                if ('bottom' === item.dock) {
                    item.setDisabled(true);
                }
            });
        },
        activate: 'containerActivate'
    }
});
