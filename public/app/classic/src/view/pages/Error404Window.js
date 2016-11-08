Ext.define('Admin.view.pages.Error404Window', {
    extend: 'Admin.view.pages.ErrorBase',
    xtype: 'page404',

    requires: [
        'Admin.view.authentication.AuthenticationController',
        'Ext.container.Container',
        'Ext.form.Label',
        'Ext.layout.container.VBox',
        'Ext.toolbar.Spacer'
    ],

    items: [{
        xtype: 'container',
        width: 400,
        cls: 'error-page-inner-container',
        layout: {
            type: 'vbox',
            align: 'center',
            pack: 'center'
        },
        items: [{
            xtype: 'label',
            // cls: 'error-page-top-text',
            text: '我们来到了一片荒无人烟的土地。',
            style: {
                fontSize: '20px'
            }
        }, {
            xtype: 'label',
            cls: 'error-page-desc',
            style: {
                marginTop: '30px',
                fontSize: '16px'
            },
            html: '3秒后将跳转到首页。<a href="//' + location.host + '/#dashboard' +'">手动跳转</a>'
        }, {
            xtype: 'tbspacer',
            flex: 1
        }],
        listeners: {
            afterrender: function() {
                setTimeout(function() {
                    if ('#dashboard' !== location.hash) {
                        location.hash = '#dashboard';
                    }
                }, 3000);
            }
        }
    }]
});
