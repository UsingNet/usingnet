/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.media.Sms', {
    extend: 'Admin.store.Base',
    storeId: 'storeSms',
    alias: 'store.mediaSms',

    model: 'Admin.model.media.Sms',
    proxy: {
        type: 'rest',
        url: '/api/media/sms',
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
            if (Ext.getCmp('smsEditor')) {
                Ext.getCmp('smsEditor').close();
            }
        }
    },

    addSystemTpl:function(id, opts){
        if(typeof(opts) == 'undefined' || !opts){
            opts = {};
        }
        var self = this;
        Ext.Ajax.request({
            url:'/api/media/sms',
            params:{
                system_media_id: id
            },
            success:function(response){
                var obj = Ext.decode(response.responseText);
                if(obj['success'] && opts['success'] && typeof(opts['success']) == 'function'){
                    opts['success'](obj);
                    self.reload();
                }
                if(!obj['success'] && opts['failure'] && typeof(opts['failure']) == 'function'){
                    opts['failure'](obj);
                }
                return false;
            },
            failure:function(obj){
                if(opts['failure'] && typeof(opts['failure']) == 'function'){
                    opts['failure']({});
                }
            }
        });
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
