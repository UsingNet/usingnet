/**
 * Created by henry on 16-1-4.
 */
Ext.define('Admin.view.task.contact.ByInfo',{
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
                pickerId: 'infotype',
                name: 'infotype',
                width:'100%',
                fieldLabel:'信息类型',
                xtype: 'combobox',
                flex: 1,
                editable: false,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'local',
                store:Ext.create('Ext.data.Store', {
                    fields: ['id','name'],
                    data: [
                        {id: 'id', name: '优信ID'},
                        {id: 'email', name: '邮箱'},
                        {id: 'openid', name: '微信OPENID'},
                        {id: 'phone', name: '手机号码'},
                        {id: 'extend_id', name: '系统ID'}
                    ]
                })
            },{
                xtype:'textarea',
                width:'100%',
                fieldLabel:'信息',
                name:'info'
            },{
                xtype: 'displayfield',
                fieldLabel: '说明',
                value:'用户信息之间用半角逗号隔开'
            }]
        }
    ],
    buttons:[
        {text:'导入', handler:function(){
            var form = this.up('window').down('form').getForm();
            var values = form.getValues();
            var dialog = this.up('window');
            var params = {};
            params[values['infotype']] = values['info'].replace(/\，/g, ',').replace(/\s+/g, '').replace(/[,，]$/, '').split(',');
            if(form.isValid()){
                form.submit({
                    "params":params,
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