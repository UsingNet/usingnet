Ext.define('Admin.data.Identity', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: null,
    error: null,
    requires:['Admin.data.User'],
    constructor: function() {
        var self = this;
        if(Admin.data.User.get('role') != 'MASTER'){
            return false;
        }
        Ext.Ajax.request({
            url: '/api/account/identity',
            //async: false,
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (!res.success) {
                    self.error = res.msg;
                    return;
                }
                self.store = res.data;

                var panel = Ext.getCmp('teamapprove');
                if (panel) {
                    panel.controller.beforerender(panel);
                }

            },
            failure: function(response) {
                self.error = '服务器错误！';
            }
        });
    },
    get: function(key) {
        var store = this.store;
        var value = null;
        if (store) {
            value = store[key];
        }
        return value;
    },

    updateStore: function(store) {
        this.store = store;
    },

    sync: function() {
        var self = this;

        var syncSuccess = function(response) {
            var res = Ext.decode(response.responseText);
            if (!res.success) {
                Ext.Msg.alert('错误', res.msg);
                return;
            }else{
                Ext.Msg.alert('成功', '认证信息提交成功！');
            }
            self.constructor();
        };

        var syncFailure = function(response) {
            Ext.Msg.alert('错误', '服务器错误， 提交失败！');
        };

        Ext.Ajax.request({
            url: '/api/account/identity',
            method: 'POST',
            jsonData: Ext.encode(self.store),
            success: syncSuccess,
            failure: syncFailure
        });
    }

});
