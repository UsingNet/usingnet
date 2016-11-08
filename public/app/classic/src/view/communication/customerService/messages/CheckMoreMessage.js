Ext.define('Admin.view.communication.customerService.messages.CheckMoreMessage', {
    extend: 'Ext.panel.Panel',
    xtype: 'checkmoremessage',
    width: '100%',
    data: {
        message: '查看更多'
    },
    tpl: ' ',
    items: [],
    listeners: {
        render: function(panel) {
            this.add({
                xtype: 'container',
                data: this.config.data,
                tpl: '<a>{message}</a>',
                userCls: 'historybanner'
            });
            panel.body.on('click', function() {
                panel.config.click();
            });
        }
    }
});
