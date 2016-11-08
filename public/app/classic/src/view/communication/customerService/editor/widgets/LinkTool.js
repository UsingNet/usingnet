Ext.define('Admin.view.communication.customerService.editor.widgets.LinkTool', {
    extend: 'Ext.button.Button',
    xtype: 'linktool',
    tooltip: '链接',
    html: '<span class="fa fa-link"></span>',
    handler: function() {
        var dialog = Ext.create('Ext.window.Window', {
            layout: 'fit',
            autoDestory: true,
            modal: true,
            autoShow: true,

            width: 400,
            title: '添加连接',
            items: [{
                xtype: 'form',
                padding: 10,
                defaultType: 'textfield',
                layout: 'anchor',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: '连接名称',
                    labelWidth: 60,
                    name: 'name',
                    allowBlank: false
                }, {
                    fieldLabel: '连接路径',
                    labelWidth: 60,
                    emptyText: '按照如下格式填写: https://www.baidu.com/',
                    name: 'href',
                    vtype: 'url',
                    allowBlank: false
                }, {
                    xtype: 'tbtext',
                    hidden: true,
                    text: '请按照如下URL格式填写：http://www.example.com',
                    style: {
                        marginLeft: '60px',
                        color: '#CF4C35'
                    }
                }]
            }],
            buttons: [{
                text: '确定',
                ui: 'soft-green',
                handler: function() {
                    var form = this.up().up().items.get(0);
                    var errorText = form.down('tbtext');
                    if (!form.isValid()) {
                        errorText.show();
                        return false;
                    }
                    errorText.hide();
                    this.up().up().data = form.getValues();
                    this.up().up().close();
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
                var panel = Ext.getCmp('sendTypeCombo').up('customerservice');
                var messageEditor = panel.down('textarea') || panel.down('htmleditor');
                messageEditor.setValue(messageEditor.value + '<a target="_blank" href="' + this.data.href + '">' + this.data.name + '</a>');
                messageEditor.focus();
            }
        });
    }
});
