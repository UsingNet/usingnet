Ext.define('Admin.data.AutoReply', {
    singleton: true,

    store: null,

    constructor: function() {
        var me = this;
        Ext.Ajax.request({
            url: '/api/setting/auto-reply',
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (!res.success) {
                    return;
                }
                me.store = res.data;
            }
        });
    },

    get: function(key) {
        var store = this.store;
        if (store && key) {
            key = key.split('.');
            if (store[key[0]]) {
                var value = store;
                key.forEach(function(key) {
                    value = value[key]
                });
                return value
            }
        }
    },

    set: function(key,  value) {
        var store = this.store;

        if (store && key) {
            key = key.split('.');
            store[key[0]][key[1]] = value;
        }

        this.sync();
    },

    sync: function() {
        var me = this;
        var store = me.store;
        if (store) {
            Ext.Ajax.request({
                url: '/api/setting/auto-reply',
                method: 'POST',
                jsonData: Ext.encode(me.store),
                success: function(response) {
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert('错误', res.msg);
                        return;
                    }

                    Admin.view.widgets.BubbleMessage.alert('保存成功');

                    //var styleWin = Ext.Msg.alert();
                    //styleWin.el.dom.style.borderRadius = '2px';
                    //styleWin.el.dom.style.border = '3px solid #3C8DBC';
                    //styleWin.close();
                    //
                    //var alertWin = Ext.Msg.alert({
                    //    title: '成功',
                    //    message: '保存成功。',
                    //    modal: false,
                    //    closable: false
                    //});
                    //
                    //setTimeout(function() {
                    //    if (alertWin) {
                    //        alertWin.el.dom.style.border = '';
                    //        alertWin.el.dom.style.borderRadius = '4px';
                    //        alertWin.close();
                    //    }
                    //}, 1200);
                }
            });
        }

    }
});