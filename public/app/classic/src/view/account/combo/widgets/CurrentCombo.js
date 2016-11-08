Ext.define('Admin.view.account.combo.widgets.CurrentCombo', {
    extend: 'Ext.panel.Panel',
    xtype: 'usingnetcurrentcombo',
    title: '当前套餐',
    cls: 'shadow',
    items: [{
        xtype: 'form',
        defaultType: 'displayfield',
        fieldDefaults: {
            margin: 20
        },
        layout: 'hbox',
        items: [{
            name: 'name',
            width: 200
        }, {
            name: 'agent_num',
            width: 200
        }, {
            name: 'end_at',
            width: 200
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Combo.on('combodataready', function() {
                me.fireEvent('afterrender', me);
            });
        },
        afterrender: function() {
            var me = this;
            var currentCombo = Admin.data.Combo.get('currentCombo');
            if (currentCombo) {
                var agentNum = me.down('form').items.getAt(1),
                    endAt = me.down('form').items.getAt(2);
                me.down('form').getForm().setValues(currentCombo);
                agentNum.setValue(agentNum.getValue() + '个坐席');
                if ('experience' === currentCombo.slug) {
                    endAt.setValue('合约截止日期：不限时免费体验');
                } else {
                    endAt.setValue('合约截止日期：' + endAt.getValue().substr(0, 10));
                }
            }
        }
    }
});
