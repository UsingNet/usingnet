Ext.define('Admin.view.communication.customerService.editor.BaseEditor', {
    extend: 'Ext.panel.Panel',
    xtype: 'baseeditor',

    listeners: {
        afterrender: function(panel) {
            // var messageEditor = Ext.getCmp('messageEditor');
            var me = this;
            var messageEditor = panel.down('textarea') || panel.down('htmleditor');
            if (messageEditor) {
                messageEditor.addListener('keypress', function(self, e){
                    me.fireEventArgs('inputKeypress', [panel, e])
                });
            }
        },
        inputKeypress:function(self, e){
            var messageEditor = self.down('textarea') || self.down('htmleditor');
            var customerservice = this.up('customerservice');
            if (e.ctrlKey == customerservice.sendWithCtrl && (13 === e.keyCode || 10 === e.keyCode)) {
                //Ext.getCmp('sendMessageBtn').handler();
                self.down('sendbtn').handler();
                e.preventDefault(false);
                return false;
            } else if (e.ctrlKey != customerservice.sendWithCtrl && (13 === e.keyCode || 10 === e.keyCode)) {
                //var textarea = Ext.getCmp('messageEditor');
                var textarea = messageEditor;
                textarea.setValue(textarea.value + '\n');
                e.preventDefault(false);
                return false;
            }
        }
    }
});
