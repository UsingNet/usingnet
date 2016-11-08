/**
 * Created by henry on 16-5-4.
 */
Ext.define('Admin.store.settings.OrderForm', {
    extend: 'Admin.store.Base',

    alias: 'store.orderForm',

    model: 'Admin.model.settings.OrderForm',
    storeId: 'orderFormStore',

    proxy: {
        type: 'rest',
        url: '/api/setting/order',
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
        direction: 'ASC'
    }],

    autoLoad: true,
    autoSync: true
});
