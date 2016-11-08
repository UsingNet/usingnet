/**
 * Created by jhli on 16-3-15.
 */
Ext.define('Admin.view.main.userInformation.widgets.UserData', {
    extend: 'Ext.panel.Panel',
    xtype: 'userdata',
    title: '个人信息',
    cls: 'shadow',
    items: [{
        xtype: 'form',
        layout: 'responsivecolumn',
        defaultType: 'textfield',
        fieldDefaults: {
            labelWidth: 120
        },
        items: [{
            xtype: 'displayfield',
            fieldLabel: '头像',
            margin: '60 0 0 0',
            width: '5%'
        }, {
            xtype: 'image',
            itemId: 'userImage',
            style: {
                marginLeft: '140px',
                borderRadius: '50%',
                cursor: 'pointer',
                border: '2px solid #3C8DBC',
                padding: '1px',
                width: '140px',
                height: '140px'
            },
            listeners: {
                syncSrc: function() {
                    this.next('#imgSrc').setValue(this.getSrc() + '-avatar');
                }
            }
        }, {
            xtype: 'form',
            url: '/api/upload',
            width: 140,
            height: 140,
            margin: '0 0 0 -160',
            style: {
                opacity: 0.01
            },
            items: [{
                xtype: 'filefield',
                buttonText: '上传',
                buttonOnly: true,
                buttonConfig: {
                    border: false
                },
                style: {
                    zoom: 10
                },
                height: '100%',
                width: '100%',
                name: 'file',
                listeners: {
                    change: function() {
                        var me = this;
                        var imgForm = me.up('form');
                        imgForm.submit({
                            waitMsg: '正在上传...',
                            success: function(form, action) {
                                var imgSrc = action.result.data;
                                var userImage = me.up('userdata').down('#userImage');
                                userImage.setSrc(imgSrc);
                                userImage.fireEvent('syncSrc');
                            }
                        });
                    }
                }
            }]
        }, {
            name: 'img',
            hidden: true,
            itemId: 'imgSrc'
        }, {
            name: 'name',
            itemId: 'userName',
            width: '100%',
            style: {
                marginTop: '10px'
            },
            fieldLabel: '用户名'
        }, {
            name: 'email',
            itemId: 'userEmail',
            fieldLabel: '邮箱',
            width: '100%'
        }, {
            xtype: 'fieldcontainer',
            width: '100%',
            margin: '0 0 20 0',
            items: [{
                xtype: 'button',
                text: '修改密码',
                margin: '0 0 0 125',
                handler: function() {
                    Ext.create('Ext.window.Window', {
                        autoShow: true,
                        title: '修改密码',
                        width: 300,
                        height: 200,
                        modal: true,
                        bodyPadding: 10,
                        items: [{
                            xtype: 'form',
                            layout: 'vbox',
                            defaultType: 'textfield',
                            fieldDefaults: {
                                labelWidth: 60,
                                allowBlank: false,
                                margin: '0 0 15 0'
                            },
                            items: [{
                                name: 'password',
                                width: '100%',
                                fieldLabel: '当前密码'
                            }, {
                                name: 'newpassword',
                                width: '100%',
                                fieldLabel: '新密码'
                            }, {
                                name: 'newpassword_confirmation',
                                width: '100%',
                                fieldLabel: '确认密码'
                            }]
                        }],
                        bbar: [
                            '->', {
                                xtype: 'button',
                                text: '保存',
                                ui: 'soft-green',
                                handler: function() {
                                    var form = this.up('window').down('form');
                                    if (form.isValid()) {
                                        var values = form.getValues();
                                        Admin.data.User.setBatch(values, function() {
                                            Admin.view.widgets.BubbleMessage.alert('保存成功！');
                                        }, function(res) {
                                            Ext.Msg.alert('错误', res.msg ? res.msg : '保存失败！');
                                        });
                                    }
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
                }
            }]
        }, {
            xtype: 'tbtext',
            text: '<b>用微信接收消息</b>',
            width: '100%',
            padding: 0
        }, {
            xtype: 'displayfield',
            fieldLabel: '用微信扫描二维码',
            margin: 0,
            width: 120
        }, {
            xtype: 'image',
            src: 'http://' + location.host + '/api/wechat/qrcode',
            style: {
                marginLeft: '140px',
                border: '2px solid #3C8DBC',
                padding: '1px',
                width: '140px',
                height: '140px'
            }
        }]
    }],
    bbar: [
        '->', {
            xtype: 'button',
            text: '保存',
            ui: 'soft-green',
            handler: function() {
                var values = this.up('userdata').down('form').getValues();
                Admin.data.User.setBatch(values, function() {
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
    ],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.User.on('change', function() {
                me.fireEvent('afterrender');
            });
        },
        afterrender: function() {
            var me = this;
            me.down('#userImage').setSrc(Admin.data.User.get('img'));
            me.down('#userName').setValue(Admin.data.User.get('name'));
            me.down('#userEmail').setValue(Admin.data.User.get('email'));
        }
    }
});
