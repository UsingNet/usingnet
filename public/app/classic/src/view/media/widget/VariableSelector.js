/**
 * Created by henry on 15-12-31.
 */
Ext.define('Admin.view.media.widget.VariableSelector', {
    extend:'Ext.panel.Panel',
    xtype:'variableselector',
    width:140,
    getEditor:function(){
        throw new Exception("未实现方法 getEditor");
    },
    items:[
        {
            xtype:'buttongroup', columns: 1, items:
            [
                {xtype:'button', text:'姓名 #name#', width:120},
                {xtype:'button', text:'电话 #phone#', width:120},
                {xtype:'button', text:'邮箱 #email#', width:120},
                {xtype:'button', text:'日期 #date#', width:120},
                {xtype:'button', text:'时间 #time#', width:120}
            ],
            listeners:{
                afterrender:function(group){
                    group.items.each(function(button){
                        button.addListener('click',function(){
                            var editor = this.up('variableselector').getEditor();
                            editor.insertAtCursor(this.text.split(' ')[1]);
                            //editor.setValue(editor.getValue()+(this.text.split(' ')[1]));
                        });
                    });
                }
            }
        }
    ]
});