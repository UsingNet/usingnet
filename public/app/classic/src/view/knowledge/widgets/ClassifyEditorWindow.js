/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.view.knowledge.widgets.ClassifyEditorWindow', {
    extend: 'Ext.window.Window',
    width: '50%',
    height: '50%',
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
            fieldLabel: '分类名称',
            xtype: 'textfield',
            name: 'title',
            allowBlank: false
        }, {
            fieldLabel: '分类描述',
            xtype: 'textarea',
            name: 'description',
            flex: 1
        }]
    }],
    bbar: ['->', {
        xtype: 'button',
        text: '重置',
        ui: 'soft-blue',
        handler: function() {
            var win = this.up('window');
            var form = win.down('form');
            form.getForm().setValues(win.record ? win.record.data.metadata : {
                title: '',
                description: ''
            });
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
                var recordId = win.record ? win.record.data.id : '';
                var data = form.getValues();
                Admin.data.Knowledge.fireEvent('writeClassifyData', data, writeType, recordId, win.record);
            }
        }
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Knowledge.on('refreshClassifyData', function() {
                me.close();
            });
        },
        afterrender: function() {
            var me = this;
            if (me.record) {
                me.setTitle('编辑分类');
                me.down('form').getForm().setValues(me.record.data.metadata);
            } else {
                me.setTitle('添加分类');
            }
        }
    }
});
