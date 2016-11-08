/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.model.Message', {
    extend: 'Ext.data.Model',

    fields: [
        { name: '_id', type: 'string'},
        { name: 'type', type: 'string'},
        { name: 'form', type: 'string'},
        { name: 'to', type: 'string'},
        { name: 'body', type: 'string' },
        { name: 'created_at', type: 'int'},
        { name: 'peer'},
        { name: 'direction', type: 'string'},
        { name: 'package'}
    ]
});
