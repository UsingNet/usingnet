Ext.define('Admin.view.communication.autoReply.AutoReply', {
    extend: 'Ext.container.Container',
    xtype: 'autoreply',
    scrollable: true,
    //layout: 'fit',
    controller: 'autoreplycontroller',
    items: [{
        xtype: 'panel',
        title: '自动回复',
        margin: 20,
        cls: 'shadow',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'autowelcome',
            minHeight: 200
        }, {
            xtype: 'autotimeout',
            minHeight: 250
        }, {
            xtype: 'autobye',
            minHeight: 200
        }, {
            xtype: 'autooffwork',
            minHeight: 200
        }]
    }],
    listeners: {
        afterrender: function() {
            this.query('#messageContainer').forEach(function(item) {

                (function(panel) {
                    panel.el.dom.addEventListener('mouseover', function() {
                        var modifyBtn = panel.down('#modify');
                        if (!modifyBtn.isModifying) {
                            modifyBtn.show();
                        }
                    });
                    panel.el.dom.addEventListener('mouseout', function() {
                        var modifyBtn = panel.down('#modify');
                        if (!modifyBtn.isModifying) {
                            modifyBtn.hide();
                        }
                    });
                })(item)


            });
        }
    }
});