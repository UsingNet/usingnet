/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.component.AutoForm',{
    extend:'Ext.form.Panel',
    xtype:'autoform',

    setValues:function(values){
        if(values){
            var items = Ext.Array.merge(this.query('field'), this.query('radiogroup'));
            Ext.Array.forEach(items, function(field) {
                if (field.name && values[field.name]) {
                    if(field.xtype == 'radiogroup'){
                        var filter = field.query('radio[name="'+field.name+'"]').filter(function(a){return a.inputValue == values[field.name];});
                        if(filter.length) {
                            field.setValue(values);
                        }else{
                            var fixValues = Ext.clone(values);
                            fixValues[field.name] = false;
                            field.setValue(fixValues);
                        }
                    }else{
                        field.setValue(values[field.name]);
                    }
                }
            });
            //this.form.setValues(values);
        }
    },

    getValues: function(){
        var values = this.form.getValues();
        for(var i in values){
            if(values[i] instanceof Array){
                if(i.substr(-2) != '[]'){
                    if(values[i].length) {
                        values[i] = values[i][values[i].length - 1]
                    }else{
                        values[i] = null;
                    }
                }
            }
        }
        return values;
    }
});