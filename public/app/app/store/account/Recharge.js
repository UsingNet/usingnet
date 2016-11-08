/**
 * Created by jhli on 16-01-14.
 */
Ext.define('Admin.store.account.Recharge', {
    extend: 'Admin.store.Base',
    storeId: 'storeRecharge',
    alias: 'store.accountRecharge',

    proxy: {
        type: 'rest',
        url: '/api/account/pay',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        }
    },

    sorters: [{
        property: 'id',
        direction: 'DESC'
    }],
    listeners: {

    }

});
