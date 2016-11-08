Ext.define('Admin.view.communication.customerService.editor.widgets.WikiTool', {
    extend: 'Ext.button.Button',
    xtype: 'wikitool',
    tooltip: '知识库',
    html: '<span class="fa fa-book"></span>',
    handler: function() {
        Ext.create('Ext.window.Window', {
            autoShow: true,
            width: '70%',
            height: '70%',
            title: '知识库',
            modal: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            listeners: {
                afterrender: function() {
                    var treepanel = this.down('treepanel');
                    var firstNode = treepanel.getRootNode().childNodes[0];
                    if (firstNode) {
                        treepanel.setSelection(firstNode);
                    }
                }
            },
            items: [{
                xtype: 'treepanel',
                flex: 2,
                cls: 'shadow',
                margin: '20 10 20 20',
                scrollable: true,
                rootVisible: false,
                title: '问题',
                listeners: {
                    beforerender: function() {
                        var self = this;
                        Admin.data.WikiTree.on('nodesloaded', function() {
                            self.fireEvent('afterrender');
                        });
                    },
                    afterrender: function() {
                        var self = this;
                        self.setStore(Ext.create('Ext.data.TreeStore', {
                            root: {
                                expanded: true,
                                children: Admin.data.WikiTree.get('nodes')
                            }
                        }));
                    },
                    select: function(treeModel, record, index, eOpts) {
                        var data = record.data.metadata;
                        if (!record.isLeaf()) {
                            record.expand();
                        }
                        var wikiContent = this.next('panel');
                        var wikiData = {
                            title: data.title,
                            message: data.message
                        };
                        wikiContent.setData(wikiData);
                    }
                }
            }, {
                xtype: 'panel',
                flex: 3,
                cls: 'shadow',
                margin: '20 20 20 0',
                title: '问答详情',
                data: {
                    title: '',
                    message: ''
                },
                tpl: '<div class="wikiContent-container">' +
                    '<span class="title">{title}</span>' +
                    '<p class="message">{message}</p>' +
                    '</div>',
                bbar: ['->', {
                    text: '发送',
                    ui: 'soft-green',
                    width: 100,
                    handler: function() {
                        var record = this.up('window').down('treepanel').getSelection()[0].data.metadata;
                        var tid = Admin.data.Team.get('token');

                        var chatWindow = Ext.getCmp('chatWindow');
                        var workorderchatpanel = chatWindow.down('workorderchatpanel');
                        var trackId = workorderchatpanel.workOrder.to;
                        var userId = workorderchatpanel.workOrder.contact.extend_id;
                        var host = 'http://' + location.host.replace('app.', 'im.') + '/?tid=' + tid + '&track_id=' + trackId + '&user_id=' + userId + '&page_id=wiki' + Math.random() + '&wikiId=' + record._id;
                        var message = record.message;
                        var wiki =
                            '<span class="wiki-title">' + record.title + '</span>' +
                            '<div class="wiki-message">' + message + '</div>' +
                            '<a onclick="window.open(this.href, \'newwindow\', \'height=700, width=550, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no\');return false;" href="' + host + '#wiki" style="margin-top: 21px; display: block;" data-wikiId="' + record._id + '">查看</a>'
                        chatWindow.up().down('editorContainer').down('textarea').setValue(wiki);
                        chatWindow.up().down('editorContainer').down('textarea').focus();
                        chatWindow.up().down('editorContainer').down('sendbtn').handler();
                        this.up('window').close();
                    }
                }]
            }]
        });
    }
});
