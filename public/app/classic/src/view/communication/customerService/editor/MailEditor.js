Ext.define('Admin.view.communication.customerService.editor.MailEditor', {
    extend: 'Admin.view.communication.customerService.editor.BaseEditor',
    xtype: 'maileditor',
    viewModel:{
        type:'mediaEditor'
    },
    flex: 1,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'panel',
        itemId: 'mailEditorBody',
        width: '80%',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'textfield',
            itemId: 'titleEditor',
            fieldLabel: '标题',
            labelWidth: 60
        }
        ]
    }, {
        xtype: 'panel',
        flex: 1,
        margin: '0 0 0 5',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'templatecombobox',
            //store: Ext.data.StoreManager.lookup('Admin.store.media.Article') || Ext.create('Admin.store.media.Article'),
            bind:{
              store:'{article}'
            },
            displayField: 'title',
            valueField: 'content',
            queryMode: 'remote'
        }, {
            xtype: 'variablepanel'
        }]
    }],
    dockedItems: {
        xtype: 'toolbar',
        dock: 'bottom',
        padding: '5 0 0 64',
        items: [{
            xtype: 'checkbox',
            boxLabel: '纯文本',
            listeners: {
                change: function (checkbox, newValue, oldValue, eOpts) {
                    var editor = this.up('maileditor');
                    if (newValue) {
                        editor.updateHtmlEditorActive(false);
                        editor.updateTextAreaActive(true);
                    } else {
                        editor.updateTextAreaActive(false);
                        editor.updateHtmlEditorActive(true);
                    }
                }
            }
        }, '->', {
            xtype: 'savetotemplate'
        }, {
            xtype: 'sendbtn'
        }]
    },

    updateTextAreaActive: function (actived) {
        var body = this.down('#mailEditorBody');
        var me = this;
        if (actived) {
            body.add(body.storeTextArea ? body.storeTextArea : {
                xtype: 'textarea',
                fieldLabel: '内容',
                labelWidth: 60,
                width: '100%',
                enableKeyEvents: true,
                flex: 1,
                listeners: {
                    keypress: function (self, e) {
                        me.fireEventArgs('inputKeypress', [this.up('maileditor'), e])
                    }
                }
            });
        } else {
            body.storeTextArea = body.remove(body.down('textarea'), false);
        }
    },
    updateHtmlEditorActive: function (actived) {
        var body = this.down('#mailEditorBody');
        if (actived) {
            body.add({
                xtype: 'htmleditor',
                fieldLabel: '内容',
                labelWidth: 60,
                width: '100%',
                flex: 1
            });
            body.down('htmleditor').setValue(body.storeHtmlEditor);
        } else {
            body.storeHtmlEditor = body.down('htmleditor').getValue();
            body.remove(body.down('htmleditor'), true);
        }
    },
    listeners: {
        added: function () {
            if (this.down('checkbox').getValue()) {
                this.updateTextAreaActive(true);
            } else {
                this.updateHtmlEditorActive(true);
            }
        },
        removed: function () {
            if (this.down('checkbox').getValue()) {
                this.updateTextAreaActive(false);
            } else {
                this.updateHtmlEditorActive(false);
            }
        }
    }
});
