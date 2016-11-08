Ext.define('Admin.view.main.agentPhone.AgentPhone', {
    extend: 'Ext.button.Button',
    xtype: 'agentphone',
    iconCls: 'x-fa fa-phone',
    userCls: 'circular-icon',
    id: 'agentIcon',
    tooltip: '坐席上线',
    hidden: true,
    isOnline: false,
    handler: function(btn, event) {
        // 判断语音功能状态
        if (!Admin.data.Team.get('voip')) {
            Ext.Msg.confirm('坐席上线', '您还没开启语音电话功能,是否跳转到设置页面开启?', function(btnId) {
                if ('yes' === btnId) {
                    location.hash = '#voiceService';
                }
            });
            return;
        }

        // 接听电话
        // if (btn.phoneRinging) {
        //     Cloopen.accept();
        //     return;
        // }

        if (!btn.isOnline) {
            // 坐席未上线,执行上线操作
            Ext.Ajax.request({
                url: '/api/voip/token',
                success: function(response) {
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert('错误', res.msg);
                        return;
                    }
                    var token = res.data;
                    var appid = 'aaf98f8951af2ba80151c2135efe4650';
                    Cloopen.debug();
                    Cloopen.forceLogin();
                    Cloopen.init('agentSystemFlashContainer', initCallBack, notifyCallBack, appid + '#' + token);
                }
            });
        } else {
            // 坐席已上线,执行下线操作
            Ext.Msg.confirm('坐席下线', '下线后您将无法接收用户电话呼入,是否确认下线?', function(btnId) {
                if ('yes' === btnId) {
                    Ext.Ajax.request({
                        url: '/api/voip/agentoffwork',
                        success: function(response) {
                            var icon = Ext.getCmp('agentIcon');
                            icon.isOnline = false;
                            icon.el.dom.style.backgroundColor = '#F6F6F6'
                            Ext.Msg.alert('坐席下线', '您已下线.');
                        }
                    });
                }
            });
        }

        function initCallBack() {
            var flashContainer = document.getElementById('flashContainer');
            flashContainer.style.top = '300px';
            flashContainer.style.left = document.body.clientWidth / 2 - 107 + 'px';
            flashContainer.style.zIndex = 9999999;
            var flashObject = flashContainer.children[0];
            flashContainer.style.opacity = 0.01;
            flashObject.style.zoom = 3;
        }

        function notifyCallBack(doFun, msg) {
            var flashContainer = document.getElementById('flashContainer');
            var flashObject = flashContainer.children[0];

            console.log(doFun + '<<<-------------------->>>' + msg);

            // if ('Microphone.NotFound' === doFun && '找不到可用的麦克风' === msg) {
            //     Ext.Msg.alert('错误', '找不到可用的麦克风！');
            //     return;
            // }

            // if (doFun == "Microphone.timer.checkMic") {
            //     flashObject.style.zoom = 1;
            //     flashContainer.style.opacity = 1;
            // }
            var phoneRinging = document.getElementById('phoneRingingAudio');
            var agentIcon = Ext.getCmp('agentIcon');

            // if ('connected' === doFun && '已登录' === msg) {
            //     // 坐席上线
            //     Ext.Ajax.request({
            //         url: '/api/voip/agentonwork',
            //         success: function(response) {
            //             Ext.Ajax.request({
            //                 url: '/api/voip/agentready',
            //                 success: function() {
            //                     // do something
            //                 }
            //             });
            //             var icon = Ext.getCmp('agentIcon');
            //             icon.isOnline = true;
            //             icon.el.dom.style.backgroundColor = '#9CC96B'
            //             icon.setTooltip('坐席下线');
            //             Ext.Msg.alert('坐席上线', '您已上线.');
            //         }
            //     });
            // } else if ('inbound' === doFun) {
            //     phoneRinging.play();
            //     agentIcon.phoneRinging = true;
            //     Ext.getCmp('answerPhoneBtn').show();

            // }

            // 向外呼叫
            // if ('outbound' === doFun && msg.indexOf('呼叫：') > -1) {
            //     Ext.getCmp('sendTypeCombo').up('chatpanel').down('phonecallpanel').fireEvent('makingphonecall');
            // }

            // 客户拒接
            if ("onHangup" === doFun && 'rejected' === msg || ("connected" === doFun && '呼叫取消' === msg)) {
                var voiceEditor = Ext.getCmp('sendTypeCombo').up('chatpanel').down('#phoneEditor');
                if (voiceEditor) {
                    voiceEditor.fireEvent('phoneCancel');
                }
            }

            // 电话接通状态 呼出和呼入
            if ("active" === doFun && '呼叫已连接' === msg) {
                afterPhoneRing(phoneRinging);
                Ext.getCmp('agentIcon').phoneInCall = true;

            }

            // 电话接通后挂断
            if ("connected" === doFun && '呼叫终止' === msg) {
                afterPhoneRing(phoneRinging);
                Ext.getCmp('agentIcon').phoneInCall = false;
                Ext.getCmp('agentIcon').renderPhoneEditor = null;
                var voiceEditor = Ext.getCmp('sendTypeCombo').up('chatpanel').down('#phoneEditor');

                if (voiceEditor) {
                    voiceEditor.fireEvent('phoneendcall');
                }
            }

        }

        // 电话挂断后或者电话无人接听, 重置一些状态
        function afterPhoneRing(phoneRinging) {
            if (!phoneRinging.paused) {
                phoneRinging.pause();
            }
            Ext.getCmp('answerPhoneBtn').hide();
            Ext.getCmp('agentIcon').phoneRinging = false;
            // 重置坐席状态
            // Ext.Ajax.request({
            //     url: '/api/voip/agentready'
            // });
        }
    },
    listeners: {
        afterrender: function() {
            this.on('resetAgentReady', function() {
                Ext.Ajax.request({
                    url: '/api/voip/agentready'
                });
            });
        }
    }
});
