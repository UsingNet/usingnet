/**
 * Created by jhli on 15-11-20.
 */
Ext.define('Admin.view.media.widget.VoiceUpload', {
    extend: 'Ext.window.Window',

    /*
    Uncomment to give this component an xtype
    xtype: 'voiceupload',
    */
    title: '添加录音',
    id: 'voiceUploadWin',
    closable: true,
    autoShow: true,
    modal: true,
    width: 500,
    layout: 'fit',
    buttons: [
        '->',
        {
            text: '上传',
            ui: 'soft-green',
            handler: function() {
                var form = this.ownerCt.nextNode().getForm();
                if (form.isValid) {
                    form.submit({
                        url: '/api/upload?type=voice',
                        //async: false,
                        waitMsg: 'Uploading...',
                        success: function(upload, response) {
                            if (200 === response.result.code) {
                                var res = response.result;
                                var store = Ext.getCmp('voiceGrid').getStore();
                                store.insert(0, [Ext.create('Admin.model.media.Voice', {
                                    content: res.data,
                                    title: Ext.getCmp('voiceTitle').value
                                })]);
                            }
                        },
                        failure: function(form, response){
                            Ext.Msg.alert("错误", response.result.msg);
                        }
                    });
                }
            }
        }
    ],
    items: [
        /* include child components here */
        {
            xtype: 'form',
            width: '90%',
            bodyPadding: 30,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: '标题',
                    name: 'title',
                    id: 'voiceTitle',
                    allowBlank: false
                },
                {
                    xtype: 'filefield',
                    name: 'file',
                    fieldLabel: '文件',
                    buttonText: '选择语音文件',
                    allowBlank: false
                },
                {
                    items:[
                        {html:'注：'},
                        {html:'1、录音文件只能是wav类型'},
                        {html:'2、录音审核时间为2个工作日'},
                        {html:'3、违反“遵守网络内容传播九不准”的申请不予通过'},
                        {html:'4、违反其他相关规定的申请不予通过'}
                    ]
                }
            ]
        }
    ]
});
