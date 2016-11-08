/**
 * Created by henry on 16-3-10.
 */
Ext.define('Admin.store.email.Dns', {
    extend: 'Ext.data.Store',
    alias: 'store.emailDns',
    fields: ['key', 'type', 'value'],
    data: [],

    constructor: function() {
        var me = this;
        me.callParent(arguments);
        Admin.data.Team.addListener('sync', function() {
            var data = Admin.data.Team.get('mail.dns');
            if(data) {
                me.setData(data);
            }
        });
    }

});


