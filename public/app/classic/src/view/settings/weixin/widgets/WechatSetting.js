Ext.define('Admin.view.settings.weixin.widgets.WechatSetting', {
    extend: 'Ext.window.Window',
    title: '设置',
    autoShow: true,
    width: 600,
    modal: true,
    layout: 'fit',
    items: [{
        xtype: 'form',
        fieldDefaults: {
            labelWidth: 110
        },
        margin: 20,
        width: '100%',
        items: [{
            xtype: 'textfield',
            hidden: true,
            name: 'id'
        }, {
            xtype: 'textfield',
            fieldLabel: '客服服务器URL',
            width: '100%',
            name: 'url',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'Token',
            width: '100%',
            name: 'token',
            allowBlank: false
        }, {
            xtype: 'combobox',
            fieldLabel: '传输方式',
            displayField: 'key',
            valueField: 'value',
            store: Ext.create('Ext.data.Store', {
                data: [{
                    key: '明文传输',
                    value: 'EXPRESS'
                }, {
                    key: '加密传输',
                    value: 'ENCRYPTION'
                }]
            }),
            width: '100%',
            name: 'mode',
            allowBlank: false
        }, {
            xtype: 'textfield',
            fieldLabel: 'EncodingAesKey',
            width: '100%',
            name: 'encoding_aes_key',
            allowBlank: true
        }, {
            xtype: 'checkbox',
            boxLabel: '需要用微信主动联系客户',
            name: 'use_template_message',
            margin: '0 0 0 115',
            inputValue: 1,
            uncheckedValue: 0
        }, {
            xtype: 'displayfield',
            value: '注意：勾选此项将把贵司微信公众号的行业修改为“IT软件与服务”。',
            margin: '0 0 0 115'
        }]
    }],
    bbar: ['->', {
        text: '关闭',
        ui: 'soft-blue',
        handler: function() {
            this.up('window').close();
        }
    }, {
        text: '保存',
        ui: 'soft-green',
        handler: function() {
            var form = this.up('window').down('form');
            if (form.isValid()) {
                form.submit({
                    url: '/api/setting/wechat/' + this.up('window').record.id,
                    method: 'PUT',
                    success: function(po, res) {
                        Ext.Msg.alert('成功', '保存成功！');
                        form.up('window').grid.store.load();
                    },
                    failure: function(po, res) {
                        Ext.Msg.alert('错误', res.result ? res.result.msg : '服务器错误。');
                    }
                });
            }
        }
    }],
    listeners: {
        afterrender: function() {
            var form = this.down('form').getForm();
            var data = this.record.data;
            form.setValues(data);
        }
    }
});
