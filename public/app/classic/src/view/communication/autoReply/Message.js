Ext.define('Admin.view.communication.autoReply.Message', {
    extend: 'Ext.panel.Panel',
    xtype: 'automessage',
    userCls: 'messages remote',
    //width: 360,
    //maxHeight: 500,
    padding: '10 0 10 0',
    tpl: '<div class="bubble" style="max-width: 350px; position: relative; margin-left: 10px;"><div class="arrows"></div><div class="message">{message}</div></div>',
    data: {
        message: ''
    }
});