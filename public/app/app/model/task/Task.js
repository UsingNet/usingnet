/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.model.task.Task', {
    extend: 'Ext.data.Model',
    // idProperty: '_id',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'assigners' },
        { name: 'receivers' },
        { name: 'media' },
        { name: 'team_id', type: 'string' },
        { name: 'initiator', type: 'string' },
        { name: 'store' }
        //{ name: 'updated_at', type: 'string' },
        //{ name: 'created_at', type: 'string' }
    ]
});
