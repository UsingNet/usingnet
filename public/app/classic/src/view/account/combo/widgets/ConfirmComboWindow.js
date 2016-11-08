Ext.define('Admin.view.account.combo.widgets.ConfirmComboWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    title: '确认支付',
    width: 700,
    height: 320,
    modal: true,
    padding: 20,
    items: [{
        xtype: 'displayfield',
        itemId: 'name',
        fieldLabel: '套餐类型'
    }, {
        xtype: 'displayfield',
        itemId: 'price',
        fieldLabel: '套餐价格'
    }, {
        xtype: 'displayfield',
        itemId: 'agentNum',
        fieldLabel: '坐席数'
    }, {
        xtype: 'displayfield',
        itemId: 'contractTime',
        fieldLabel: '合约截止日期'
    }, {
        xtype: 'displayfield',
        fieldLabel: '扣费方式',
        value: '从余额扣费'
    }, {
        xtype: 'displayfield',
        itemId: 'totalPrice',
        fieldLabel: '费用'
    }],
    bbar: [{
        text: '确认支付',
        ui: 'soft-green',
        handler: function() {
            Admin.data.Combo.setCombo(this.up('window').values);
            this.up('window').close();
        }
    }, {
        text: '取消',
        ui: 'soft-blue',
        handler: function() {
            this.up('window').close();
        }
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            var form = this.config.form;
            var values = form.getForm().getValues();
            me.values = values;
            var alternativeCombos = Admin.data.Combo.get('alternativeCombos');
            var combo;
            Ext.Array.forEach(alternativeCombos, function(item) {
                if (item.id === values.plan_id) {
                    combo = item;
                }
            });
            me.down('#name').setValue(combo.name);
            me.down('#price').setValue('￥' + combo.price + '/坐席/年');
            me.down('#agentNum').setValue(values.agent_num + '个');
            me.down('#contractTime').setValue(values.year + form.down('#year').next().getValue().replace(/&nbsp;/g, ''));
            me.down('#totalPrice').setValue(form.down('#cost').getValue());
        }
    }
});
