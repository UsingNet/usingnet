/**
 * Created by henry on 15-12-16.
 */
Ext.define('Admin.data.User', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: null,
    render: false,

    set: function(key, value, success, failure) {
        var me = this;
        var i = 0;
        i++;
        Ext.Ajax.request({
            url: '/api/me/extend',
            method: 'POST',
            jsonData: Ext.JSON.encode({
                "key": key,
                "value": value
            }),
            success: function(response) {
                i--;
                var res = Ext.decode(response.responseText);
                if (res && res.success) {
                    me.fireEvent('change');
                    me.store['extend'][key] = value;
                    if (typeof(success) == 'function' && !i) {
                        success(res);
                    }
                } else {
                    if (typeof(failure) == 'function') {
                        failure(res);
                    }
                }
            },
            failure: function(response) {
                i--;
                if (typeof(failure) == 'function') {
                    failure(response);
                }
            }
        });
        return value;
    },
    setBatch: function(values, success, failure) {
        var me = this;
        Ext.Ajax.request({
            url: '/api/me',
            method: 'POST',
            jsonData: values,
            success: function(action, config) {
                var res = Ext.decode(action.responseText);
                if (res && res.success) {
                    for (var i in me.store) {
                        if (res.data[i]) {
                            me.store[i] = res.data[i];
                        }
                    }
                    if (typeof(success) == 'function') {
                        success(res, config);

                        me.fireEvent('change');
                    }
                } else {
                    if (typeof(failure) == 'function') {
                        failure(res, config);
                    }
                }
            },
            failure: function(action, config) {
                try {
                    var res = Ext.decode(action.responseText);
                    if (typeof(failure) == 'function') {
                        failure(res, config);
                    }
                } catch (e) {
                    if (typeof(failure) == 'function') {
                        failure(action, config);
                    }
                }
            }
        });
    },
    get: function(key) {

        var keys = key.split('.');
        var value = this.store;
        for (var i = 0; i < keys.length && value; i++) {
            value = value[keys[i]];
        }

        return value;
    },
    setStore: function(store) {
        this.store = store;
        this.fireEvent('change');
    },

    __offlineTiming: function() {
        var self = this;
        var doc = Ext.getDoc();
        if (self.get('extend.auto_offline') && '1' == Ext.util.Cookies.get('online')) {
            doc.on('mousemove', self.__retime, self);
            doc.on('mousedown', self.__retime, self);
            doc.on('keydown', self.__retime, self);
            self.__retime();
        } else {
            doc.un('mousemove', self.__retime, self);
            doc.un('mousedown', self.__retime, self);
            doc.un('keydown', self.__retime, self);
            if (self.timingId) {
                clearInterval(self.timingId);
                self.timingId = null;
            }
        }
    },

    __retime: function() {
        var self = this;
        if (self.timingId) {
            clearInterval(self.timingId);
            self.timingId = null;
        }
        var timing = 0;
        self.timingId = setInterval(function() {
            timing++;
            if (timing == self.get('extend.offline_time')) {
                self.fireEvent('offlinetimeup');
            }
        }, 60000);

    },

    constructor: function() {
        var self = this;
        self.callParent(arguments);

        self.on('change', self.__offlineTiming);
        self.on('onlinetiming', self.__offlineTiming);

        Ext.Ajax.request({
            url: '/api/me',
            async: false,
            success: function(response, eOpts) {
                var res = Ext.JSON.decode(response.responseText);
                if (401 === res.code) {
                    location.replace(res.data.login);
                } else {
                    self.render = true;
                    self.setStore(res.data);
                    // if ('undefined' === typeof self.get('extend.voiceType')) {
                    //     self.setBatch({
                    //         voiceType: 'short',
                    //         remindType: 'one',
                    //         auto_offline: 0,
                    //         offline_time:
                    //     });
                    // }


                    if (typeof self.get('extend.voiceType') == 'undefined') {
                        self.set('voiceType', 'short');
                    }
                    if (typeof self.get('extend.remindType') == 'undefined') {
                        self.set('remindType', 'one');
                    }
                    if (typeof self.get('extend.auto_offline') == 'undefined') {
                        self.set('auto_offline', 0);
                    }
                    if (typeof self.get('extend.offline_time') == 'undefined') {
                        self.set('offline_time', 30);
                    }
                }
            }
        });
    }

});
