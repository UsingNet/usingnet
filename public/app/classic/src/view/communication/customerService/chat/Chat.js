Ext.define('Admin.view.communication.customerService.chat.Chat', {
    extend: 'Ext.panel.Panel',
    xtype: 'chatpanel',
    controller: 'chatcontroller',
    height: '100%',
    minWidth: 630,
    title: '对话窗口',
    cls: 'shadow',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    tools: [{
        xtype: 'tbtext',
        hidden: true,
        text: '查看用户轨迹',
        listeners: {
            afterrender: function() {
                var me = this;
                var workOrderPanel = me.up('customerservice').down('workorderpanel');
                workOrderPanel.on('change', function(workorderpanel, newNode, oldNode) {
                    if (!newNode) {
                        me.hide();
                        me.next().hide();
                        me.next().next().hide();
                        return;
                    }
                    me.next('button').workOrder = newNode.workOrder;
                    me.show();
                    me.next().show();
                    me.next().next().show();
                });
            }
        }
    }, {
        xtype: 'button',
        hidden: true,
        iconCls: 'x-fa fa-eye',
        handler: function() {
            var me = this;
            Ext.create('Admin.view.communication.customerService.chat.TrackWindow', {
                user_id: me.workOrder.contact.track_id
            });
        }
    }, {
        xtype: 'panel',
        hidden: true,
        data: {},
        style: {
            cursor: 'pointer',
            marginLeft: '20px'
        },
        tpl: '<i class="x-fa fa-times" style="font-size: 27px; color: #ccc;"></i>',
        listeners: {
            afterrender: function() {
                this.el.dom.onclick = function() {
                    var me = Ext.getCmp('treelist').getSelection();
                    if (me.isOnPhone) {
                        Ext.Msg.alert('错误', '不能关闭通话状态下的工单！');
                        return;
                    }
                    if (!me.workOrder.category) {
                        Ext.create('Ext.window.Window', {
                            requires: [
                                'Ext.form.field.Checkbox'
                            ],
                            autoShow: true,
                            width: 400,
                            bodyPadding: 20,
                            modal: true,
                            viewModel: 'workordermodel',
                            layout: 'vbox',
                            title: '关闭工单',
                            items: [{
                                xtype: 'tbtext',
                                padding: '0 0 10 0',
                                text: '<b>请选择符合此次对话内容的分类：</b>'
                            }, {
                                xtype: 'combobox',
                                emptyText: '请选择或输入',
                                bind: {
                                    store: '{category}'
                                },
                                fieldLabel: '分类',
                                labelWidth: 60,
                                queryModel: 'remote',
                                width: '100%',
                                displayField: 'title',
                                valueField: 'title',
                                enableKeyEvents: true,
                                listeners: {
                                    expand: function() {
                                        this.store.load();
                                    },
                                    change: function() {
                                        var checkbox = this.next('checkbox'),
                                            win = this.up('window');
                                        if (this.getValue()) {
                                            if (checkbox) {
                                                win.checkbox = win.remove(checkbox, false);
                                            }
                                        } else {
                                            win.insert(2, win.checkbox);
                                        }
                                    },
                                    keyup: function() {
                                        this.fireEvent('change');
                                    }
                                }
                            }, {
                                xtype: 'checkbox',
                                modelValidation: true,
                                boxLabel: '若没有明确分类，请选择此项。',
                                style: {
                                    paddingLeft: '65px'
                                },
                                msgTarget: 'side',
                                validateOnChange: true,
                                getValidation: function() {
                                    return this.getValue() ? true : '请选择分类或选中此项';
                                }
                            }],
                            buttons: [{
                                text: '确定',
                                handler: function() {
                                    var checkbox = this.up('window').down('checkbox');
                                    var combo = this.up('window').down('combobox');
                                    if (checkbox && !checkbox.validate()) {
                                        return;
                                    }
                                    Ext.Ajax.request({
                                        url: '/api/order/' + me.record.id,
                                        method: 'DELETE',
                                        jsonData: Ext.encode({
                                            category: combo.value
                                        })
                                    });
                                    me.up().remove(me);
                                    var taskId = me.record.data.task_id;
                                    if (taskId) {
                                        Ext.Ajax.request({
                                            url: '/api/tasklist/' + taskId,
                                            method: 'DELETE'
                                        });
                                    }
                                    this.up('window').close();
                                }
                            }, {
                                text: '取消',
                                handler: function() {
                                    this.up('window').close();
                                }
                            }]
                        });
                    } else {
                        Ext.Msg.show({
                            title: '关闭工单',
                            message: '确认关闭与 ' + me.workOrder.contact.name + ' 的对话？',
                            buttons: Ext.Msg.YESNO,
                            icon: Ext.Msg.QUESTION,
                            fn: function(btn) {
                                if (btn === 'yes') {
                                    Ext.Ajax.request({
                                        url: '/api/order/' + me.record.id,
                                        method: 'DELETE'
                                    });
                                    me.up().remove(me);
                                    var taskId = me.record.data.task_id;
                                    if (taskId) {
                                        Ext.Ajax.request({
                                            url: '/api/tasklist/' + taskId,
                                            method: 'DELETE'
                                        });
                                    }
                                }
                            }
                        });
                    }
                };
            }
        }
    }],
    tbar: [{
        xtype: 'displayfield',
        width: '100%',
        value: '从左侧列表打开对话',
        fieldStyle: 'color: #818181;',
        style: {
            textAlign: 'center',
            marginTop: '400px'
        }
    }],
    items: [{
        xtype: 'panel',
        id: 'chatWindow',
        width: '100%',
        flex: 1,
        // layout: {
        //     type: 'vbox',
        //     align: 'stretch'
        // },
        items: [],
        listeners: {
            eventhandler: 'readEventHandler',
            add: 'chatpanelAdd',
            remove: 'chatpanelRemove',
            resize: 'chatWinResize'
        }
    }, {
        xtype: 'editorContainer',
        itemId: 'editorContainer',
        width: '100%',
        margin: '5 10 5 10'
    }]
});
