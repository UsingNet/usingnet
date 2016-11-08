Ext.define('Admin.view.communication.autoReply.AutoReplyController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.autoreplycontroller',

    switchComponet: function(me) {
        var modify = me.up().down('#modify');
        modify.on('click', function() {
            if (me.hidden) {
                me.show();
            } else {
                me.hide();
            }
        });
    }
});
