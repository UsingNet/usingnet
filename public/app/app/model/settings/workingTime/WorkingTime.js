/**
 * Created by jhli on 16-2-23.
 */
Ext.define('Admin.model.settings.workingTime.WorkingTime', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'string'},
        { name: 'date', type: 'date', dateFormat: 'timestamp' },
        { name: 'work', type: 'string'}
    ]
});