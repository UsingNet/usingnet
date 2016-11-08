/**
 * Created by henry on 15-12-31.
 */
Ext.define('Admin.view.task.widgets.CreateVoicePlanWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    closable: true,
    autoDestroy: true,
    bodyPadding: 10,
    title: '增加录音回访计划',
    modal: true,
    items: [{
        xtype: 'form',
        id: 'createSmsPlanForm',
        jsonSubmit: true,
        bodyPadding: 5,
        layout: 'responsivecolumn',
        width: 600,
        url: '/api/task',
        viewModel: {
            type: 'task'
        },
        fieldDefaults: {
            labelWidth: 60
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
            width: 590,
            layout: 'hbox',
            items: [{
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
            fieldLabel: '录音',
            pickerId: 'media_id',
            name: 'media_id',
            width: '100%',
            xtype: 'combobox',
            queryMode: 'remote',
            bind: {
                store: '{voice}'
            },
            listeners: {
                expand: function() {
                    this.getStore().load();
                }
            },
            pageSize: 20,
            displayField: 'title',
            valueField: 'id'
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '拨打时间',
            width: 590,
            layout: 'hbox',
            items: [{
                xtype: 'timefield',
                name: 'start_time',
                increment: 30,
                flex: 1
            }, {
                html: '至',
                padding: 5
            }, {
                xtype: 'timefield',
                name: 'end_time',
                increment: 30,
                flex: 1
            }]
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
                        type: 'VOIP_RECORD'
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
