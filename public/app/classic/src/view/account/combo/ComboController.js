Ext.define('Admin.view.account.combo.widgets.ComboController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.combo',

    init: function() {
        this.n = 0;
    },
    computationalCost: function(component, newValue, oldValue, eOpts) {
        var me = this;
        var form = component.up('form');
        if (!form.down('#agent_num').isValid() || !form.down('#year').isValid() || form.rendering) {
            form.down('button').setDisabled(true);
            form.down('#cost').setValue('还需支付￥<span style="font-size: x-large; color: #ff5c5e; font-weight: bold;">0.00</span>');
            return;
        }
        var values = form.getForm().getValues();
        me.n++;
        Ext.Ajax.request({
            url: '/api/account/plan/balance?plan_id=' + values.plan_id + '&agent_num=' + values.agent_num + '&year=' + values.year,
            success: function(response) {
                me.n--;
                if (!me.n) {
                    var res = Ext.decode(response.responseText);
                    if (!res.success) {
                        Ext.Msg.alert('错误', res.msg);
                        form.down('button').setDisabled(true);
                        return;
                    }

                    var discount = res.discount ? ('（<span style="font-size: 18px; color: #ff5c5e;">' + (res.discount / 10).toFixed(1) + '</span>折特惠，') : '';
                    var costs = res.discount ? (res.costs * (res.discount / 100)).toFixed(2) : res.costs;
                    var discountCosts = res.discount ? '已优惠￥' + '<span style="font-size: 18px; color: #ff5c5e;">' + (res.costs - costs).toFixed(2) + '</span>）' : '';
                    var value = '￥<span style="font-size: x-large; color: #ff5c5e; font-weight: bold;">' + costs + '</span>' + discount + discountCosts;

                    form.down('#cost').setValue(value);
                    if (parseInt(res.costs) <= 0) {
                        form.down('button').setDisabled(true);
                    } else {
                        form.down('button').setDisabled(false);
                    }
                }
            },
            failure: function() {
                me.n--;
            }
        });
    }
});
