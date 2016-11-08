/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.media.Voice', {
    extend: 'Admin.store.Base',
    storeId: 'storeVoice',
    alias: 'store.mediaVoice',

    model: 'Admin.model.media.Voice',
    proxy: {
        type: 'rest',
        url: '/api/media/voice',
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
        write: function() {
            if (Ext.getCmp('voiceUploadWin')) {
                Ext.getCmp('voiceUploadWin').close();
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
