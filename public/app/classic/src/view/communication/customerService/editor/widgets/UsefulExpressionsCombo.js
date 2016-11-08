/**
 * Created by jhli on 16-3-21.
 */
Ext.define('Admin.view.communication.customerService.editor.widgets.UsefulExpressionsCombo', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'usefulexpressionscombo',
    viewModel: {
        type: 'usefulexpressions'
    },
    bind: {
        store: '{usefulexpressions}'
    },
    fieldLabel: '常用语',
    labelWidth: 45,
    queryMode: 'remote',
    pageSize: 40,
    displayField: 'content',
    tpl: Ext.create('Ext.XTemplate',
        '<ul class="x-list-plain" style="overflow-x: hidden;"><tpl for=".">',
            '<li role="option" class="x-boundlist-item" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">{content}</li>',
        '</tpl></ul>'
    ),
    // displayField: Ext.create('Ext.XTemplate',
    //     '<tpl for=".">',
    //         '{content}',
    //     '</tpl>'
    // ),
    anyMatch: true,
    matchFieldWidth: false,
    listConfig: {
        maxWidth: 700
    },
    dock: 'top',
    emptyText: '可输入搜索',
    valueField: 'id',
    listeners: {
        select: function(combo, record, eOpts) {
            this.up('editorContainer').down('textarea').setValue(record.data.content);
            //this.up('editorContainer').down('sendbtn').handler();
            this.setSelection(null);
            this.up('editorContainer').down('textarea').focus();
        },
        expand: function(field, eOpts) {
            field.getStore().load();
        }
    }
});