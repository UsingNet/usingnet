Ext.define('Admin.view.account.teamApprove.module.EditableForm', {
    extend: 'Ext.form.Panel',
    xtype: 'editableform',
    margin: 20,
    requires: [
        'Admin.view.account.teamApprove.module.TeamApproveImage'
    ],
    defaultType: 'textfield',
    fieldDefaults: {
        allowBlank: false,
        width: '45%'
    },
    items: [{
        fieldLabel: '公司名称',
        name: 'company_name',
        emptyText: '与营业执照上保持一致'
    }, {
        fieldLabel: '公司地址',
        name: 'company_address',
        emptyText: '与营业执照上保持一致'
    }, {
        fieldLabel: '行业',
        name: 'industry',
        emptyText: '与营业执照上保持一致'
    }, {
        xtype: 'fieldcontainer',
        fieldLabel: '组织机构号',
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            name: 'organization_number'
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'displayfield',
            value: '9位数字'
        }]
    }, {
        hidden: true,
        name: 'organization_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
        xtype: 'form',
        items: [{
            xtype: 'filefield',
            allowBlank: true,
            width: '10%',
            fieldLabel: '组织机构证',
            buttonText: '上传',
            name: 'file',
            buttonOnly: true,
            listeners: {
                change: 'uploadImage'
            }
        }]
    }, {
        xtype: 'teamapproveimage'
    }, {
        xtype: 'fieldcontainer',
        fieldLabel: '税务登记号',
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            name: 'tax_number'
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'displayfield',
            value: '15位数字'
        }]
    }, {
        hidden: true,
        name: 'tax_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
        xtype: 'form',
        items: [{
            xtype: 'filefield',
            allowBlank: true,
            width: '10%',
            fieldLabel: '税务登记证',
            buttonText: '上传',
            name: 'file',
            buttonOnly: true,
            listeners: {
                change: 'uploadImage'
            }
        }]
    }, {
        xtype: 'teamapproveimage'
    }, {
        xtype: 'fieldcontainer',
        fieldLabel: '营业执照号',
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            name: 'license_number'
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'displayfield',
            value: '15位数字'
        }]
    }, {
        hidden: true,
        name: 'license_certificate',
        listeners: {
            change: 'dispalyFieldImgChange'
        }
    }, {
        xtype: 'form',
        items: [{
            xtype: 'filefield',
            allowBlank: true,
            width: '10%',
            fieldLabel: '营业执照',
            buttonText: '上传',
            name: 'file',
            buttonOnly: true,
            listeners: {
                change: 'uploadImage'
            }
        }]
    }, {
        xtype: 'teamapproveimage'
    }, {
        fieldLabel: '法定代表',
        name: 'legal_person'
    }, {
        fieldLabel: '公司电话',
        name: 'telphone',
        regex: /^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/,
        regexText: '格式不正确'
    }, {
        fieldLabel: '公司网站',
        name: 'website',
        regex: /[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+/,
        regexText: '格式不正确',
        allowBlank: true
    }, {
        xtype: 'fieldcontainer',
        fieldLabel: '联系人手机号',
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            name: 'phone',
            id: 'contactphone',
            itemId: 'phone',
            width: 200
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'displayfield',
            value: '联系人手机号用于接收审核结果变更通知'
        }]
    }, {
        xtype: 'fieldcontainer',
        fieldLabel: '手机验证码',
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            id: 'testcode',
            width: 200
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'button',
            text: '发送验证码',
            handler: function () {
                var me = this;
                var phone = this.up('editableform').down('#phone');
                if (phone.value) {
                    Ext.Ajax.request({
                        url: '/api/veritication/phone',
                        method: 'POST',
                        jsonData: Ext.encode({
                            phone: phone.value
                        }),
                        success: function (response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            me.setDisabled(true);
                            var endTime = Date.parse(new Date()) + 90000;
                            me.intervalId = setInterval(function () {
                                var now = Date.parse(new Date());
                                var second = (endTime - now) / 1000;
                                if (!second) {
                                    clearInterval(me.intervalId);
                                    me.setText('发送验证码');
                                    me.setDisabled(false);
                                    return;
                                }
                                me.setText('剩余' + second + '秒');

                            }, 1000);
                        },
                        failure: function (response) {
                            Ext.Msg.alert('错误', '服务器错误！');
                        }
                    });
                }
            }
        }]
    }]
});
