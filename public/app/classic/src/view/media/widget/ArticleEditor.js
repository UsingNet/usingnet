/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.view.media.widget.ArticleEditor', {
    extend: 'Ext.window.Window',
    title: '添加模板',
    id: 'articleEditor',
    width: 800,
    closable: true,
    autoShow: true,
    autoDestroy: true,
    modal: true,
    layout: 'fit',
    listeners: {
        afterrender: function(me) {
            me.store = me.recordToEdit ? me.recordToEdit.store : Ext.getCmp('articleGrid').getStore();
            me.store.addListener('write', function() {
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
                var title = Ext.getCmp('articleForm').getForm().findField('title').value,
                    text = Ext.getCmp('articleForm').getForm().findField('text').value;
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

                    self.recordToEdit = store.add(Ext.create('Admin.model.media.Article', {
                        title: title,
                        content: text
                    }));
                    if (self.recordToEdit instanceof Array) {
                        self.recordToEdit = self.recordToEdit[0];
                    }
                    self.isForEdit = true;
                }
            }
        }
    ],
    items: [{
        xtype: 'form',
        width: '90%',
        id: 'articleForm',
        bodyPadding: 10,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        items: [{
            width: '80%',
            layout: 'responsivecolumn',
            items: [{
                xtype: 'textfield',
                name: 'title',
                width: '100%',
                fieldLabel: '标题',
                labelWidth: 35
            }, {
                xtype: 'htmleditor',
                id: 'mailbodyeditor',
                height: 300,
                width: '100%',
                name: 'text',
                fieldLabel: '内容',
                labelWidth: 35
                    // labelAlign: 'top',
                    // labelSeparator: ''
            }]
        }, {
            xtype: 'variableselector',
            getEditor: function() {
                return Ext.getCmp('mailbodyeditor');
            },
            margin: '117 0 0 5'
        }],
        item: [{
            flex: 1,
            items: [{
                xtype: 'textfield',
                name: 'title',
                // width: '100%',
                fieldLabel: '标题',
                labelWidth: 35
            }, {
                xtype: 'htmleditor',
                id: 'mailbodyeditor',
                height: 300,
                name: 'text',
                fieldLabel: '内容',
                labelWidth: 35
                    //labelAlign: 'top',
                    //labelSeparator: ''
            }]
        }, {
            xtype: 'variableselector',
            flex: 1,
            getEditor: function() {
                return Ext.getCmp('mailbodyeditor');
            },
            margin: '86 0 0 5'
        }]
    }]
});
