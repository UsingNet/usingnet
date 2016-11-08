/**
 * Created by jiahonglee on 2016/4/1.
 */
Ext.define('Admin.data.Permission', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    constructor: function() {
        var self = this;
        self.callParent(arguments);
        self.loadMetadata();
        self.on('metadataupdated', function() {
            self.loadMetadata();
        });
    },

    loadMetadata: function() {
        var self = this;
        Ext.Ajax.request({
            url: '/api/setting/function',
            async: false,
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (res.success) {
                    self.store = res;
                }
            }
        });
    },

    get: function(key) {
        var keys = key.split('.');
        var rVal = this.store;
        Ext.Array.each(keys, function(i) {
            if (rVal) {
                rVal = rVal[i];
            }
        });
        return rVal;
    }
});
