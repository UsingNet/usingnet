Ext.define('Admin.view.task.widget.CreateTaskWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    closable: true,
    bodyPadding: 10,
    title: '增加任务',
    items: [{
        xtype: 'form',
        id: 'createTaskForm',
        jsonSubmit: true,
        bodyPadding: 5,
        layout: 'responsivecolumn',
        width: 600,
        url: '/api/task',
        viewModel: {
            type: 'task'
        },
        items: [{
            fieldLabel: '任务类型',
            editable: false,
            xtype: 'combobox',
            name: 'type',
            width: '100%',
            displayField: 'name',
            valueField: 'type',
            mode: 'local',
            autoSelect: true,
            bind: {
                store: '{taskType}'
            },
            listeners: {
                change: function(self, newValue, oldValue, eOpts) {

                    var form = self.up();
                    var formItems = form.items.items;
                    while (formItems.length > 1) {
                        form.remove(formItems[1], true);
                    }

                    var
                        receivers = {
                            fieldLabel: '客户',
                            // pickerId according to https://www.sencha.com/forum/showthread.php?303101
                            pickerId: 'receivers',
                            name: 'receivers',
                            xtype: 'tagfield',
                            width: '100%',
                            displayField: 'name',
                            valueField: 'id',
                            queryMode: 'remote',
                            pageSize: 20,
                            store: self.up('form').viewModel.storeInfo.contacts
                        },
                        assigners = {
                            fieldLabel: '指派人',
                            pickerId: 'assigners',
                            width: '100%',
                            name: 'assigners',
                            xtype: 'tagfield',
                            displayField: 'name',
                            valueField: 'id',
                            queryMode: 'remote',
                            pageSize: 20,
                            store: self.up('form').viewModel.storeInfo.members
                        },
                        media = {
                            fieldLabel: '媒体',
                            pickerId: 'media_id',
                            name: 'media_id',
                            width: '100%',
                            xtype: 'combobox',
                            queryMode: 'remote',
                            pageSize: 20,
                            displayField: 'title',
                            valueField: 'id'
                        };

                    form.add({
                        fieldLabel: '任务标题',
                        xtype: 'textfield',
                        width: '100%',
                        name: 'title'
                    });

                    if ('VOIP_STAFF' === newValue) {

                        form.add(assigners);
                        form.add(receivers);
                    } else {
                        switch (newValue) {
                            case 'MAIL':
                                media.store = self.up('form').viewModel.storeInfo.article;
                                break;
                            case 'SMS':
                                media.store = self.up('form').viewModel.storeInfo.sms;
                                break;
                            case 'VOIP_RECORD':
                                media.store = self.up('form').viewModel.storeInfo.voice;
                                break;
                        }
                        form.add(receivers);
                        form.add(media);
                    }
                },
                afterrender: function(self, eOpts) {
                    self.setValue('MAIL');
                }
            }
        }]

        // buttons: [{
        //     text: '提交',
        //     ui: 'soft-green',
        //     style: {
        //         backgroundColor: '#fff'
        //     },
        //     handler: function() {
        //         var form = this.up('form').getForm();
        //         form.submit({
        //             success: function(form, action) {
        //                 var dialog = form.owner.up();
        //                 dialog.close();
        //                 Ext.getCmp('taskGrid').getStore().reload();
        //                 var taskListStore = Ext.data.StoreManager.lookup('storeTaskList');
        //                 if (taskListStore) {
        //                     taskListStore.reload();
        //                 }
        //             },
        //             failure: function(form, action) {
        //                 var res = Ext.JSON.decode(action.response.responseText);
        //                 var msg = res.msg ? res.msg : '提交失败，请稍后重试';
        //                 Ext.Msg.alert('错误', msg);
        //             }
        //         });
        //     }
        // }]
    }, {
        xtype: 'toolbar',
        items: [
            '->', {
                xtype: 'button',
                text: '导入客户信息',
                ui: 'soft-blue',
                handler: function() {
                    var form = Ext.getCmp('createTaskForm');
                    if (!this.flag) {

                        form.add({
                            fieldLabel: '客户ID',
                            xtype: 'textfield',
                            width: '100%',
                            name: 'customId',
                            emptyText: '请输入客户id,以逗号分隔.'
                        });
                        this.flag = true;
                        this.setText('取消导入');
                    } else {
                        form.remove(form.items.items[4], true);
                        this.setText('导入客户信息');
                        this.flag = false;
                    }
                }
            }, {
                xtype: 'button',
                text: '提交',
                ui: 'soft-green',
                handler: function() {
                    var form = Ext.getCmp('createTaskForm');

                    var customId = form.getForm().getFieldValues().customId;

                    if (customId) {
                        var reg = /^(\d+[,，]?)+$/;
                        if (!reg.test(customId)) {
                            Ext.Msg.alert('错误', '导入客户信息输入框存在非法字符.');
                            return;
                        } else {
                            var arr = customId.replace(/\，/g, ',').replace(/[,，]$/, '').split(',');
                            var receivers = form.getForm().getFieldValues().receivers;

                            form.getForm().findField('receivers').setValue(arr.concat(receivers));
                        }
                    }

                    form.submit({
                        success: function(form, action) {
                            var dialog = form.owner.up();
                            dialog.close();
                            Ext.getCmp('taskGrid').getStore().reload();

                            var taskListStore = Ext.data.StoreManager.lookup('storeTaskList');
                            if (taskListStore) {
                                taskListStore.reload();
                            }
                        },
                        failure: function(form, action) {
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
    }]
});
