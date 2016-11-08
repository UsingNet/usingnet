/**
 * Created by henry on 16-1-4.
 */
Ext.define('Admin.view.task.contact.ByTags',{
    extend:'Ext.window.Window',
    title: '导入客户',
    modal: true,
    width: 500,
    bodyPadding:10,
    viewModel:{
        type:'team'
    },
    items:[
        {
            xtype:'form',
            items:[{
                // pickerId according to https://www.sencha.com/forum/showthread.php?303101
                //pickerId: 'tag[]',
                name: 'tag',
                width:'100%',
                fieldLabel:'标签',
                xtype: 'tagfield',
                flex: 1,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'remote',
                pageSize: 20,
                bind:{
                    store:'{tags}'
                }
            }]
        }
    ],
    buttons:[
        {text:'导入', handler:function(){
            var form = this.up('window').down('form').getForm();
            var dialog = this.up('window');
            if(form.isValid()){
                form.submit({
                    url: '/api/contact/import',
                    waitMsg: '正在导入...',
                    success: function(form, action) {
                        if(action.result.success){
                            var data = Ext.decode(action.response.responseText);
                            if(data.data.length){
                                dialog.data = data.data;
                                dialog.close();
                            }else{
                                Ext.Msg.alert('错误', '未匹配到客户信息');
                            }
                        }else{
                            Ext.Msg.alert('失败', action.result.msg);
                        }
                    },
                    failure: function(form, action) {
                        if(action && action.result && action.result.msg){
                            Ext.Msg.alert('失败', action.result.msg);
                        }else{
                            Ext.Msg.alert('失败', '服务器错误');
                        }
                    }
                });
            }
        }}
    ]
});