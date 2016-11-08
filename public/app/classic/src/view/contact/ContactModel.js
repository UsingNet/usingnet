/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.contact.ContactModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.contact',

    stores: {
        contacts:{
            type:'contacts'
        },
        tags:{
            type:'tags',
            autoSync:true
            //asynchronousLoad : false
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});