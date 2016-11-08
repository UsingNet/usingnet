/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.model.Tag', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.util.Format'
    ],

    fields: [
        { name: 'id'},
        { name: 'name', type: 'string'},
        { name: 'color', type: 'string', defaultValue:'999999'}
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
    ],

    validators: {
        name:{type: 'length', min:2}
    },


    toHtml:function(data){
        if(typeof(data) == 'undefined'){
            data = this.data;
        }
        return Ext.util.Format.format('<span style="background-color:\#{0};color:#FFF;padding:5px;border-radius:5px;">{1}</span>', data.color, data.name);
    }

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
