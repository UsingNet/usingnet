/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.media.SmsPoll', {
    extend: 'Admin.store.Base',
    storeId: 'storeSmsPoll',
    alias: 'store.mediaSmsPoll',
    autoSync: false,
    model: 'Admin.model.media.SmsPoll',
    proxy: {
        type: 'rest',
        url: '/api/system/sms',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        }
    },
    sorters: [{
        property: 'id',
        direction: 'AES'
    }]

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
