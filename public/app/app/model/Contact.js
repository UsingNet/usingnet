/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.model.Contact', {
    extend: 'Ext.data.Model',
    // idProperty: '_id',
    fields: [
        { name: '_id', type: 'string'},
        { name: 'name', type: 'string'},
        { name: 'email', type: 'string'},
        { name: 'remark', type: 'string'},
        { name: 'phone', type: 'string'},
        { name: 'tags'}
    ]
});
