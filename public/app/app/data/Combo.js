/**
 * Created by jhli on 16-2-22.
 */
Ext.define('Admin.data.Combo', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    requires:['Admin.data.User'],
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        if(Admin.data.User.get('role') == 'MASTER'){
            me._getComboData();
        }
    },

    _getComboData: function(onlyCurrentCombo) {
        var me = this;
        var urls = ['/api/account/plan/0', '/api/account/plan'];
        var types = ['currentCombo', 'alternativeCombos'];
        var n = 0;

        if (onlyCurrentCombo) {
            urls.pop();
        }

        for (var i = 0; i < urls.length; i++) {
            n++;
            (function(i, n) {
                Ext.Ajax.request({
                    url: urls[i],
                    success: function(response) {
                        n--;
                        var res = Ext.decode(response.responseText);
                        if (res.success) {
                            me.store[types[i]] = res.data;
                        }
                        if (!n) {
                            me.fireEvent('combodataready');
                        }
                    }
                });
            })(i, n);
        }
    },

    get: function(key) {
        var me = this;
        if (key) {
            return me.store[key];
        }
    },

    setCombo: function(values) {
        var me = this;
        if (values) {
            Ext.Ajax.request({
                url: '/api/account/plan',
                method: 'POST',
                jsonData: Ext.encode(values),
                success: function(response) {
                    var res = Ext.decode(response.responseText);
                    if (res.success) {
                        me._getComboData(true);
                        Ext.Msg.alert('成功', '套餐修改成功！请刷新页面以获取新功能！');
                        Admin.data.Team.constructor();
                        Ext.getCmp('balance').setText('余额：' + Admin.data.Team.get('balance') + '元');
                    } else {
                        if (411 === res.code) {
                            Ext.Msg.show({
                                title: '余额不足',
                                message: '余额不足，还需充值' + res.msg + '元，请点击充值按钮进行充值。',
                                buttonText: {
                                    ok: '充值'
                                },
                                icon: Ext.Msg.WARNING,
                                fn: function(btn) {
                                    if ('ok' === btn) {
                                        window.open('/api/account/pay/to?money=' + res.msg + '&type=alipay&method=plan&plan_id=' + values.plan_id + '&agent_num=' + values.agent_num + '&year=' + values.year);
                                        Ext.Msg.show({
                                            title: '支付',
                                            closable: false,
                                            message: '请确认您的支付状态：',
                                            buttonText: {
                                                ok: '支付成功',
                                                no: '支付失败'
                                            },
                                            icon: Ext.Msg.QUESTION,
                                            fn: function(btn) {
                                                Admin.data.Team.loadSubmodule('base');
                                                if ('ok' === btn) {
                                                    Ext.Ajax.request({
                                                        url: '/api/account/pay/success',
                                                        method: 'POST',
                                                        success: function(response) {
                                                            var res = Ext.decode(response.responseText);
                                                            if (res.success) {
                                                                me._getComboData(true);
                                                                Ext.Msg.alert('成功', '套餐修改成功！请刷新页面以获取新功能！');
                                                                Admin.data.Team.constructor();
                                                                Ext.getCmp('balance').setText('余额：' + Admin.data.Team.get('balance') + '元');
                                                            } else {
                                                                location.hash = '#recharge';
                                                                Ext.Msg.alert('错误', '支付失败，请联系客服。');
                                                            }
                                                        },
                                                        failure: function(response) {
                                                            Ext.Msg.alert('错误', '服务器错误。');
                                                        }
                                                    });
                                                } else {
                                                    location.hash = '#recharge';
                                                    Ext.Msg.alert('错误', '支付失败，请联系客服。');
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            Ext.Msg.alert('错误', res.msg);
                        }
                    }
                },
                failure: function() {
                    Ext.Msg.alert('错误', '服务器错误，无法提交数据。');
                }
            });
        }
    }

});
