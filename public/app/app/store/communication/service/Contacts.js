/**
 * Created by henry on 15-10-27.
 */
Ext.define('Admin.store.communication.service.Contacts', {

    extend: 'Ext.data.TreeStore',

    storeId: 'ServiceContacts',

    fields: [{
        name: 'name'
    }],


    root: {
        expanded: true,
        children: [
            {
                text: '张三',
                iconCls: 'x-fa fa-internet-explorer',
                leaf: true
            },
            {
                text: '李四',
                iconCls: 'x-fa fa-chrome',
                leaf: true
            },
            {
                text: '王五',
                iconCls: 'x-fa fa-safari',
                leaf: true
            },
            {
                text: '赵六',
                iconCls: 'x-fa fa-firefox',
                leaf: true
            },
            {
                text: '孙七',
                iconCls: 'x-fa fa-weixin',
                leaf: true
            },
            {
                text: '周八',
                iconCls: 'x-fa fa-weibo',
                leaf: true
            },
            {
                text: '吴久',
                iconCls: 'x-fa fa-mobile',
                leaf: true
            }
        ]
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