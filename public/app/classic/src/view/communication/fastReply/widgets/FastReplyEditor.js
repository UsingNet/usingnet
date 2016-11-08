/**
 * Created by jiahonglee on 2016/3/31.
 */
Ext.define('Admin.view.communication.fastReply.widgets.FastReplyEditor', {
    extend: 'Ext.window.Window',
    autoShow: true,
    width: 600,
    height: 400,
    title: '添加快捷回复',
    modal: true,
    bodyPadding: 20,
    layout: 'fit',
    items: [{
        xtype: 'textarea',
        fieldLabel: '内容',
        maxLength: 225,
        labelWidth: 40,
        allowBlank: false
    }, {
        xtype: 'displayfield',
        value: '还可以输入225个字',
        margin: '0 0 0 50',
        listeners: {
            afterrender: function() {
                var me = this;
                me.prev('textarea').on('change', function(textarea, newValue, oldValue, eOpts) {
                    var num = 225 - newValue.length;
                    me.setValue(num >= 0 ? '还可以输入' + num + '个字' : '字数超出限制');
                });
            }
        }
    }],
    listeners: {
        afterrender: function() {
            var record = this.metadata.record;
            if (record) {
                this.setTitle('编辑快捷回复');
                this.down('textarea').setValue(record.data.content);
            }
        }
    },
    bbar: ['->', {
        text: '保存',
        ui: 'soft-green',
        handler: function() {
            var win = this.up('window');
            var isNew = !win.metadata.record;
            var textarea = win.down('textarea');
            if (textarea.isValid()) {
                Ext.Ajax.request({
                    url: '/api/setting/quick-reply' + (isNew ? '' : '/' + win.metadata.record.id),
                    method: isNew ? 'POST' : 'PUT',
                    jsonData: Ext.encode({
                        content: textarea.getValue()
                    }),
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (!res.success) {
                            Ext.Msg.alert('错误', res.msg);
                            return;
                        }
                        win.close();
                        win.metadata.store.load();
                    },
                    failure: function() {
                        Ext.Msg.alert('错误', '服务器错误。');
                    }
                });
            }
        }
    }, {
        text: '取消',
        ui: 'soft-blue',
        handler: function() {
            this.up('window').close();
        }
    }]
});