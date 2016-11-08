/**
 * Created by henry on 15-12-31.
 */
Ext.define('Admin.view.task.widgets.CreatePhonePlanWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    closable: true,
    autoDestroy: true,
    bodyPadding: 10,
    title: '增加客服电话回访计划',
    modal: true,
    items: [{
        xtype: 'form',
        id: 'createSmsPlanForm',
        jsonSubmit: true,
        bodyPadding: 5,
        layout: 'responsivecolumn',
        width: 800,
        url: '/api/task',
        viewModel: {
            type: 'task'
        },
        fieldDefaults: {
            labelWidth: 40
        },
        items: [{
            xtype: 'textfield',
            name: 'title',
            fieldLabel: '名称',
            width: '100%',
            allowBlank: false // requires a non-empty value
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '客户',
            width: 790,
            layout: 'hbox',
            items: [{
                // pickerId according to https://www.sencha.com/forum/showthread.php?303101
                pickerId: 'receivers',
                name: 'receivers',
                xtype: 'tagfield',
                flex: 1,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'remote',
                valueNotFoundText: '批量导入',
                pageSize: 20,
                queryParam: 'query',
                bind: {
                    store: '{phonecontacts}'
                },
                listeners: {
                    expand: function() {
                        this.getStore().load();
                    }
                }
            }, {
                xtype: 'importmenu',
                margin: '0 0 0 5',
                listeners: {
                    change: function() {
                        this.previousSibling().setValue(this.data);
                        this.previousSibling().value = this.data;
                    }
                }
            }]
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '客服',
            width: 790,
            layout: 'hbox',
            items: [{
                // pickerId according to https://www.sencha.com/forum/showthread.php?303101
                pickerId: 'members',
                name: 'assigners',
                xtype: 'tagfield',
                flex: 1,
                displayField: 'name',
                valueField: 'id',
                queryMode: 'remote',
                pageSize: 20,
                bind: {
                    store: '{members}'
                },
                listeners: {
                    expand: function() {
                        this.getStore().load();
                    }
                }
            }, {
                xtype: 'checkbox',
                fieldLabel: '全部',
                name: 'assigners_all',
                labelWidth: 30,
                padding: '0 0 0 5',
                listeners: {
                    change: function(self, newValue) {
                        this.up('fieldcontainer').down('tagfield').setDisabled(newValue);
                    }
                }
            }]
        }, {
            xtype: 'htmleditor',
            fieldLabel: '参考',
            width: '100%',
            name: 'reference'
        }]
    }],
    bbar: [
        '->', {
            xtype: 'button',
            text: '提交',
            ui: 'soft-green',
            handler: function() {
                var form = Ext.getCmp('createSmsPlanForm');
                var me = this;
                me.setDisabled(true);
                form.submit({
                    params: {
                        type: 'VOIP_STAFF'
                    },
                    success: function(form, action) {
                        me.setDisabled(false);
                        var dialog = form.owner.up();
                        dialog.close();
                        Ext.getCmp('taskGrid').getStore().reload();
                        var taskListStore = Ext.data.StoreManager.lookup('storeTaskList');
                        if (taskListStore) {
                            taskListStore.reload();
                        }
                    },
                    failure: function(form, action) {
                        me.setDisabled(false);
                        //var res = Ext.JSON.decode(action.response.responseText);
                        //var msg = res.msg ? res.msg : '提交失败，请稍后重试';
                        //Ext.Msg.alert('错误', msg);
                        if (action.response && action.response.responseText) {
                            var res = Ext.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('错误', res.msg);
                        } else {
                            Ext.Msg.alert('错误', '提交失败，请稍后重试。');
                        }
                    }
                });
            }
        }
    ]
});
