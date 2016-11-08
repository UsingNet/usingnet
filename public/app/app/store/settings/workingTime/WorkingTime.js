/**
 * Created by jhli on 16-2-23.
 */
Ext.define('Admin.store.settings.workingTime.WorkingTime', {
    extend: 'Admin.store.Base',
    alias: 'store.workingtime',
    model: 'Admin.model.settings.workingTime.WorkingTime',
    storeId: 'workingtimestore',

    proxy: {
        type: 'rest',
        url: '/api/setting/holiday',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json'
        }
    },
    sorters: [{
        property: 'id',
        direction: 'DESC'
    }],
    autoLoad: true,
    autoSync: true
});
