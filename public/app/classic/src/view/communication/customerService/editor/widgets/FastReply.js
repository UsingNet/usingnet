Ext.define('Admin.view.communication.customerService.editor.widgets.FastReply', {
    extend: 'Ext.button.Split',
    xtype: 'widgetfastreply',
    showEmptyMenu: true,
    text: '快捷回复',
    handler: function() {
        this.showMenu();
    },
    listeners: {
        beforerender: function() {
            var self = this;
            Admin.data.ShortcutKeyManager.on('ctrlShiftNumPress', function(obj) {
                var item = self.menu.items.getAt(obj.number - 1);
                var editorContainer = self.up('editorContainer');
                if (item && editorContainer) {
                    editorContainer.down('textarea').setValue(item.content);
                    editorContainer.down('textarea').focus();
                    editorContainer.down('sendbtn').handler();
                }
            });
        },
        afterrender: function(component) {
            var self = this;
            Ext.Ajax.request({
                url: '/api/setting/quick-reply',
                success: function(response) {
                    var res = Ext.decode(response.responseText);
                    var items = [];
                    var text = '';
                    Ext.Array.each(res.data, function(item, index) {
                        item.content.length > 15 ? text = item.content.substr(0, 15) + '...' : text = item.content;
                        items.push({
                            content: item.content,
                            text: '<div>' + text + '&nbsp;&nbsp;&nbsp;' +
                                '<span style="float: right;">Ctrl + Shift + ' + (9 === index ? 0 : index + 1) + '</span>' +
                                '</div>',
                            xtype: 'menuitem',
                            tooltip: item.content,
                            handler: function() {
                                this.up('editorContainer').down('textarea').setValue(this.content);
                                this.up('editorContainer').down('textarea').focus();
                                this.up('editorContainer').down('sendbtn').handler();
                            }
                        });
                    });
                    items.push({
                        text: '设置',
                        xtype: 'menuitem',
                        handler: function() {
                            Ext.create('Ext.window.Window', {
                                autoShow: true,
                                modal: true,
                                scrollable: true,
                                width: '70%',
                                height: '70%',
                                title: '快捷回复设置',
                                layout: 'fit',
                                items: [{
                                    xtype: 'fastreply',
                                    listeners: {
                                        afterrender: function() {
                                            this.viewModel.storeInfo.fastreply.on('load', function() {
                                                self.fireEvent('afterrender');
                                            });
                                        }
                                    }
                                }]
                            });
                        }
                    });
                    var menu = new Ext.menu.Menu({
                        cls: 'fastReply-menu',
                        items: items
                    });
                    self.setMenu(menu, true);
                }
            });


        }
    }
});
