/**
 * Created by jhli on 16-01-15.
 */
Ext.define('Admin.view.statistics.orderStatistic.OrderStatisticModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.orderstatistic',

    stores: {
        orderstatistic: {
            type: 'orderstatistic'
        }
    },

    data: {}
});
