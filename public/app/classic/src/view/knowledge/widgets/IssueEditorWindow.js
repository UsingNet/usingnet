/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.view.knowledge.widgets.IssueEditorWindow', {
    extend: 'Ext.window.Window',
    width: '50%',
    height: '70%',
    autoShow: true,
    modal: true,
    layout: 'fit',
    items: [{
        xtype: 'form',
        margin: 20,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        fieldDefaults: {
            margin: 10,
            labelWidth: 70
        },
        items: [{
            fieldLabel: '问题',
            xtype: 'textfield',
            name: 'title',
            allowBlank: false
        }, {
            fieldLabel: '关键字',
            xtype: 'textfield',
            name: 'keywords',
            emptyText: '关键字以，分隔'
        }, {
            fieldLabel: '答案',
            xtype: 'htmleditor',
            name: 'message',
            flex: 1
        }]
    }],
    bbar: ['->', {
        xtype: 'button',
        text: '重置',
        ui: 'soft-blue',
        handler: function() {
            var win = this.up('window');
            var form = win.down('form').getForm();
            if (win.record) {
                var data = Ext.Object.merge({}, win.record.data);
                data.keywords = data.keywords.join('，');
                form.setValues(data);
            } else {
                form.setValues({
                    title: '',
                    message: '',
                    keywords: ''
                });
            }
        }
    }, {
        xtype: 'button',
        text: '提交',
        ui: 'soft-green',
        handler: function() {
            var win = this.up('window');
            var form = win.down('form');
            if (form.isValid()) {
                var writeType = win.record ? 'PUT' : 'POST';
                var recordId = win.record ? win.record.data._id : '';
                var data = form.getValues();
                Admin.data.Knowledge.fireEvent('writeIssuesData', data, writeType, recordId);
            }
        }
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Knowledge.on('refreshIssuesData', function() {
                me.close();
            });
        },
        afterrender: function() {
            var me = this;
            if (me.record) {
                me.setTitle('编辑问答');
                var data = Ext.Object.merge({}, me.record.data);
                data.keywords = data.keywords.join('，');
                me.down('form').getForm().setValues(data);
            } else {
                me.setTitle('添加问答');
            }
        }
    }
});
