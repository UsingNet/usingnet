/**
 * Created by henry on 16-5-4.
 */
Ext.define('Admin.store.settings.OrderFormItem', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.orderFormItem',

    model: 'Admin.model.settings.OrderFormItem',
    storeId: 'orderFormItemStore',

    sorters: [{
        property: 'id',
        direction: 'ASC'
    }],

    autoLoad: true,
    autoSync: true
});
