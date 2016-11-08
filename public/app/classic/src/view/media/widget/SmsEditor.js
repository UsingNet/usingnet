/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.widget.SmsEditor', {
    extend: 'Ext.window.Window',
    bodyPadding: 30,
    title: '添加短信',
    id: 'smsEditor',
    modal: true,
    closable: true,
    autoDestroy: true,
    autoShow: true,
    layout: 'responsivecolumn',
    width: 800,
    listeners:{
        afterrender:function(me){
            me.store = me.recordToEdit ? me.recordToEdit.store : Ext.getCmp('smsGrid').getStore();
            me.store.addListener('write', function(){
                me.close();
                me.store.removeListener('write', arguments.callee);
            });
        }
    },
    buttons: [
        '->', {
            text: '关闭',
            ui: 'soft-blue',
            handler: function() {
                this.ownerCt.up().close();
            }
        }, {
            text: '保存',
            ui: 'soft-green',
            handler: function() {
                var title = Ext.getCmp('smsForm').getForm().findField('smsTitle').value,
                    text = Ext.getCmp('smsForm').getForm().findField('smsContent').value;
                var self = this.ownerCt.up();
                var store = self.store;
                if (self.isForEdit) {
                    var record = self.recordToEdit;
                    store.beginUpdate();
                    record.set('title', title);
                    record.set('content', text);
                    store.endUpdate();
                    //this.ownerCt.up().close();
                } else {
                    self.recordToEdit = store.add(Ext.create('Admin.model.media.Sms', {
                        title: title,
                        content: text
                    }));
                    if(self.recordToEdit instanceof Array){
                        self.recordToEdit = self.recordToEdit[0];
                    }
                    self.isForEdit = true;
                }
            }
        }
    ],
    items: [{
        xtype: 'form',
        id: 'smsForm',
        width: 570,
        items: [{
            xtype: 'textfield',
            width: '100%',
            name: 'smsTitle',
            labelAlign: 'top',
            fieldLabel: '标题',
            allowBlank: false
        }, {
            xtype: 'textarea',
            width: '100%',
            id: 'smsbodyeditor',
            name: 'smsContent',
            fieldLabel: '短信',
            labelAlign: 'top',
            allowBlank: false
        }, {
            html: '剩余12字'
        }]
    }, {
        xtype: 'variableselector',
        margin: '30 0 0 0',
        getEditor: function() {
            return Ext.getCmp('smsbodyeditor');
        }
    }, {
        items: [{
            html: '注：'
        }, {
            html: '1、短信模板审核时间为2个工作日'
        }, {
            html: '2、违反“遵守网络内容传播九不准”的申请不予通过'
        }, {
            html: '3、违反其他相关规定的申请不予通过'
        }]
    }]
});
