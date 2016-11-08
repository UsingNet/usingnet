/**
 * Created by jhli on 16-1-29.
 */
Ext.define('Admin.data.AgentPhone', {
    singleton: true,
    order: null,
    connect: function() {
        var me = this;
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
                Cloopen.init('agentSystemFlashContainer', me._initCallBack, me._notifyCallBack, appid + '#' + token);
            }
        });
    },
    close: function() {
        Ext.Ajax.request({
            url: '/api/voip/agentoffwork',
            success: function(response) {
                return;
                var icon = Ext.getCmp('agentIcon');
                icon.isOnline = false;
                icon.el.dom.style.backgroundColor = '#F6F6F6'
            }
        });
    },

    setAgentReady: function() {
        Ext.Ajax.request({
            url: '/api/voip/agentready'
        });
    },

    setAgentOnWork: function(fn) {
        Ext.Ajax.request({
            url: '/api/voip/agentonwork',
            success: fn
        });
    },

    setOrder: function(order) {
        this.order = order;
    },

    clearOrder: function() {
        this.order = null;
    },

    _initCallBack: function() {
        var flashContainer = document.getElementById('flashContainer');
        flashContainer.style.top = '300px';
        flashContainer.style.left = document.body.clientWidth / 2 - 107 + 'px';
        flashContainer.style.zIndex = 9999999;
        var flashObject = flashContainer.children[0];
        flashContainer.style.opacity = 0.01;
        flashObject.style.zoom = 3;
    },

    _notifyCallBack: function(doFun, msg) {
        var order = Admin.data.AgentPhone.order, voiceEditor;
        if (order) {
            voiceEditor = order.workOrderChatPanel.up('chatpanel').down('voiceeditor');
        }

        console.log(doFun + '<<<-------------------->>>' + msg);
        var flashContainer = document.getElementById('flashContainer');
        var flashObject = flashContainer.children[0];
        var phoneRinging = document.getElementById('phoneRingingAudio');

        if (doFun == "Microphone.timer.checkMic") {
            flashObject.style.zoom = 1;
            flashContainer.style.opacity = 1;
        }

        if ('Microphone.NotFound' === doFun && '找不到可用的麦克风' === msg) {
            Ext.Msg.alert('错误', '找不到可用的麦克风！');
            return;
        }

        Cloopen.when_connected(function () {
            Admin.data.AgentPhone.setAgentOnWork(Admin.data.AgentPhone.setAgentReady);
        });

        Cloopen.when_inbound(function () {
            var phoneRinging = document.getElementById('phoneRingingAudio');
            phoneRinging.play();
            Ext.getCmp('answerPhoneBtn').show();
        });

        Cloopen.when_outbound(function () {
            if (Admin.data.AgentPhone.order) {
                var voiceEditor = Admin.data.AgentPhone.order.workOrderChatPanel.up('chatpanel').down('voiceeditor');
                voiceEditor.fireEvent('callingout');
            }

        });

        Cloopen.when_active(function () {
            var phoneRinging = document.getElementById('phoneRingingAudio');
            phoneRinging.pause()
            Ext.getCmp('answerPhoneBtn').hide();
            if (Admin.data.AgentPhone.order) {
                var voiceEditor = Admin.data.AgentPhone.order.workOrderChatPanel.up('chatpanel').down('voiceeditor');
                voiceEditor.fireEvent('talking');
            }
        });

        if ('onHangup' === doFun && '603:NORMAL_CLEARING' === msg) {
            // 对方无人接听
            voiceEditor.fireEvent('normalstate');
        }

        if ('onHangup' === doFun && 'callcancel' === msg) {
            // 客户中止呼叫
        }
        if ('onHangup' === doFun && 'normal' === msg) {
            // 客户中止连接 / 客服中止连接
        }

        // 客户拒接
        if (("onHangup" === doFun && 'rejected' === msg) || ("connected" === doFun && '呼叫取消' === msg)) {
            voiceEditor.fireEvent('normalstate');
            // Admin.data.AgentPhone.setAgentReady();
        }


        if ('connected' === doFun && '呼叫终止' === msg) {
            // 表示中止状态
            console.log('---------------byed-----------------')
            if (voiceEditor) {
                voiceEditor.fireEvent('normalstate');
            } else {
                phoneRinging.pause()
                Ext.getCmp('answerPhoneBtn').hide();
                Admin.data.AgentPhone.clearOrder();
            }
            Admin.data.AgentPhone.setAgentReady();
        }



        if ('reason' === doFun && '与rtmp服务器连接断开' === msg) {

        }
        if ('reason' === doFun && '发起呼叫失败' === msg) {

        }
        if ('idle' === doFun && '服务被断开 ' === msg) {

        }
        if ('connecting' === doFun && '连接... ' === msg) {

        }
        if ('Microphone.Unmuted' === doFun && '麦克风被允许访问' === msg) {

        }




    }
});
