/**
 * Created by henry on 15-12-31.
 */
Ext.define('Admin.view.settings.mail.widgets.Domain', {
    extend: 'Ext.form.Panel',
    xtype: 'maildomain',
    viewModel: {
        type: 'domain'
    },
    items: [{
        xtype: 'fieldcontainer',
        fieldLabel: '邮箱',
        labelWidth: 30,
        // The body area will contain three text fields, arranged
        // horizontally, separated by draggable splitters.
        layout: 'hbox',
        items: [{
            xtype: 'textfield',
            name: 'localname',
            allowBlank: false,
            anchor: '100%',
            emptyText: '名称',
            flex: 1
        }, { html: '@', style: { 'lineHeight': '22px', margin: '5px' } }, {
            xtype: 'textfield',
            name: 'domain',
            emptyText: '域名',
            allowBlank: false,
            anchor: '100%',
            flex: 1
        }, {
            xtype: 'splitter'
        }, {
            xtype: 'button',
            ui: 'soft-green',
            // hidden: true,
            text: '提交审核',
            handler: function() {
                Admin.data.Team.set('mail', this.up('form').getValues());
                Admin.data.Team.sync();
            }
        }, {
            fieldLabel: '状态',
            labelWidth: 40,
            xtype: 'displayfield',
            margin: '0 0 0 20'
        }, {
            html: '',
            flex: 3
        }],
        listeners: {
            afterrender: function() {
                var me = this;
                Admin.data.Team.on('sync', function() {
                    var status = Admin.data.Team.get('mail.status');
                    var map = {
                        'SUCCESS': '审核成功。',
                        'FAIL': '审核失败，请修改后重新提交。',
                        'CHECKING': '正在审核。'
                    };
                    me.down('button').setText(['SUCCESS', 'CHECKING'].indexOf(status) > -1 ? '修改' : '提交审核');
                    me.down('displayfield').setHidden('INIT' === status);
                    me.down('displayfield').setValue(map[status]);
                });
            }
        }
    }, {
        hidden: false,
        items: [{
            html: '<p>请按下面的 <b>记录列表</b> 解析域名，以完成邮件接入:</p>',
            margin: 5
        }, {
            xtype: 'grid',
            id: 'dnsInfo',
            height: '100%',
            bind: {
                store: '{dns}'
            },
            viewConfig: {
                enableTextSelection: true
            },
            columns: [{
                text: '主机记录',
                dataIndex: 'host',
                renderer: function(value, meta, record) {
                    return '<div style="white-space: normal;word-break: break-all;">' + value + '</div>';
                }
            }, {
                text: '记录类型',
                dataIndex: 'type',
                renderer: function(value, meta, record) {
                    return '<div style="white-space: normal;word-break: break-all;">' + value + '</div>';
                }
            }, {
                text: '记录值',
                dataIndex: 'record',
                flex: 1,
                renderer: function(value, meta, record) {
                    return '<div style="white-space: normal;word-break: break-all;">' + value + '</div>';
                }
            }]
        }]
    }],
    listeners: {
        afterrender: function(self) {
            var me = this;
            Admin.data.Team.addListener('sync', function() {
                me.fireEvent('beforerender');
            });
        },
        beforerender: function() {
            var fields = this.getForm().getFields();
            var mail = Admin.data.Team.get('mail');
            if (mail) {
                fields.each(function(field) {
                    if (field.name && mail[field.name]) {
                        field.setValue(mail[field.name]);
                    }
                });
            }

        }
    }
});
