/**
 * Created by henry on 16-1-27.
 */
Ext.define('Admin.view.main.OnlineSwitch', {
    extend: 'Ext.button.Button',
    xtype: 'onlineswitch',
    id: 'onlineswitch',
    userCls: 'transparentBg',
    tooltip: '点击上线',
    html: '<i class="x-fa fa-circle" style="color:orange;font-size: 10px;"></i>&nbsp;&nbsp;<middle>离线</middle>',
    listeners: {
        click: function() {
            var me = this;
            var point = me.el.dom.querySelector('i');
            var em = me.el.dom.querySelector('middle');
            if (em.innerText == '离线') {
                Ext.Ajax.request({
                    url: '/api/online',
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (res.success) {

                            me.setTooltip('点击下线');
                            point.style.color = 'green';
                            em.innerHTML = '在线';
                            Ext.util.Cookies.set('online', 1, null, '/', location.hostname.replace('app.', '.'));
                            Admin.data.MessageListener.connect();
                            Admin.data.User.fireEvent('onlinetiming');
                            if (Admin.data.Permission.get('chat.voip.status')) {
                                Admin.data.AgentPhone.connect();
                            }
                        } else {
                            Ext.Msg.alert('错误', res.msg);
                        }
                    }
                });
            } else {
                if (me.isOnPhone) {
                    Ext.Msg.alert('错误', '通话状态下不能切换到离线状态！');
                    return;
                }
                me.setTooltip('点击上线');
                point.style.color = 'orange';
                em.innerHTML = '离线';
                Ext.util.Cookies.set('online', 0, null, '/', location.hostname.replace('app.', '.'));
                Admin.data.MessageListener.close();
                Admin.data.User.fireEvent('onlinetiming');
                if (Admin.data.Permission.get('chat.voip.status')) {
                    Admin.data.AgentPhone.close();
                }
                Ext.Ajax.request({
                    url: '/api/user/offline',
                    method: 'POST',
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (!res.success) {
                            Ext.Msg.alert('错误', res.msg);
                            return;
                        }
                        if (Ext.getCmp('treelist')) {
                            // Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load();
                            Ext.getCmp('treelist').removeAll();
                        }
                        Admin.data.Dashboard.fireEvent('realtimedata');
                    },
                    failure: function(response) {
                        Ext.Msg.alert('错误', '服务器错误。');
                    }
                });
            }
        },
        afterrender: function() {
            var self = this;
            if (Ext.util.Cookies.get('online') == '1') {
                this.fireEvent('click');
            }
            Admin.data.User.on('offlinetimeup', function() {
                (function(self) {
                    var msgWindow = Ext.create('Ext.window.MessageBox', {
                        closable: false,
                        listeners: {
                            show: function() {
                                var me = this;
                                var msg = me.msg;
                                var time = 60;
                                me.intervalId = setInterval(function() {
                                    time = time - 1;
                                    if (0 === time) {
                                        clearInterval(me.intervalId);
                                        self.fireEvent('click');
                                        me.destroy();
                                        var offtipWin = Ext.create('Ext.window.MessageBox', {}).show({
                                            closable: false,
                                            title: '离线警告',
                                            message: '因长时间没有操作，系统已经自动切换到离线状态。',
                                            icon: Ext.Msg.WARNING,
                                            buttonText: {
                                                ok: '上线',
                                                cancel: '关闭'
                                            },
                                            fn: function(btn) {
                                                if ('ok' === btn) {
                                                    self.fireEvent('click');
                                                    offtipWin.destroy();
                                                } else if ('cancel' === btn) {
                                                    offtipWin.destroy();
                                                }
                                            }
                                        });
                                    } else {
                                        if (msg) {
                                            msg.setHtml('您已经长时间没有操作，系统将在' + time + '秒后切换到离线状态。');
                                        }
                                    }
                                }, 1000);
                            }
                        }
                    }).show({
                        title: '离线警告',
                        message: '您已经长时间没有操作，系统将在60秒后切换到离线状态。',
                        icon: Ext.Msg.WARNING,
                        buttons: Ext.Msg.CANCEL,
                        fn: function(buttonId, text, opt) {
                            if ('cancel' === buttonId) {
                                clearInterval(msgWindow.intervalId);
                                msgWindow.destroy();
                            }
                        }
                    });
                })(self);
            });
        }
    }
});
