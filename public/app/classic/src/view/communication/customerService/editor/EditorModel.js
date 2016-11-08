/**
 * Created by henry on 16-3-10.
 */
/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.communication.customerService.editor.EditorModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.mediaEditor',

    stores: {
        article:{
            type:'mediaArticle'
        },
        sms:{
            type:'mediaSms'
            //autoSync:true
            //asynchronousLoad : false
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});