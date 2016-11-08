/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.Base', {
    extend: 'Ext.data.Store',

    autoLoad: true,
    autoSync: true,
    remoteSort: true,
    pageSize: 40,

    onCreateRecords: function(records, operation, success) {
        if (!success) {
            if (operation.getResponse()) {
                var res = Ext.JSON.decode(operation.getResponse().responseText);
                Ext.Msg.alert('错误', res.msg);
            } else if (operation.error && operation.error.status == 500) {
                Ext.Msg.alert('错误', '服务器错误！');
            }
        }
    },

    onUpdateRecords: function(records, operation, success) {
        if (!success) {
            if (operation.getResponse()) {
                var res = Ext.JSON.decode(operation.getResponse().responseText);
                Ext.Msg.alert('错误', res.msg);
            } else if (operation.error && operation.error.status == 500) {
                Ext.Msg.alert('错误', '服务器错误！');
            }
        }
    },

    listeners: {
        write: function(store, operation, eOpts) {
            store.reload();
        }
    }
});
