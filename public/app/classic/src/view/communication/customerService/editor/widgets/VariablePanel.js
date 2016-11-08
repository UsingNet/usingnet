Ext.define('Admin.view.communication.customerService.editor.widgets.VariablePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'variablepanel',
    width: '100%',
    items: [{
        xtype: 'buttongroup',
        columns: 1,
        width: '100%',
        items: [
            {xtype:'button', text:'姓名 #name#', width: 120},
            {xtype:'button', text:'电话 #phone#', width: '100%'},
            {xtype:'button', text:'邮箱 #email#', width: '100%'},
            {xtype:'button', text:'日期 #date#', width: '100%'},
            {xtype:'button', text:'时间 #time#', width: '100%'}
        ],
        listeners: {
            afterrender: function() {
                this.items.each(function(btn) {
                    btn.addListener('click', function() {
                        //var editor = Ext.getCmp('messageEditor');
                        var editor = this.up('#editorContainer').down('textarea') || this.up('#editorContainer').down('htmleditor');
                        editor.setValue(editor.getValue() + this.text.split(' ')[1]);
                    });
                });
            }
        }
    }]
});
