/**
 * Created by henry on 16-1-4.
 */
Ext.define('Admin.view.task.contact.ByFile',{
    extend:'Ext.window.Window',
    title: '导入客户',
    modal: true,
    width: 500,
    bodyPadding:10,
    viewModel:{
        type:'team'
    },
    items:[{
        xtype:'form',
        items:[{
            // pickerId according to https://www.sencha.com/forum/showthread.php?303101
            xtype: 'filefield',
            name: 'contacts',
            fieldLabel: '客户',
            msgTarget: 'side',
            allowBlank: false,
            width: '100%',
            buttonText: '选择文件...'
        },{
            xtype: 'displayfield',
            fieldLabel: '说明',
            value:'<ol>' +
            '<li>仅支持xls,xlsx,csv文件</li>' +
            '<li>导入的新用户会合并到用户列表</li>' +
            '<li>文件模板: <a target="_blank" href="#">CSV文件</a> <a target="_blank" href="#">XSL文件</a></li>' +
            '</ol>'
        }]
    }],
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