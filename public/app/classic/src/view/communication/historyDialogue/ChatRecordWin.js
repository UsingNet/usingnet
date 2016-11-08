/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.ChatRecordWin', {
    extend: 'Ext.window.Window',
    autoShow: true,
    autoDestroy: true,
    width: '80%',
    height: '80%',
    modal: true,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'historychatwin',
        cls: 'shadow',
        width: 800,
        margin: '20 0 20 20',
        title: '对话记录'
    }, {
        xtype: 'historycustomerinfo',
        margin: '20 20 20 10',
        cls: 'shadow',
        flex: 1,
        title: '客户信息'
    }]
});