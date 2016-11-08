Ext.define('Admin.view.communication.customerService.messages.SmsMessage', {
    extend: 'Admin.view.communication.customerService.messages.ImMessage',
    xtype: 'smsmessage',
    data: {
        time: '',
        message: '',
        remote: false,
        display: 'none'
    },
    tpl: '<div class="time"><span>{time}</span></div>' + '<div style="display: {display};" class="fa fa-spinner fa-spin smsSending"></div>' + '<div class="bubble"><div class="message">{message}</div></div>',
    constructor:function() {
        var me = this;
        me.callParent(arguments);

        var data = me.metaData;

        if(!me.data.display) {
            me.data.display = !data.isTail && 'SEND' === data.direction ? 'block' : 'none';
        }
    }
});
