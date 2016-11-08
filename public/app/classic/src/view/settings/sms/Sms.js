/**
 * Created by henry on 15-12-29.
 */
Ext.define('Admin.view.settings.sms.Sms', {
    extend: 'Ext.container.Container',
    scrollable: true,
    requires: [
        'Ext.data.request.Form',
        'Ext.form.Panel',
        'Ext.Ajax',
        'Ext.layout.container.Form'
    ],
    xtype: 'sms',

    margin: 20,
    width: '100%',
    items: [{
        xtype: 'apphub',
        hidden: true
    }, {
        xtype: 'smssign'
    }],
    listeners: {
        activate: function(panel) {
            if (!Admin.data.Identity.get('status') || 'SUCCESS' !== Admin.data.Identity.get('status')) {
                var smssign = panel.down('smssign');
                // smssign.down('toolbar').setConfig('maskOnDisable', false);
                smssign.down('toolbar').setDisabled(true);
                if (!smssign.hasWarning) {
                    smssign.addTool({
                        xtype: 'tbtext',
                        style: {
                            color: 'red'
                        },
                        text: '要使用回访短信设置功能，请到本系统“账户”-“团队认证”进行公司认证，审核通过后即可进行短信设置。'
                    });
                    smssign.hasWarning = true;
                }
            }
        }
    }
});
