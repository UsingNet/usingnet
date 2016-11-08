/**
 * Created by jhli on 15-12-23.
 */
Ext.define('Admin.data.Team', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    updateStore: {},
    constructor: function() {
        var self = this;
        self.callParent(arguments);
        self.loadSubmodule('base');
    },

    inSync: {},

    loadSubmodule: function(type) {
        var self = this;
        if (self.inSync[type]) {
            return;
        }
        var requestType = ['web', 'sms', 'wechat', 'mail', 'voip', 'plugin', 'base'];
        if (requestType.indexOf(type) >= 0) {
            self.inSync[type] = true;
            Ext.Ajax.request({
                url: '/api/setting/' + type,
                success: function(response) {
                    self.inSync[type] = false;
                    var res = Ext.decode(response.responseText);
                    if (200 === res.code) {
                        if ('base' === type) {
                            Ext.Object.merge(self.store, res.data);
                        } else {
                            self.store[type] = res.data;
                        }
                        self.fireEvent('sync');
                        self.fireEvent(type + 'Ready');
                    }
                },
                failure: function() {
                    self.inSync[type] = false;
                }
            });
        }
    },

    get: function(key) {
        var keys = key.split('.');
        var rVal = this.store;
        Ext.Array.each(keys, function(i) {
            if (rVal) {
                rVal = rVal[i];
            }
        });
        if (typeof(rVal) == 'undefined' && typeof(this.store[keys[0]]) == 'undefined') {
            this.loadSubmodule(keys[0]);
        }
        return rVal;
    },

    set: function(key, value) {
        this.updateStore[key] = value;
    },
    setBatch: function(values) {
        this.updateStore = values;
    },
    sync: function() {
        var self = this;
        var subModules = ['web', 'sms', 'wechat', 'mail', 'voip', 'plugin'];
        var syncCount = 0;
        var withError = null;

        var showMsg = function() {
            if (withError) {
                Ext.Msg.alert("错误", withError.msg);
            } else {
                //Ext.Msg.alert("成功", "保存成功");
                Admin.view.widgets.BubbleMessage.alert('保存成功');
            }
        };

        Ext.Array.each(subModules, function(subModule) {
            (function(subModule) {
                if (self.updateStore[subModule]) {
                    syncCount++;
                    Ext.Ajax.request({
                        url: '/api/setting/' + subModule,
                        method: 'POST',
                        params: self.updateStore[subModule],
                        success: function(response) {
                            syncCount--;
                            var res = Ext.decode(response.responseText);

                            if (!res.success) {
                                withError = {
                                    success: false,
                                    code: res.code,
                                    msg: res.msg
                                };
                            } else {
                                if ('base' === subModule) {
                                    self.store = res.data;
                                } else {
                                    self.store[subModule] = res.data;
                                }
                                self.fireEvent('sync');
                                self.fireEvent(subModule + 'Ready');
                            }

                            if (syncCount == 0) {
                                showMsg();
                            }
                        },
                        failure: function() {
                            syncCount--;
                            withError = {
                                success: false,
                                code: 500,
                                msg: '服务器错误'
                            };
                            if (syncCount == 0) {
                                showMsg();
                            }
                        }
                    });
                    delete self.updateStore[subModule];
                }
            })(subModule);
        });

        //if (!Ext.Object.isEmpty(self.updateStore)) {
        //    syncCount++;
        //    Ext.Ajax.request({
        //        url: '/api/setting/base',
        //        method: 'POST',
        //        params: self.updateStore,
        //        success: syncSuccess,
        //        failure: syncFailure
        //    });
        //    self.updateStore = {};
        //}
    }
});
