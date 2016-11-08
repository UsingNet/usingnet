/**
 * Created by jhli on 16-2-23.
 */
Ext.define('Admin.view.settings.workingTime.WorkingTimeModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.workingtime',

    stores: {
        workingtime: {
            type: 'workingtime',
            autoLoad: true
        }
    },

    data: {}
});