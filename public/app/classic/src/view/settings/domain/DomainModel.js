/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.settings.domain.DomainModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.domain',

    stores: {
        domains:{
            type:'domains',
            autoLoad: false
        },
        dns:{
            type:'emailDns',
            autoLoad: false
        }
        /*
        A declaration of Ext.data.Store configurations that are first processed as binds to produce an effective
        store configuration. For example:

        users: {
            model: 'Domain',
            autoLoad: true
        }
        */
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});