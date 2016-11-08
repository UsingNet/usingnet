/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.view.account.recharge.RechargeModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.recharge',

    stores: {
        pay: {
            type: 'accountRecharge',
            autoLoad: true
        }
    },

    data: {}
});
