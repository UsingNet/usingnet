/**
 * Created by jhli on 15-12-17.
 */
Ext.define('Ext.view.settings.voiceService.VoiceService', {
    extend: 'Ext.container.Container',
    xtype: 'voiceService',
    id: 'voiceServiceContainer',
    scrollable: true,
    controller: 'voiceService',
    viewModel: 'voiceService',
    layout: 'vbox',
    items: [{
        xtype: 'panel',
        title: '电话接入',
        margin: 20,
        cls: 'shadow',
        width: '100%',
        items: [{
            xtype: 'form',
            url: '/api/team',
            trackResetOnLoad: true,
            layout: 'hbox',
            fieldDefaults: {
                margin: '20 10 20 10',
                flex: 1
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: '团队电话',
                labelWidth: 60,
                name: 'bind_number',
                width: '45%'
            }, {
                xtype: 'combobox',
                fieldLabel: '假期语音提示',
                labelWidth: 85,
                name: 'offworkprompt',
                width: '45%',
                bind: {
                    store: '{voice}'
                },
                displayField: 'title',
                valueField: 'id',
                queryMode: 'remote',
                listeners: {
                    expand: function() {
                        this.store.load();
                        this.store.filter(function(record) {
                            return 'SUCCESS' === record.data.status;
                        });
                    }
                }
            }]
        }],
        tbar: [{
            text: '申请语音电话',
            ui: 'soft-green',
            hidden: true,
            handler: function() {
                var me = this;
                Ext.Msg.confirm('申请语音电话', '确认申请语音电话？', function(btnId) {
                    if ('yes' === btnId) {
                        Admin.data.Team.set('voip', {});
                        Admin.data.Team.sync();
                    }
                });
            }
        }, {
            xtype: 'tbtext',
            hidden: true,
            text: '语音电话正在申请中...',
            style: {
                color: 'red'
            }
        }, {
            xtype: 'tbtext',
            hidden: true,
            style: {
                color: 'green'
            }
        }, {
            xtype: 'tbtext',
            hidden: true,
            style: {
                color: 'red'
            }
        }],
        bbar: [{
            text: '重置',
            ui: 'soft-blue',
            handler: function() {
                var container = this.up('voiceService');
                container.fireEvent('activate', container);
            }
        }, {
            text: '提交',
            ui: 'soft-green',
            handler: function() {
                var form = this.up('voiceService').down('form').getForm(),
                    fieldValues = form.getFieldValues();
                if (!form.isDirty()) {
                    Ext.Msg.alert('错误', '表单数据没有更新。');
                    return;
                }
                if (form.isValid()) {
                    Admin.data.Team.set('voip', fieldValues);
                    Admin.data.Team.sync();
                }
            }
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Team.on('sync', function() {
                me.fireEvent('activate', me);
            });
            me.query('toolbar').forEach(function(item) {
                if ('bottom' === item.dock) {
                    item.setDisabled(true);
                }
            });
        },
        activate: 'containerActivate'
    }
});



























// layout: {
//     type: 'vbox'
// },
// requires: [
//     'Admin.view.settings.voiceService.VoiceServiceController',
//     'Admin.view.settings.voiceService.VoiceServiceModel',
//     'Ext.form.field.Time',
//     'Ext.form.field.Date'
// ],
// controller: 'voiceService',
// items: [{
//     xtype: 'panel',
//     margin: 20,
//     cls: 'shadow',
//     width: '100%',
//     viewModel: {
//         type: 'voiceService'
//     },
//     title: '电话设置',


//     tools: [{
//         xtype: 'button',
//         text: '申请语音电话',
//         ui: 'soft-green',
//         handler: function() {
//             var me = this;
//             Ext.Msg.confirm('申请语音电话', '确认申请语音电话？', function(btnId) {
//                 if ('yes' === btnId) {
//                     Admin.data.Team.set('voip', {});
//                     Admin.data.Team.sync();
//                 }
//             });
//         }
//     }],

//     tbar: [{
//         text: '申请语音电话',
//         ui: 'soft-green',
//         id: 'phoneUNOPEN',
//         hidden: true,
//         handler: function () {
//             var me = this;
//             Ext.Msg.confirm('开启语音电话', '开启语音电话后不能关闭,确认开启?', function (btnId) {
//                 if ('yes' === btnId) {
//                     Admin.data.Team.set('voip', {});
//                     Admin.data.Team.sync();
//                 }
//             });
//         }
//     }, {
//         xtype: 'tbtext',
//         id: 'phoneCHECKING',
//         hidden: true,
//         text: '语音电话正在申请中...',
//         style: {
//             color: 'red'
//         }
//     }, {
//         xtype: 'tbtext',
//         id: 'phoneSUCCESS',
//         hidden: true,
//         text: '申请成功,请绑定你的号码',
//         style: {
//             color: 'green'
//         }
//     }],

//     items: [{
//         xtype: 'form',
//         url: '/api/team',
//         id: 'phoneVoiceForm',
//         defaultType: 'textfield',
//         layout: 'responsivecolumn',
//         items: [{
//             fieldLabel: '团队电话',
//             name: 'bind_number',
//             width: '45%',
//             allowBlank: false
//         }, {
//             fieldLabel: '假期语音提示',
//             xtype: 'combobox',
//             name: 'offworkprompt',
//             width: '45%',
//             bind: {
//                 store: '{voice}'
//             },
//             displayField: 'title',
//             valueField: 'id',
//             queryMode: 'remote',
//             allowBlank: false,
//             listeners: {
//                 expand: function () {
//                     this.store.load();
//                     this.store.filter(function (record) {
//                         return 'SUCCESS' === record.data.status;
//                     });
//                 }
//             }
//         }],
//         bbar: [
//             '->', {
//                 text: '重置',
//                 ui: 'soft-blue',
//                 handler: function () {
//                     Ext.getCmp('voiceServiceContainer').getController().containerActivate();
//                 }
//             }, {
//                 text: '保存',
//                 ui: 'soft-green',
//                 formBind: true,
//                 disabled: true,
//                 handler: function () {
//                     var form = this.up('form').getForm(),
//                         fieldValues = form.getFieldValues();
//                     if (form.isValid()) {
//                         Admin.data.Team.set('voip', fieldValues);
//                         Admin.data.Team.sync();
//                     }
//                 }
//             }
//         ]

//     }]
// }],

// listeners: {
//     beforerender: function() {
//         var me = this;
//         Admin.data.Team.on('sync', function() {
//             me.fireEvent('activate', me);
//         });
//     },
//     activate: 'containerActivate'
// }
