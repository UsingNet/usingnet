/**
 * Created by henry on 15-12-29.
 */
Ext.define('Admin.view.settings.weixin.widgets.DeveloperAccessDialog', {
    extend:'Ext.window.Window',
    title: '开发者接入',
    xtype:'developerAccessDialog',
    autoDestroy: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    modal: true,
    width: '50%',
    bodyPadding: '5 20 0 20',
    items: [{
        xtype: 'panel',
        style: {
            borderBottom: '1px solid #D0D0D0'
        },
        html:
        '<div>' +
            '<h3 style="margin: 0;">配置说明</h3>' +
            '<ol style="margin: 10px;">' +
                '<li style="margin: 5px;">登陆<a target="_blank" href="https://mp.weixin.qq.com/cgi-bin/loginpage?t=wxm2-login&lang=zh_CN">微信公众平台</a> -> 左侧导航 -> 基本配置；</li>' +
                '<li style="margin: 5px;">将基本配置中的“应用ID”，“应用密钥”，“令牌”，“消息加解密密钥”填写到以下表单中，将以下表单中生成的“服务器地址”配置到微信公众平台，“备注”填写你需要备注的自定义信息；</li>' +
                '<li style="margin: 5px;">兼容多客服系统，请参看<a target="_blank" href="http://dkf.qq.com/">多客服文档</a>。</li>' +
                '<li style="margin: 5px;">常用语言多客服SDK链接：' +
                    '<a target="_blank" href="https://github.com/overtrue/wechat">PHP</a> ' +
                    '<a target="_blank" href="https://github.com/foxinmy/weixin4j">JAVA</a> ' +
                    '<a target="_blank" href="https://github.com/wechat-python-sdk/wechat-python-sdk">Python</a> ' +
                    '<a target="_blank" href="https://github.com/JeffreySu/WeiXinMPSDK">.NET</a>' +
                '</li>' +
            '</ol>' +
        '</div>'
    }, {
        xtype: 'form',
        margin: '10 0 0 0',
        flex:1,
        defaults: {
            anchor: '100%'
        },
        id: 'weixinForm',
        defaultType: 'textfield',
        url: '/api/wechat/auth',
        items: [{
            xtype: 'tbtext',
            text: '开发者ID',
            padding: 0,
            style: {
                fontWeight: 'bold',
                height: '30px'
            }
        }, {
            fieldLabel: '应用ID',
            name: 'app_id',
            allowBlank: false,
            emptyText:'AppID',
            listeners: {
                change: function() {
                    this.up('form').getForm().findField('serverAddress').setValue('http://app.usingnet.com/api/wechat/callback/' + this.value);
                }
            }
        }, {
            fieldLabel: '应用密钥',
            name: 'app_secret',
            allowBlank: false,
            emptyText:'AppSecret'
        }, {
            xtype: 'tbtext',
            text: '服务器配置',
            padding: 0,
            style: {
                fontWeight: 'bold',
                height: '30px'
            }
        }, {
            fieldLabel: '服务器地址',
            name: 'serverAddress',
            allowBlank: true,
            emptyText: '请先填写应用ID',
            editable: false
        }, {
            fieldLabel: '令牌',
            name: 'token',
            allowBlank: false,
            emptyText:'Token'
        }, {
            fieldLabel: '消息加解密密钥',
            name: 'encoding_aes_key',
            allowBlank: false,
            emptyText:'EncodingAESKey'
        }, {
            fieldLabel: '备注',
            name: 'nick_name',
            allowBlank: false,
            emptyText:'仅显示在后台'
        }, {
            xtype: 'tbtext',
            html: '请填写接口配置信息，此信息需要你拥有自己的服务器资源。<br>填写的URL需要正确响应微信发送的Token验证，请阅读<a target="_blank" href="http://mp.weixin.qq.com/wiki/index.php?title=%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97">接入指南</a>。',
            padding: 0,
            style: {
                fontWeight: 'bold',
                height: '40px'
            }
        }, {
            fieldLabel: 'URL',
            name: 'url',
            allowBlank: false,
            emptyText:'URL'
        }],


        item: [{
            fieldLabel: '服务器地址',
            name: 'url',
            allowBlank: true,
            emptyText: 'url'
        }, {
            fieldLabel: '昵称',
            name: 'nick_name',
            allowBlank: false,
            emptyText:'仅显示在后台'
        }, {
            fieldLabel: '应用ID',
            name: 'app_id',
            allowBlank: false,
            emptyText:'AppID'
        }, {
            fieldLabel: '应用密钥',
            name: 'app_secret',
            allowBlank: false,
            emptyText:'AppSecret'
        }, {
            fieldLabel: '令牌',
            name: 'token',
            allowBlank: false,
            emptyText:'Token'
        }, {
            fieldLabel: '消息加解密密钥',
            name: 'encoding_aes_key',
            allowBlank: false,
            emptyText:'EncodingAESKey'
        }
        //    ,{
        //    xtype:'panel',
        //    html:'注：如上信息都可以在微信公众平台，开发者的基本设置中找到。'
        //}
        ]
    }],
    bbar: [
        '->', {
            text: '保存',
            ui: 'soft-green',
            formBind: true,
            handler: function() {
                var form = Ext.getCmp('weixinForm').getForm(),
                    fieldValues = form.getFieldValues();
                if (form.isValid()) {
                    Admin.data.Team.set('wechat', fieldValues);
                    Admin.data.Team.sync();
                    this.up('developerAccessDialog').close();
                }
            }
        }
    ]
});
