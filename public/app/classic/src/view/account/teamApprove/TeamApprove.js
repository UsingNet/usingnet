Ext.define('Admin.view.account.teamApprove.TeamApprove', {
    extend: 'Ext.panel.Panel',
    xtype: 'teamapprove',
    id: 'teamapprove',
    controller: 'teamapprove',
    scrollable: true,
    margin: 20,
    cls: 'shadow',
    title: '认证信息',
    items: [{
        xtype: 'panel',
        html: '<div style="padding: 20px;">' +
            '<ol>' +
            '<li style="margin: 10px;">公司认证后能使用更多的功能;</li>' +
            '<li style="margin: 10px;">认证后公司名称将作为今后开具发票的抬头。</li>' +
            '</ol>' +
            '</div>'
    }, {
        xtype: 'editableform'
    }, {
        xtype: 'readonlyform'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [{
            xtype: 'button',
            itemId: 'submitBtn',
            text: '提交审核',
            ui: 'soft-green',
            handler: function() {
                var form = this.up('teamapprove').down('editableform');
                var panel = this.up('teamapprove');
                if (form.isValid()) {
                    var phone = Ext.getCmp('contactphone').value;
                    var code = Ext.getCmp('testcode').value;
                    var store = form.getValues();
                    store.phone = phone;
                    store.code = code;
                    Admin.data.Identity.updateStore(store);
                    Admin.data.Identity.sync();
                    // Ext.Ajax.request({
                    //     url: '/api/identity',
                    //     method: 'POST',
                    //     jsonData: Ext.encode(form.getValues()),
                    //     success: function(response) {
                    //         var res = Ext.decode(response.responseText);
                    //         if (!res.success) {
                    //             Ext.Msg.alert('错误', res.msg);
                    //             return;
                    //         }
                    //         panel.controller.statusHandler(panel, res.data);
                    //         Ext.Msg.alert('成功', '提交成功，请耐心等待审核。');
                    //     },
                    //     failure: function() {
                    //         Ext.Msg.alert('错误', '服务器错误！');
                    //     }
                    // });
                } else {
                    Ext.Msg.alert('错误', '请正确填写认证信息。');
                }
            }
        }, {
            xtype: 'tbtext',
            itemId: 'statusText',
            style: {
                fontSize: '16px'
            },
            hidden: true
        }]
    }],
    listeners: {
        beforerender: 'beforerender'
    }
});
