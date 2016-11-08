/**
 * Created by jhli on 16-3-16.
 */
Ext.define('Admin.view.main.userInformation.widgets.UserSetting', {
    extend: 'Ext.panel.Panel',
    xtype: 'usersetting',
    title: '个人设置',
    cls: 'shadow',
    items: [{
        xtype: 'form',
        layout: 'responsivecolumn',
        defaultType: 'textfield',
        fieldDefaults: {
            labelWidth: 70
        },
        items: [{
            xtype: 'tbtext',
            text: '<b>状态设置</b>',
            width: '100%',
            padding: 0
        }, {
            xtype: 'fieldcontainer',
            layout: 'hbox',
            items: [{
                xtype: 'checkbox',
                itemId: 'autoOffline',
                name: 'auto_offline',
                inputValue: 1,
                uncheckedValue: 0
            }, {
                xtype: 'numberfield',
                width: 60,
                itemId: 'offlineTime',
                name: 'offline_time',
                minValue: 1,
                margin: '0 0 0 10'
            }, {
                xtype: 'displayfield',
                margin: '0 0 0 10',
                value: '分钟无操作时自动切换到离线状态'
            }]
        }, {
            xtype: 'tbtext',
            text: '<b>消息提醒声音设置</b>',
            width: '100%',
            padding: 0
        }, {
            xtype: 'fieldcontainer',
            width: '100%',
            fieldLabel: '声音类型',
            defaultType: 'radiofield',
            defaults: {
                width: 80
            },
            layout: 'hbox',
            items: [{
                boxLabel: '长',
                name: 'voiceType',
                inputValue: 'long'
            }, {
                boxLabel: '短',
                name: 'voiceType',
                inputValue: 'short'
            }]
        }, {
            xtype: 'fieldcontainer',
            width: '100%',
            fieldLabel: '提示方式',
            defaultType: 'radiofield',
            defaults: {
                width: 80
            },
            layout: 'hbox',
            items: [{
                boxLabel: '一次',
                name: 'remindType',
                inputValue: 'one'
            }, {
                boxLabel: '持续（间隔10秒提醒）',
                width: 200,
                name: 'remindType',
                inputValue: 'multi'
            }]
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.User.on('change', function() {
                me.fireEvent('afterrender');
            });
        },
        afterrender: function() {
            var me = this;
            var form = me.down('form').getForm();
            me.down('#autoOffline').setValue(Admin.data.User.get('extend.auto_offline'));
            me.down('#offlineTime').setValue(Admin.data.User.get('extend.offline_time'));

            form.findField('voiceType').setValue(Admin.data.User.get('extend.voiceType'));
            form.findField('remindType').setValue(Admin.data.User.get('extend.remindType'));
        }
    },
    bbar: [
        '->', {
            xtype: 'button',
            text: '保存',
            ui: 'soft-green',
            handler: function() {
                var values = this.up('usersetting').down('form').getValues();
                var obj = {};
                obj.extend = values;
                Admin.data.User.setBatch(obj, function() {
                    Admin.view.widgets.BubbleMessage.alert('保存成功！');
                }, function(res) {
                    Ext.Msg.alert('错误', res.msg ? res.msg : '保存失败！');
                });
            }
        }, {
            xtype: 'button',
            text: '关闭',
            ui: 'soft-blue',
            handler: function() {
                this.up('window').close();
            }
        }
    ]
});
