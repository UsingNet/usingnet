Ext.define('Admin.view.communication.customerService.chat.TrackWindowModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.trackwindowmodel',
    stores: {
        track: {
            type: 'track',
            autoLoad: false
        }
    },
    data: {}
});