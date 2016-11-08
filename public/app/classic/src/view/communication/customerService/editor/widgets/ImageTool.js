Ext.define('Admin.view.communication.customerService.editor.widgets.ImageTool', {
    extend: 'Ext.button.Button',
    xtype: 'imagetool',
    tooltip: '图片',
    html: '<span class="fa fa-image"></span>',
    handler: function() {
        var dialog = Ext.create('Ext.window.Window', {
            layout: 'fit',
            autoDestory: true,
            autoShow: true,
            modal: true,

            width: 400,
            title: '发送图片',
            items: [{
                xtype: 'form',
                padding: 10,
                items: [{
                    xtype: 'filefield',
                    name: 'file',
                    fieldLabel: '图片',
                    labelWidth: 50,
                    msgTarget: 'none',
                    allowBlank: false,
                    anchor: '100%',
                    buttonText: '选择图片',
                    listeners: {
                        change: function(field, value, eOpts) {
                            var reg = /^.*\.(gif|png|bmp|jpg|jpeg)$/i;
                            if (!reg.test(value)) {
                                Ext.Msg.alert('错误', '只允许上传 jpeg,bmp,png,gif 格式的图片!');
                                field.setRawValue('');
                                return;
                            }
                            var size = Math.ceil(field.el.dom.querySelector('input[type=file]').files[0].size / 1024);
                            if (size > 4096) {
                                Ext.Msg.alert('错误', '只允许上传10M以内的文件!');
                                field.setRawValue('');
                            }
                        }
                    }
                }]
            }],
            buttons: [{
                text: '发送',
                ui: 'soft-green',
                handler: function() {
                    var dialog = this.up().up();
                    var form = dialog.items.get(0).getForm();
                    if (form.isValid()) {
                        form.submit({
                            url: '/api/upload',
                            waitMsg: '正在发送，请稍后...',
                            success: function(fp, o) {
                                var data = Ext.decode(o.response.responseText);
                                if (data.success) {
                                    dialog.data = data.data;
                                    dialog.close();
                                } else {
                                    dialog.data = null;
                                    Ext.Msg.alert('发送失败', data.msg);
                                }
                            },
                            failure: function(fp, o) {
                                dialog.data = null;
                                Ext.Msg.alert('图片发送失败', o.result && o.result.msg ? o.result.msg : '服务器错误，请稍后重试。');
                            }
                        });
                    }
                }
            }, {
                text: '取消',
                ui: 'soft-blue',
                handler: function() {
                    this.data = null;
                    this.up().up().close();
                }
            }]
        });
        dialog.on('close', function() {
            if (this.data) {
                var comboBox = Ext.getCmp('sendTypeCombo');
                var linkTool = this;
                Ext.Ajax.request({
                    url: '/api/message/agent',
                    method: 'POST',
                    //async: false,
                    jsonData: Ext.JSON.encode({
                        type: comboBox.getValue(),
                        to: (comboBox.workOrder.contact ? comboBox.workOrder.contact.id : null) || comboBox.workOrder.to,
                        body: this.data
                    })
                });
                Ext.getCmp('sendTypeCombo').up('customerservice').down('textarea').focus();
            }
        });
    }
});
