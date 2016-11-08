Ext.define('Admin.view.communication.customerService.editor.widgets.TemplateCombobox', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'templatecombobox',
    emptyText: '载入模板',
    listeners: {
        select: function(combo, record, eOpts) {
            var panel = Ext.getCmp('sendTypeCombo').up('customerservice');
            var messageEditor = panel.down('textarea') || panel.down('htmleditor');
            messageEditor.setValue(record.data.content);
            combo.select('');
        },
        expand: function(field, eOpts) {
            field.store.load();
        }
    }
});
