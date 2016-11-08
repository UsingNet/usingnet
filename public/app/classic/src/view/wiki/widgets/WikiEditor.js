/**
 * Created by jhli on 16-3-4.
 */
Ext.define('Admin.view.wiki.widgets.WikiEditor', {
    extend: 'Ext.panel.Panel',
    xtype: 'wikieditor',
    title: '编辑知识库',
    cls: 'shadow',
    bodyPadding: 20,
    layout: 'fit',
    items: [{
        xtype: 'form',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'textfield',
            itemId: 'title',
            name: 'title',
            allowBlank: false,
            fieldLabel: '问题',
            labelWidth: 50,
            margin: '0 0 20 0'
        }, {
            xtype: 'htmleditor',
            itemId: 'message',
            name: 'message',
            allowBlank: false,
            fieldLabel: '答案',
            labelWidth: 50,
            flex: 1
        }]
    }],
    bbar: ['->', {
        xtype: 'button',
        ui: 'soft-green',
        text: '保存',
        handler: function() {
            var wikiTree = this.up('wiki').down('wikitree');
            var wikiEditor = this.up('wikieditor');
            var form = this.up('wikieditor').down('form');
            if (form.isValid()) {
                var values = form.getValues();
                if (wikiEditor.hasParentNoteId) {
                    values.parent_note_id = wikiEditor.hasParentNoteId;
                }
                Ext.Ajax.request({
                    url: '/api/knowledge' + (wikiEditor.modifyNode ? '/' + wikiEditor.modifyNode._id : ''),
                    method: wikiEditor.modifyNode ? 'PUT' : 'POST',
                    jsonData: Ext.encode(values),
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (!res.success) {
                            Ext.Msg.alert('错误', res.msg);
                            return;
                        }
                        wikiEditor.hide();
                        Admin.data.WikiTree.fireEvent('updatetreedata', res.data._id);
                    },
                    failure: function(response) {
                        Ext.Msg.alert('错误', '服务器错误，保存失败。');
                    }
                });
            }
        }
    }, {
        xtype: 'button',
        ui: 'soft-blue',
        text: '取消',
        handler: function() {
            this.up('wikieditor').hide();
        }
    }],
    listeners: {
        show: function() {
            var data = this.modifyNode;
            var title = this.down('#title');
            var message = this.down('#message');
            if (data) {
                title.setValue(data.title);
                message.setValue(data.message);
            } else {
                title.setValue('');
                message.setValue('');
            }
        },
        hide: function() {
            this.hasParentNoteId = null;
            this.modifyNode = null;
        }
    }
});