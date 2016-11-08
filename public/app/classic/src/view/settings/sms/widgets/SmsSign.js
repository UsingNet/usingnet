/**
 * Created by henry on 15-12-29.
 */
Ext.define('Admin.view.settings.sms.widgets.SmsSign', {
    extend: 'Ext.form.Panel',
    xtype: 'smssign',
    defaultType: 'textfield',
    layout: 'responsivecolumn',
    title: '回访短信设置',
    margin: '20 0 0 0',
    cls: 'shadow',
    items: [{
        xtype: 'fieldcontainer',
        layout: 'hbox',
        fieldLabel: '短信签名',
        labelWidth: 60,
        items: [{
            name: 'signature',
            xtype: 'textfield',
            allowBlank: false
        }, {
            xtype: 'tbtext',
            text: '',
            style: {
                lineHeight: '30px',
                height: '30px'
            }
        }]

    }, {
        xtype: 'panel',
        html: '注：应工信部要求，所有106号段发送的短信都需要添加短信签名。此短信签名将会出现在发送回访短信的开头处。'
    }],
    bbar: [
        '->', {
            text: '重置',
            ui: 'soft-blue',
            handler: function() {
                this.up('smssign').fireEvent('beforerender');
            }
        }, {
            text: '保存',
            ui: 'soft-green',
            formBind: true,
            disabled: true,
            handler: function() {
                var values = this.up('smssign').getValues();
                Admin.data.Team.set('sms', values);
                Admin.data.Team.sync();
            }
        }
    ],
    listeners: {

        afterrender: function() {
            var self = this;
            Admin.data.Team.addListener('sync', function() {
                self.fireEvent('beforerender');
            });
        },
        beforerender: function() {
            var items = this.down('fieldcontainer').items.items;
            var smsInfo = Admin.data.Team.get('sms');
            var statusMap = {
                FAIL: '【审核未通过】',
                SUCCESS: '【审核通过】',
                CHECKING: '【审核中】'
            };
            if (smsInfo) {
                Ext.Array.forEach(items, function(field) {
                    if (field.name) {
                        field.setValue(smsInfo[field.name]);
                    }
                    if ('tbtext' === field.xtype) {
                        field.setText(statusMap[smsInfo.status]);
                    }
                });
            }
        }
    }
});
