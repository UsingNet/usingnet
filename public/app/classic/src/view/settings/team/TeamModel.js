/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.view.settings.team.TeamModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.team',

    stores: {
        tags: {
            type: 'tags',
            autoLoad: true
        },
        domain: {
            type: 'domains',
            autoLoad: false
        }
        /*
        A declaration of Ext.data.Store configurations that are first processed as binds to produce an effective
        store configuration. For example:

        users: {
            model: 'Team',
            autoLoad: true
        }
        */
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});
