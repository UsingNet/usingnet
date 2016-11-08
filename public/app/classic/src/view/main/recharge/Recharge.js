Ext.define('Admin.view.main.recharge.Recharge', {
    extend: 'Ext.window.Window',
    title: '充值',
    autoShow: true,
    width: 700,
    modal: true,
    bodyPadding: 20,
    items: [{
        xtype: 'form',
        layout: 'vbox',
        items: [{
            xtype: 'fieldcontainer',
            fieldLabel: '充值金额',
            labelWidth: 60,
            width: '80%',
            layout: 'hbox',
            items: [{
                xtype: 'numberfield',
                width: '90%',
                minValue: 1,
                maxValue: 1000000,
                allowBlank: false
            }, {
                xtype: 'splitter'
            }, {
                xtype: 'displayfield',
                value: '元'
            }]
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '充值方式',
            labelWidth: 60,
            width: '100%',
            layout: 'hbox',
            items: [{
                xtype: 'radio',
                height: 74,
                name: 'type',
                inputValue: 'alipay',
                checked: true
            }, {
                xtype: 'image',
                src: './resources/images/recharge/alipay.jpg',
                width: 272,
                height: 74
            }, {
                xtype: 'radio',
                height: 74,
                name: 'type',
                inputValue: 'tenpay',
                disabled: true
            }, {
                xtype: 'image',
                style: {
                    '-webkit-filter': 'grayscale(100%)',
                    '-moz-filter': 'grayscale(100%)',
                    '-ms-filter': 'grayscale(100%)',
                    '-o-filter': 'grayscale(100%)',
                    'filter': 'gray'
                },
                src: './resources/images/recharge/wechat.jpg',
                width: 272,
                height: 74
            }]
        }]
    }, {
        xtype: 'displayfield',
        style: {
            wordBreak: 'break-all'
        },
        width: '100%',
        fieldLabel: '推荐有礼',
        labelWidth: 60,
        value: '把链接推荐给新用户，可以获取优惠。推荐链接：http://www.usingnet.com?invite=' + Admin.data.User.get('token')
    }],
    buttons: ['->', {
        text: '充值',
        ui: 'soft-green',
        handler: function() {
            var money = this.up('window').down('numberfield').getValue();
            var type = this.up('window').down('form').getForm().getValues().type;
            if (money) {
                window.open('/api/account/pay/to?money=' + money + '&type=' + type);
            }
            this.up('window').close();
            Ext.Msg.show({
                title: '充值',
                closable: false,
                message: '请确认你的充值情况。',
                buttonText: {
                    ok: '充值失败',
                    no: '充值成功'
                },
                icon: Ext.Msg.QUESTION,
                fn: function(btn) {
                    Admin.data.Team.loadSubmodule('base');
                    location.hash = '#recharge';
                }
            });
        }
    }]
});
