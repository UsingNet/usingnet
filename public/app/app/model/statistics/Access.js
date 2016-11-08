/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.model.statistics.Access', {
    extend: 'Ext.data.Model',
    // idProperty: '_id',
    fields: [
        { name: '_id', type: 'string'},
        { name: 'contact_id', type: 'string'},
        { name: 'created_at', type: 'string'},
        { name: 'updated_at', type: 'string'},
        { name: 'referrer', type: 'string'},
        { name: 'contact'},
        { name: 'second', type: 'int'},
        { name: 'times', type:'int'}
        /*
        The fields for this model. This is an Array of Ext.data.field.Field definition objects or simply the field name.
        If just a name is given, the field type defaults to auto.  For example:

        { name: 'name',     type: 'string' },
        { name: 'age',      type: 'int' },
        { name: 'phone',    type: 'string' },
        { name: 'gender',   type: 'string' },
        { name: 'username', type: 'string' },
        { name: 'alive',    type: 'boolean', defaultValue: true }
         */
    ]

    /*
    Uncomment to add validation rules
    validators: {
        age: 'presence',
        name: { type: 'length', min: 2 },
        gender: { type: 'inclusion', list: ['Male', 'Female'] },
        username: [
            { type: 'exclusion', list: ['Admin', 'Operator'] },
            { type: 'format', matcher: /([a-z]+)[0-9]{2,3}/i }
        ]
    }
    */

    /*
    Uncomment to add a rest proxy that syncs data with the back end.
    proxy: {
        type: 'rest',
        url : '/users'
    }
    */
});
