/**
 * Created by henry on 16-5-4.
 */
Ext.define('Admin.model.settings.OrderForm', {
    extend: 'Ext.data.Model',

    fields: [
        { name: '_id', type: 'string'},
        { name: 'title', type: 'string'},
        { name: 'items'}
    ],

    idProperty:'_id'
});