/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.view.settings.members.AccessModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.access',
    requires: [
        'Admin.store.statistics.Access'
    ],
    stores: {
        access: {
            type: 'access',
            autoLoad: true
        },
        track: {
            type: 'track',
            autoLoad: true
        }
    },
    data: {}
});
