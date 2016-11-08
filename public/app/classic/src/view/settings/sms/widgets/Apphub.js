/**
 * Created by henry on 15-12-29.
 */
Ext.define('Admin.view.settings.sms.widgets.Apphub', {
    extend: 'Ext.panel.Panel',
    xtype: 'apphub',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    cls: 'shadow',
    bodyPadding: 20,
    title: '绑定团队手机',
    items: [{
        xtype: 'form',
        url: '/api/team',
        id: 'apphubform',
        defaultType: 'textfield',
        height: 350,
        flex: 2,
        items: [{
            fieldLabel: '手机号码',
            name: 'phone',
            allowBlank: false
        }, {
            xtype: 'displayfield',
            fieldLabel: '二维码',
            id: 'qrcode',
            value: '<img src=""/>',
            width: 105
        }, {
            xtype: 'displayfield',
            fieldLabel: '下载APP',
            value: '<img src=""/>',
            width: 105
        }]
    }, {
        flex: 1,
        items: [{
            html: '<h4>什么是团队手机?</h4>'
        }, {
            html: '团队手机是客服使用短信方式回复客户的唯一通道。所有客户收到的客服短信都来自于此号码。'
        }, {
            html: '<h4>使用团队手机有什么好处?</h4>'
        }, {
            html: '绑定团队手机，可是使客户在与客户沟通时，选择使用短信方式回复客户，避开模板短信需要审核的麻烦。客户也可以直接回复短信与客服沟通。统一的回复号码，可以提高客户对公司的认可程度。'
        }, {
            html: '<h4>如何绑定团队手机?</h4>'
        }, {
            html: '1、填写需要绑定的团队手机号码；'
        }, {
            html: '2、扫描下载二维码，下载App；'
        }, {
            html: '3、安装，并打开App；'
        }, {
            html: '4、点击App中的“扫码登录”；'
        }, {
            html: '5、为手机连接上电源线，并保持在稳定的Wifi环境中。'
        }]
    }],
    bbar: [
        '->', {
            text: '重置',
            ui: 'soft-blue',
            handler: function() {
                this.up('apphub').fireEvent('beforerender');
            }
        }, {
            text: '保存',
            ui: 'soft-green',
            formBind: true,
            handler: function() {
                var values = Ext.getCmp('apphubform').getValues();
                Admin.data.Team.set('sms', values);
                Admin.data.Team.sync();
            }
        }
    ],
    listeners: {
        afterrender: function() {
            var self = this;
            Admin.data.Team.addListener('sync', function() {
                self.fireEvent('beforerender');
            });
        },
        beforerender: function() {
            var items = Ext.getCmp('apphubform').items.items;
            var smsInfo = Admin.data.Team.get('sms');
            if(smsInfo){
                Ext.Array.forEach(items, function(field) {
                    if (field.name) {
                        field.setValue(smsInfo[field.name]);
                    }
                });
            }

            Ext.Ajax.request({
                url: '/api/message/agent?type=SMS',
                success: function(response) {
                    var res = Ext.JSON.decode(response.responseText);
                    if (200 === res.code) {
                        var token = res.data;
                        var qr = Admin.view.settings.team.Qrcode.init()(10, 'M');
                        console.log('{"url":"ws://ws.' + location.host.replace('app.', '') + '/ws?","token":"' + token + '"}');
                        qr.addData('{"url":"ws://ws.' + location.host.replace('app.', '') + '/ws?","token":"' + token + '"}');
                        qr.make();
                        Ext.getCmp('qrcode').setValue('<img style="border: 1px solid #D0D0D0;" src="' + qr.createImgTag().match(/src="(.*?)"/)[1] + '"/>');
                    }
                }
            });
        }
    }
});
