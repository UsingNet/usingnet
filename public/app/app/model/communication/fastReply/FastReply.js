/**
 * Created by jhli on 16-02-04.
 */
Ext.define('Admin.model.communication.fastReply.FastReply', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string'},
        //{ name: 'team_id', type: 'string'},
        { name: 'title', type: 'string'},
        { name: 'content', type: 'string'}
        //{ name: 'created_at', type: 'string'},
        //{ name: 'updated_at', type: 'string'}
    ]

});
