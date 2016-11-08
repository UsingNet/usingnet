Ext.define('Admin.view.communication.customerService.editor.widgets.SendBtn', {
    extend: 'Ext.button.Split',
    xtype: 'sendbtn',
    text: '发送',
    ui: 'soft-green',
    showEmptyMenu: true,
    width: 100,
    menu: new Ext.menu.Menu({
        items: [{
            text: '按Enter发送',
            xtype: 'menucheckitem',
            handler: function () {
                var customerservice = this.up('customerservice');
                customerservice.sendWithCtrl = false;
                Admin.data.User.set("sendWithCtrl", customerservice.sendWithCtrl);
                this.setChecked(true);
                this.nextSibling().setChecked(false);
            },
            listeners: {
                render: function () {
                    this.setChecked(!this.up('customerservice').sendWithCtrl);
                }
            }
        }, {
            text: '按Ctrl+Enter发送',
            xtype: 'menucheckitem',
            handler: function () {
                var customerservice = this.up('customerservice');
                customerservice.sendWithCtrl = true;
                Admin.data.User.set("sendWithCtrl", customerservice.sendWithCtrl);
                this.setChecked(true);
                this.previousSibling().setChecked(false);
            },
            listeners: {
                render: function () {
                    this.setChecked(this.up('customerservice').sendWithCtrl);
                }
            }
        }]
    }),
    handler: function () {
        var workOrderNode = Ext.getCmp('treelist').getSelection();
        if (!workOrderNode) {
            Ext.Msg.alert('错误', '没有选择工单！');
            return;
        }

        var editor = this.up('#editorContainer').down('textarea') || this.up('#editorContainer').down('htmleditor');
        var comboBox = Ext.getCmp('sendTypeCombo');

        if (editor.getValue()) {
            var checkbox = this.up().down('#saveToTemplate');
            var title = this.up('#editorContainer').down('#titleEditor');
            if (checkbox && checkbox.value) {

                if (title && !title.value) {
                    Ext.Msg.alert('错误', '请输入模板标题！');
                    return;
                }
                var map = {
                    MAIL: Ext.data.StoreManager.lookup('mediaArticle') || Ext.create('Admin.store.media.Article')
                    //SMS: Ext.data.StoreManager.lookup('mediaSms') || Ext.create('Admin.store.media.Sms')
                };
                var store = map[comboBox.value];
                store.insert(0, {
                    title: title.getValue(),
                    content: editor.getValue()
                })
            }
            var lastValue = editor.getValue();
            var lastTitle = '';
            // if ('MAIL' !== comboBox.value) {
            //     editor.setValue('');
            // }

            editor.setValue('');
            if (title) {
                lastTitle = title.value;
                title.setValue('');
            }

            Ext.Ajax.request({
                url: '/api/message/agent',
                method: 'POST',
                jsonData: Ext.JSON.encode({
                    type: comboBox.value,
                    to: (comboBox.workOrder.contact ? comboBox.workOrder.contact.id : null) || comboBox.workOrder.to,
                    body: lastValue,
                    title: lastTitle
                }),
                success: function (response) {
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert('错误', res.msg);
                        editor.setValue(lastValue);
                        return;
                    }
                    if (res.connectors && typeof res.connectors.im == 'boolean' && !res.connectors.im) {
                        workOrderNode.fireEvent('remoteoffline');
                    }
                },
                failure: function() {
                    Ext.Msg.alert('错误', '服务器错误。');
                    editor.setValue(lastValue);
                }
            });
        }


    }
});
