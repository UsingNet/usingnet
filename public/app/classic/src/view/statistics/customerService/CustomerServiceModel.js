/**
 * Created by jhli on 16-01-15.
 */
Ext.define('Admin.view.statistics.customerService.CustomerServiceModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.customerservice',
    stores: {
        customerservice: {
            type: 'customerservice'
        }
    },
    data: {}
});
