/**
 * Created by henry on 15-12-31.
 */
Ext.define('Admin.view.task.widgets.CreateEmailPlanWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    closable: true,
    autoDestroy: true,
    bodyPadding: 10,
    title: '增加邮件回访计划',
    modal: true,
    items: [{
        xtype: 'form',
        id: 'createEmailPlanForm',
        jsonSubmit: true,
        bodyPadding: 5,
        layout: 'responsivecolumn',
        width: 600,
        url: '/api/task',
        viewModel: {
            type: 'task'
        },
        items: [{
            xtype: 'textfield',
            name: 'title',
            fieldLabel: '名称',
            labelWidth: 35,
            width: '100%',
            allowBlank: false // requires a non-empty value
        }, {
            xtype: 'fieldcontainer',
            fieldLabel: '客户',
            labelWidth: 35,
            width: 590,
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
                    store: '{emailcontacts}'
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
            fieldLabel: '模板',
            pickerId: 'media_id',
            labelWidth: 35,
            name: 'media_id',
            width: '100%',
            xtype: 'combobox',
            queryMode: 'remote',
            bind: {
                store: '{article}'
            },
            pageSize: 20,
            displayField: 'title',
            valueField: 'id',
            listeners: {
                expand: function() {
                    this.getStore().load();
                }
            }
        }]
    }],
    bbar: [
        '->', {
            xtype: 'button',
            text: '提交',
            ui: 'soft-green',
            handler: function() {
                var me = this;
                var form = Ext.getCmp('createEmailPlanForm');
                me.setDisabled(true);
                form.submit({
                    params: {
                        type: 'MAIL'
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
