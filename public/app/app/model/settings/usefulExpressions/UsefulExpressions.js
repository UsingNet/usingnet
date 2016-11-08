/**
 * Created by jhli on 16-3-21.
 */
Ext.define('Admin.model.settings.usefulExpressions.UsefulExpressions', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string'},
        { name: 'title', type: 'string'},
        { name: 'content', type: 'string'}
    ]
});