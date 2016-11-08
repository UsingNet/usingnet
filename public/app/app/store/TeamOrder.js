/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.TeamOrder', {
    extend: 'Admin.store.Base',
    alias: 'store.teamorder',
    model: 'Admin.model.communication.service.Order',
    storeId: 'taemorderStore',
    proxy: {
        type: 'rest',
        url: '/api/team/order',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }

});