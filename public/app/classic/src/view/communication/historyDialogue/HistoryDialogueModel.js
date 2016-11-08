/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.HistoryDialogueModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.historydialogue',

    stores: {
        //historydialogue: {
        //    type: 'historydialogue',
        //    autoLoad: true
        //},
        historychatrecord: {
            type: 'historychatrecord',
            autoLoad: true
        }
    },
    data: {}
});