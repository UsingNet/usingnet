/**
 * Created by jhli on 16-01-22.
 */
Ext.define('Admin.view.account.consumption.ConsumptionModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.consumption',
    stores: {
        bill: {
            type: 'consumption',
            autoLoad: true
        }
    },
    data: {}
});
