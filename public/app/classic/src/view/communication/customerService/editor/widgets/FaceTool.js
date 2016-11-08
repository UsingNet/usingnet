Ext.define('Admin.view.communication.customerService.editor.widgets.FaceTool', {
    extend: 'Ext.button.Button',
    xtype: 'facetool',
    tooltip: '表情',
    html: '<span class="fa fa-smile-o"></span>',
    handler: function() {
        if (!this.faceDialog) {
            this.faceDialog = Ext.create('Ext.container.Container', {
                xtype: 'facedialog',
                autoDestory: true,
                autoShow: true,
                floating: true,
                hideHeaders: true,
                height: 240,
                width: 390,
                listeners: {
                    render: function() {
                        var FaceLib = Ext.ClassManager.lookupName('Admin.view.communication.customerService.singleton.FaceLib');
                        var self = this;
                        Ext.Array.each(FaceLib.QQFaceList, function(item) {
                            self.add({
                                xtype: 'button',
                                style: {
                                    background: '#FFF',
                                    borderColor: '#EEE'
                                },
                                width: 30,
                                height: 30,
                                padding: 0,
                                margin: 0,
                                html: FaceLib.textToHtml('[' + item + ']'),
                                value: '[' + item + ']',
                                title: item,
                                handler: function() {
                                    var dialog = this.up();
                                    dialog.data = this.value;
                                    dialog.hide();
                                }
                            });
                        });
                    },
                    show: function() {
                        this.data = null;
                    }
                }
            });
            this.faceDialog.addListener('hide', function() {
                if (this.data) {
                    // var messageEditor = Ext.getCmp('messageEditor');
                    var panel = Ext.getCmp('sendTypeCombo').up('customerservice');
                    var messageEditor = panel.down('textarea') || panel.down('htmleditor');
                    messageEditor.setValue(messageEditor.value + this.data);
                    messageEditor.focus();
                }
            });
            this.faceDialog.showBy(this, null, [this.faceDialog.width / 2 - this.getWidth() / 2, -this.faceDialog.height / 2 - this.getHeight() / 2]);
        } else {
            if (this.faceDialog.isHidden()) {
                this.faceDialog.showBy(this, null, [this.faceDialog.width / 2 - this.getWidth() / 2, -this.faceDialog.height / 2 - this.getHeight() / 2]);
            } else {
                this.faceDialog.hide();
            }
        }
    },
    listeners: {
        blur: function() {
            if (this.faceDialog) {
                var self = this;
                setTimeout(function() {
                    self.faceDialog.hide();
                }, 200);
            }
        }
    }
});
