Ext.define('Admin.view.settings.members.MembersModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.members',
    stores: {
        members: {
            type: 'members'
        },
        tags: {
            type: 'tags'
        }
    }
});