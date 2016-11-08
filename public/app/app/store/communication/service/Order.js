/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.store.communication.service.Order', {
    extend: 'Ext.data.Store',
    storeId: 'orderStore',
    alias: 'store.order',


    model: 'Admin.model.communication.service.Order',
    proxy: {
        type: 'rest',
        url: '/api/order',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        }
    },
    autoSync: true,
    autoLoad: true

    /*
    Uncomment to use a specific model class
    model: 'User',
    */

    /*
    Fields can also be declared without a model class:
    fields: [
        {name: 'firstName', type: 'string'},
        {name: 'lastName',  type: 'string'},
        {name: 'age',       type: 'int'},
        {name: 'eyeColor',  type: 'string'}
    ]
    */

    /*
    Uncomment to specify data inline
    data : [
        {firstName: 'Ed',    lastName: 'Spencer'},
        {firstName: 'Tommy', lastName: 'Maintz'},
        {firstName: 'Aaron', lastName: 'Conran'}
    ]
    */
});
