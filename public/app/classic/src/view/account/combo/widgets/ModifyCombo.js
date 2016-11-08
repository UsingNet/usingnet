Ext.define('Admin.view.account.combo.widgets.ModifyCombo', {
    extend: 'Ext.panel.Panel',
    xtype: 'usingnetmodifycombo',
    title: '套餐设置',
    cls: 'shadow',
    layout: 'fit',
    items: [{
        xtype: 'form',
        layout: 'vbox',
        items: [{
            xtype: 'radiogroup',
            name: 'plan_id',
            itemId: 'plan_id',
            width: 1000,
            margin: 20,
            labelWidth: 96,
            fieldLabel: '请选择套餐',
            allowBlank: false,
            listeners: {
                change: 'computationalCost'
            }
        }, {
            xtype: 'numberfield',
            name: 'agent_num',
            itemId: 'agent_num',
            fieldLabel: '坐席数',
            allowBlank: false,
            margin: 20,
            width: 360,
            value: 1,
            minValue: 1,
            maxValue: 99,
            listeners: {
                change: 'computationalCost'
            }
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '合约截止日期',
            margin: 20,
            layout: 'hbox',
            items: [{
                xtype: 'numberfield',
                allowBlank: false,
                name: 'year',
                itemId: 'year',
                width: 100,
                value: new Date().getFullYear() + 1,
                minValue: new Date().getFullYear() + 1,
                maxValue: new Date().getFullYear() + 10,
                listeners: {
                    change: 'computationalCost'
                }
            }, {
                xtype: 'displayfield',
                margin: '0 0 0 5',
                value: '年&nbsp;' + (new Date().getMonth() + 1) + '&nbsp;月&nbsp;' + new Date().getDate() + '&nbsp;日'
            }]
        }, {
            xtype: 'displayfield',
            fieldLabel: '费用',
            margin: 20,
            itemId: 'cost'
        }, {
            xtype: 'button',
            text: '去支付',
            width: 150,
            margin: '0 0 0 126',
            handler: function() {
                Ext.create('Admin.view.account.combo.widgets.ConfirmComboWindow', {
                    form: this.up('form')
                });
            }
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
            var alternativeCombos = Admin.data.Combo.get('alternativeCombos');
            if (currentCombo && alternativeCombos) {
                me.down('form').rendering = true;
                var comboRadio = me.down('#plan_id');
                var agentNum = me.down('#agent_num');
                var fitsTo = {
                    basis: '适合小型网站',
                    profession: '适合服务客户较多的中型网站',
                    flagship: '适合大型或有线下客户服务网站'
                };
                var checkedIndex = {
                    experience: 0,
                    basis: 1,
                    profession: 2,
                    flagship: 3
                }
                comboRadio.removeAll();
                Ext.Array.forEach(alternativeCombos, function(item, index, allItems) {
                    comboRadio.insert(index, {
                        xtype: 'combohtmlradio',
                        width: 250,
                        height: 300,
                        name: 'plan_id',
                        inputValue: item.id,
                        disabled: index + 1 < checkedIndex[currentCombo.slug],
                        mData: {
                            comboname: item.name,
                            fitsTo: fitsTo[item.slug],
                            color: item.color,
                            price: parseInt(item.price),
                            desc: item.desc
                        }
                    });
                });

                if ('experience' === currentCombo.slug) {
                    comboRadio.setValue({
                        plan_id: comboRadio.items.getAt(0).inputValue
                    });
                } else {
                    comboRadio.setValue({
                        plan_id: currentCombo.plan_id
                    });


                    agentNum.setValue(currentCombo.agent_num);
                    agentNum.setMinValue(currentCombo.agent_num);

                    var year = me.down('#year');
                    year.setValue(currentCombo.end_at.substr(0, 4));
                    year.setMinValue(currentCombo.end_at.substr(0, 4));
                    year.next().setValue('年&nbsp;' + parseInt(currentCombo.end_at.substring(5, 7)) + '&nbsp;月&nbsp;' + parseInt(currentCombo.end_at.substring(8, 10)) + '&nbsp;日');
                }

                me.down('form').rendering = false;
                agentNum.fireEvent('change', agentNum);
            }
        }
    }
});
