/**
 * Created by jhli on 15-11-23.
 */

Ext.define('Admin.view.communication.customerService.messages.NoteMessage', {
    extend: 'Ext.panel.Panel',
    xtype: 'notemessage',
    width: '80%',
    style: {
        margin: '0 auto'
    },
    data: {
        message: '',
        remote: false
    },
    userCls: 'messages',
    items: [],
    tpl: '<p style="text-align: center;"><span style="background: orange;border-radius: 6px;padding:0 10px;">备注: {time} {message}</span></p>',
    constructor:function() {
        var me = this;
        me.callParent(arguments);
        if (!me.data) {
            me.data = {};
        }
        var data = me.metaData;

        if(!me.data.time){
            me.data.time = Admin.data.Tools.CustomTools.formatTime(data.created_at * 1000);
        }
        if(!me.data.message){
            me.data.message = data.body;
        }
        if(!me.data.remote){
            me.data.remote = 'SEND' !== data.direction;
        }
    }
});
