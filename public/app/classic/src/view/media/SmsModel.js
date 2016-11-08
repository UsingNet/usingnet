/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.SmsModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.sms',

    stores: {
        /*
        A declaration of Ext.data.Store configurations that are first processed as binds to produce an effective
        store configuration. For example:

        users: {
            model: 'Sms',
            autoLoad: true
        }
        */
        sms: {
            type: 'mediaSms'
        },
        mediaSmsPoll:{
            type: 'mediaSmsPoll'
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});
