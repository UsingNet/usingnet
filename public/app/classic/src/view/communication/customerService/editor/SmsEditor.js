Ext.define('Admin.view.communication.customerService.editor.SmsEditor', {
    extend: 'Admin.view.communication.customerService.editor.BaseEditor',
    xtype: 'smseditor',

    flex: 1,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    viewModel:{
        type:'mediaEditor'
    },
    items: [{
        xtype: 'panel',
        width: '80%',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [
        //    {
        //    xtype: 'textfield',
        //    itemId: 'titleEditor',
        //    emptyText: '保存到模板时请输入短信模板标题',
        //    labelWidth: 59,
        //    fieldLabel: '标题',
        //    width: '100%'
        //},
            {
            xtype: 'textarea',
            enableKeyEvents: true,
            fieldLabel: '内容',
            labelWidth: 59,
            flex: 1,
            enforceMaxLength: true,
            maxLength: 160,
            listeners: {
                change: function(textarea, newValue, oldValue, eOpts) {
                    var l = newValue.length;
                    var blen = 0;
                    for (i = 0; i < l; i++) {
                        if ((newValue.charCodeAt(i) & 0xff00) != 0) {
                            blen++;
                        }
                        blen++;
                    }
                    this.up('smseditor').down('#smsLengthText').setText('短信长度剩余' + (160 - blen) + '个字符.');
                }
            }
        }]
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
            //store: Ext.data.StoreManager.lookup('Admin.store.media.Sms') || Ext.create('Admin.store.media.Sms'),
            bind:{
                store:'{sms}'
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
            xtype: 'facetool'
        }, {
            xtype: 'tbtext',
            itemId: 'smsLengthText',
            text: '短信长度剩余160个字符.'
        }, '->',
        //    {
        //    xtype: 'savetotemplate'
        //},
            {
            xtype: 'sendbtn'
        }]
    }
});
