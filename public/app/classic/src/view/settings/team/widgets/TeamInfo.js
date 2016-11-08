/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.settings.team.widgets.TeamInfo', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.data.request.Form',
        'Ext.form.Panel',
        'Ext.Ajax',
        'Ext.layout.container.Form'
    ],
    xtype: 'teaminfo',

    viewModel: {
        type: 'team'
    },

    margin: 20,
    cls: 'shadow',
    width: '100%',
    title: '基本设置',
    items: [{
            xtype: 'form',
            url: '/api/team',
            id: 'baseSettingForm',
            defaultType: 'textfield',
            layout: 'responsivecolumn',
            items: [{
                fieldLabel: '团队名称',
                name: 'name',
                width: '48%',
                allowBlank: false
            }, {
                xtype: 'hiddenfield',
                name: 'logo',
                listeners: {
                    change: function(self, newValue) {
                        Ext.getCmp('logo-display').setSrc(newValue + '-avatar');
                    }
                }
            }, {
                xtype: 'displayfield',
                fieldLabel: 'Logo',
                width: '5%'
            }, {
                name: 'logo-display',
                id: 'logo-display',
                xtype: 'image',
                margin: '0 0 0 -20px',
                style: {
                    border: "3px solid #3C8DBC",
                    padding: '1px',
                    width: '100px',
                    height: '100px'
                }
            }, {
                xtype: 'form',
                width: 100,
                height: 100,
                margin: '0 0 0 -100px',
                style: {
                    opacity: 0.01,
                    cursor: 'pointer'
                },
                url: '/api/upload',
                items: [{
                    xtype: 'filefield',
                    name: 'file',
                    id: 'uploadLogoBtn',
                    margin: '0 0 0 -89px',
                    height: 100,
                    width: 100,
                    style: {
                        zoom: 10,
                        cursor: 'pointer'
                    },
                    listeners: {
                        change: function() {
                            this.up('form').getForm().submit({
                                success: function(form, action) {
                                    var data = Ext.decode(action.response.responseText);
                                    if (data.success) {
                                        var upForm = Ext.getCmp('baseSettingForm').getForm();
                                        var values = upForm.getValues();
                                        values['logo'] = data.data;
                                        upForm.setValues(values);
                                    } else {
                                        Ext.Msg.alert('错误', data.msg);
                                    }
                                },
                                failure: function(form, action) {
                                    if(action && action.result && action.result.msg){
                                        Ext.Msg.alert('失败', action.result.msg);
                                    }else{
                                        Ext.Msg.alert('错误', '服务器错误，请稍后再试。');
                                    }
                                }
                            })
                        }
                    }
                }]
            }],
            bbar: [
                '->', {
                    text: '重置',
                    ui: 'soft-blue',
                    handler: function() {
                        this.up('form').fireEvent('beforerender');
                    }
                }, {
                    text: '保存',
                    ui: 'soft-green',
                    formBind: true,
                    disabled: true,
                    handler: function() {
                        var form = this.up('form').getForm(),
                            fieldValues = form.getFieldValues();
                        if (form.isValid()) {
                            Admin.data.Team.setBatch(form.getValues());
                            Admin.data.Team.sync();
                        }
                    }
                }
            ],
            listeners: {
                afterrender: function(self) {
                    Admin.data.Team.addListener('sync', function() {
                        this.fireEvent('beforerender');
                    });
                },
                beforerender: function() {
                    var items = Ext.getCmp('baseSettingForm').items.items;
                    Ext.Array.forEach(items, function(field) {
                        if (field.name) {
                            if (Admin.data.Team.get(field.name)) {
                                field.setValue(Admin.data.Team.get(field.name));
                            }
                        }
                    });
                }
            }
        }

    ]

});
