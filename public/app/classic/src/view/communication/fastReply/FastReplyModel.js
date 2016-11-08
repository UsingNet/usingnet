/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.view.communication.fastReply.FastReplyModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.fastreply',

    stores: {
        fastreply: {
            type: 'fastreply'
        }
    },

    data: {}
});
