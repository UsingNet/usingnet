Ext.define('Admin.view.access.sms.Sms', {
    extend: 'Ext.container.Container',
    xtype: 'smsaccess',
    items: [{
        xtype: 'panel',
        margin: 20,
        cls: 'shadow',
        title: '回访短信设置',
        items: [{
            xtype: 'form',
            layout: 'vbox',
            items: [{
                xtype: 'textfield',
                name: 'signature',
                labelWidth: 60,
                fieldLabel: '短信签名',
                allowBlank: false,
                margin: 10
            }, {
                xtype: 'displayfield',
                margin: 10,
                value: '注：应工信部要求，所有106号段发送的短信都需要添加短信签名。此短信签名将会出现在发送回访短信的开头处。'
            }]
        }],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                xtype: 'tbtext',
                hidden: true,
                style: {
                    color: 'red'
                }
            }, {
                xtype: 'tbtext',
                text: '接入成功。',
                hidden: true,
                style: {
                    color: 'green'
                }
            }]
        }, {
            xtype: 'toolbar',
            disabled: true,
            dock: 'bottom',
            items: [{
                text: '重置',
                ui: 'soft-blue',
                handler: function() {
                    var container = this.up('container');
                    container.fireEvent('activate', container);
                }
            }, {
                text: '提交',
                ui: 'soft-green',
                handler: function() {
                    var form = this.up('panel').down('form');
                    if (form.isValid()) {
                        Admin.data.Team.set('sms', form.getForm().getValues());
                        Admin.data.Team.sync();
                    }

                }
            }]
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Team.on('smsReady', function() {
                me.fireEvent('activate', me);
            });
        },
        activate: function(container) {
            var smsPermission = Admin.data.Permission.get('chat.sms');
            var data = Admin.data.Team.get('sms');

            if (data) {
                if (smsPermission.status) {
                    container.down('form').getForm().setValues(data);
                    container.query('toolbar').forEach(function(item) {
                        if ('top' === item.dock) {
                            item.items.getAt(1).show();
                        } else {
                            item.setDisabled(false);
                        }
                    });
                } else {
                    var need = smsPermission.need;
                    var prompt = '';
                    if (3 === need.length) {
                        prompt = '要使用短信功能，请购买专业版或其以上的套餐，进行并通过团队认证。';
                    }

                    if (2 === need.length && 'PLAN' === need[0]) {
                        prompt = '要使用短信功能，请购买专业版或其以上的套餐。';
                    }

                    if (2 === need.length && 'IDENTITY' === need[0]) {
                        prompt = '要使用短信功能，请进行并通过团队认证。';
                    }

                    if (1 === need.length) {
                        container.query('toolbar').forEach(function(item) {
                            if ('top' === item.dock) {
                                item.items.items.forEach(function(subitem) {
                                    subitem.hide();
                                });
                                item.items.getAt(0).show();
                                if ('INIT' === data.status) {
                                    item.items.getAt(0).setText('请设置短信签名并提交审核！');
                                } else if ('CKECKING' === data.status) {
                                    item.items.getAt(0).setText('正在审核，请耐心等待！');
                                } else if ('FAIL' === data.status) {
                                    item.items.getAt(0).setText('审核失败，失败原因是：' + data.fail_message ? data.fail_message : '未知原因，请联系客服咨询！');
                                }
                            } else {
                                item.setDisabled(false);
                            }
                        });
                    }

                    if (prompt) {
                        container.query('toolbar').forEach(function(item) {
                            if ('top' === item.dock) {
                                item.items.items.forEach(function(subitem) {
                                    subitem.hide();
                                });
                                item.items.getAt(0).setText(prompt);
                                item.items.getAt(0).show();
                            }
                        });
                    }
                }
            }
        }
    }
});
