/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.media.Article', {
    extend: 'Admin.store.Base',
    storeId: 'storeArticle',
    alias: 'store.mediaArticle',

    model: 'Admin.model.media.Article',
    proxy: {
        type: 'rest',
        url: '/api/media/article',
        reader: {
            type: 'json',
            rootProperty: 'data',
            totalProperty: 'total'
        },
        writer: {
            type: 'json'
        }
    },

    sorters: [{
        property: 'id',
        direction: 'DESC'
    }],
    listeners: {
        write: function(store, operation, eOpts) {
            if (Ext.getCmp('articleEditor')) {
                Ext.getCmp('articleEditor').close();
            }
        }
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
