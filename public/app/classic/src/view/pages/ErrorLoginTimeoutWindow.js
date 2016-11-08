Ext.define('Admin.view.pages.ErrorLoginTimeoutWindow', {
    extend: 'Admin.view.pages.ErrorBase',
    xtype: 'logintimeoutpage',
    title: '解锁控制台',
    requires: [
        'Admin.view.authentication.AuthenticationController',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],
    cls:'login-timeout-inner-container',
    items: [
        {
            xtype: 'form',
            width:400,
            height:160,
            cls: 'unlock-window',
            layout: 'responsivecolumn',
            bodyPadding: 20,
            style:{

            },

            // The form will submit an AJAX request to this URL when submitted
            url: '/api/unlock',
            method: 'POST',
            // Fields will be arranged vertically, stretched to full width
            defaults: {
                anchor: '100%'
            },

            // The fields
            defaultType: 'textfield',
            items: [
                {
                    xtype:'panel',
                    width: "100%",
                    height: 90,
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    items: [{
                        xtype: 'image',
                        flex:1,
                        style:{
                          'border-radius':'80px'
                        },
                        src: Admin.data.User.get('img')
                    },{
                        xtype: 'panel',
                        padding:'10 0 0 30',
                        height: 90,
                        flex: 3,
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        items:[
                            {
                                html:Admin.data.User.get('name'),
                                flex:1
                            },{
                                xtype:'textfield',
                                width: '100%',
                                inputType: 'password',
                                name: 'password',
                                minLength: 6,
                                emptyText:'密码',
                                allowBlank: false,
                                flex:1,
                                enableKeyEvents:true,
                                listeners:{
                                    keypress:function(me, e){
                                        if(e.keyCode == 10 || e.keyCode == 13){
                                            me.up('form').down('#submitBtn').handler();
                                        }
                                    }
                                }
                            }
                        ]
                    }]
                },
                {
                    xtype:'hidden',
                    width: '100%',
                    name: 'email',
                    allowBlank: false,
                    emptyText:'邮箱',
                    value:Admin.data.User.get('email')
                }
            ],
            bbar:[
                {
                    xtype:'tbtext', width: '100%', style:{color: '#F00','text-indent': '10px', 'font-weight':'bold', 'text-shadow':'#000 1px 1px 0', 'text-align': 'center'}
                }
            ],
            showMessage:function(text){
                var me = this;
                me.setHeight(180);
                me.down('tbtext').setText(text);
                if(me.clearMessageTrigger){
                    clearTimeout(me.clearMessageTrigger);
                }
                me.clearMessageTrigger = setTimeout(function(){
                    me.clearMessageTrigger = null;
                    me.setHeight(160);
                    me.down('tbtext').setText('');
                },5000);
            },
            // Reset and Submit buttons
            buttons: [{
                text: '其他用户',
                handler: function() {
                    location.href = Admin.data.User.get('login')?Admin.data.User.get('login'):'https://'+location.host.replace('app.','auth.');
                }
            }, {
                text: '解锁',
                itemId:'submitBtn',
                formBind: true, //only enabled once the form is valid
                disabled: true,
                handler: function() {
                    var dialog = this.up('form');
                    var form = dialog.getForm();
                    if (form.isValid()) {
                        form.submit({
                            success: function(form, action) {
                                if(action.result.success){
                                    location.reload();
                                }else{
                                    dialog.showMessage('登录失败。'+action.result.msg);
                                    if(action.result.code == 403){
                                        var passwordArea = dialog.down('textfield');
                                        passwordArea.setValue('');
                                        passwordArea.focus();
                                    }
                                }
                            },
                            failure: function(form, action) {
                                if(action.failureType=='connect'){
                                    dialog.showMessage('连接服务器失败。请点击使用其他用户登录，或者稍后再试。');
                                }else{
                                    if(action.result.code == 403){
                                        var passwordArea = dialog.down('textfield');
                                        passwordArea.setValue('');
                                        passwordArea.focus();
                                    }
                                    dialog.showMessage('登录失败。'+action.result.msg);
                                }
                            }
                        });
                    }
                }
            }]
        }
    ]
});
