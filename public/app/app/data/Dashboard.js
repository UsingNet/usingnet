/**
 * Created by jhli on 16-3-11.
 */
Ext.define('Admin.data.Dashboard', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    requestTypes: ['lump', 'agent', 'ordertrend', 'visitor', 'online'],

    constructor: function() {
        var me = this;
        me.callParent(arguments);
    },

    get: function(key) {
        var keys = key.split('.');
        var rVal = this.store;
        Ext.Array.each(keys, function(i) {
            if (rVal) {
                rVal = rVal[i];
            }
        });
        if (typeof rVal === 'undefined' && typeof this.store[keys[0]] === 'undefined') {
            this.loadSubModule(keys[0]);
        }
        return rVal;
    },

    inSync: {},

    loadSubModule: function(type) {
        var me = this;
        if (me.inSync[type]) {
            return;
        }
        if (me.requestTypes.indexOf(type) >= 0) {
            me.inSync[type] = true;
            Ext.Ajax.request({
                url: '/api/dashboard/' + type,
                success: function(response) {
                    me.inSync[type] = false;
                    var res = Ext.decode(response.responseText);
                    if (res.success) {
                        if (res.data) {
                            me.store[type] = res.data;
                        } else {
                            delete res.success;
                            delete res.code;
                            me.store[type] = res;
                        }
                        me.fireEvent(type + 'ready');
                    }
                },
                failure: function() {
                    me.inSync[type] = false;
                }
            });
        }
    },

    listeners: {
        init: function() {
            var me = this;
            Ext.Array.each(me.requestTypes, function(type) {
                me.loadSubModule(type);
            });
        },
        realtimedata: function() {
            var me = this;
            var store = me.store;
            if (store.agent) {
                delete store.agent;
            }
            if (store.online) {
                delete store.online;
            }
            me.get('agent');
            me.get('online');

            me.lastUpdateTime = Date.parse(new Date());
            clearInterval(me.intervalId);
            me.intervalId = setInterval(function() {
                var now = Date.parse(new Date());
                if ((now - me.lastUpdateTime) > 60000) {
                    me.fireEvent('realtimedata');
                }
            }, 60000);
        }
    }
});
