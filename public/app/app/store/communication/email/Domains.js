/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.communication.email.Domains', {
    extend: 'Admin.proxy.Rest',
    alias: 'store.domains',
    model: 'Admin.model.communication.email.Domain',
    storeId: 'domainStore',
    proxy:{
        url:'/api/domain'
    }
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