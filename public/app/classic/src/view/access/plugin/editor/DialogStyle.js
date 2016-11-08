/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.access.plugin.editor.DialogStyle', {
    extend: 'Admin.view.component.AutoForm',
    xtype: 'editor_dialog_style',
    title: '对话框样式',
    margin: 20,
    bodyPadding: 20,
    cls: 'shadow',
    items: [{
        xtype: 'panel',
        layout: 'hbox',
        items: [{
            xtype: 'container',
            items: [{
                xtype: 'fieldcontainer',
                fieldLabel: '请选择对话框颜色',
                labelAlign: 'top',
                items: [{
                    xtype: 'radiogroup',
                    defaultType: 'colorradio',
                    name: 'title_bg_color',
                    value: 'f2a654',
                    width: '100%',
                    fieldDefaults: {
                        name: 'title_bg_color',
                        width: 60,
                        height: 60,
                        margin: '0 5 5 5'
                    },
                    items: [{
                        name: 'title_bg_color',
                        inputValue: 'f96868'
                    }, {
                        name: 'title_bg_color',
                        inputValue: 'f2a654'
                    }, {
                        name: 'title_bg_color',
                        inputValue: '926dde'
                    }, {
                        name: 'title_bg_color',
                        inputValue: '57c7d4'
                    }, {
                        name: 'title_bg_color',
                        inputValue: '62a8ea'
                    }, {
                        name: 'title_bg_color',
                        inputValue: '46be8a'
                    }, {
                        name: 'title_bg_color',
                        inputValue: '526069'
                    }, {
                        hidden: true,
                        name: 'title_bg_color',
                        inputValue: false
                    }],
                    listeners: {
                        change: function() {
                            if (!this.getValue()['title_bg_color']) {
                                return;
                            }
                            if (this.getValue()['title_bg_color'] == '000000') {
                                return;
                            }
                            var style = this.up('form').getValues();
                            this.up('form').down('#editor_preview').updateStyle(style);
                            this.up('form').down('colorfield').setValue(this.getValue()['title_bg_color']);
                        }
                    }
                }]
            }, {
                name: 'title_bg_color',
                xtype: 'colorfield',
                fieldLabel: '自定义对话框颜色',
                labelAlign: 'top',
                editable: true,
                value: 'f96868',
                listeners: {
                    change: function() {
                        if (!this.value || (this.value.length != 3 && this.value.length != 6)) {
                            return;
                        }
                        var form = this.up('form').form;
                        if (form) {
                            var style = this.up('form').getValues();
                            this.up('form').down('#editor_preview').updateStyle(style);
                            this.up('form').setValues(style);
                        }
                    },
                    blur: function() {
                        this.fireEvent('change');
                    }
                }
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: '团队名称',
                labelAlign: 'top',
                name: 'name',
                items: [{
                    xtype: 'textfield',
                    name: 'name',
                    width: '100%',
                    listeners: {
                        change: function() {
                            var style = this.up('form').getValues();
                            this.up('form').down('#editor_preview').updateStyle(style);
                        }
                    }
                }]
            }, {
                xtype: 'hiddenfield',
                name: 'logo',
                listeners: {
                    change: function() {
                        var style = this.up('form').getValues();
                        this.up('form').down('#editor_preview').updateStyle(style);
                    }
                }
            }, {
                xtype: 'form',
                url: '/api/upload',
                items: [{
                    fieldLabel: '企业Logo',
                    buttonText: '点击上传',
                    buttonOnly: true,
                    labelAlign: 'top',
                    xtype: 'filefield',
                    name: 'file',
                    buttonConfig: {
                        scale: 'large'
                    },
                    width: 65,
                    listeners: {
                        change: function() {
                            var me = this;
                            this.up('form').getForm().submit({
                                success: function(form, action) {
                                    var data = Ext.decode(action.response.responseText);
                                    if (data.success) {
                                        var upForm = me.up('editor_dialog_style');
                                        var values = upForm.getValues();
                                        values['logo'] = data.data;
                                        upForm.setValues(values);
                                        upForm.down('#editor_preview').updateStyle(values);
                                    } else {
                                        Ext.Msg.alert('错误', data.msg);
                                    }
                                },
                                failure: function(form, action) {
                                    if (action && action.result && action.result.msg) {
                                        Ext.Msg.alert('失败', action.result.msg);
                                    } else {
                                        Ext.Msg.alert('错误', '服务器错误，请稍后再试。');
                                    }
                                }
                            })
                        }
                    }
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: '输入框占位文字',
                labelAlign: 'top',
                items: [{
                    xtype: 'textfield',
                    name: 'input_placeholder',
                    width: '100%',
                    value: '您好，有什么可以帮您?',
                    listeners: {
                        change: function() {
                            var style = this.up('form').getValues();
                            this.up('form').down('#editor_preview').updateStyle(style);
                        }
                    }
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: '距页面左/右边缘(px)',
                labelAlign: 'top',
                items: [{
                    xtype: 'numberfield',
                    name: 'page_distance',
                    value: 20,
                    minValue: 0,
                    labelWidth: 130,
                    width: '100%'
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: '距页脚边距(px)',
                labelAlign: 'top',
                items: [{
                    xtype: 'numberfield',
                    name: 'page_bottom_distance',
                    value: 0,
                    minValue: 0,
                    labelWidth: 500,
                    width: '100%'
                }]
            }, {
                xtype: 'radiogroup',
                fieldLabel: '位置',
                columns: 5,
                width: 600,
                vertical: true,
                name: 'direction',
                value: 'bottom-right',
                defaultType: 'radiofield',
                items: [{
                    boxLabel: '底部左边',
                    name: 'direction',
                    inputValue: 'bottom-left'
                }, {
                    boxLabel: '底部右边',
                    name: 'direction',
                    inputValue: 'bottom-right'
                }]
            }, {
                xtype: 'fieldcontainer',
                fieldLabel: '请选择入口样式',
                labelAlign: 'top',
                items: [{
                    xtype: 'radiogroup',
                    defaultType: 'htmlradio',
                    name: 'icon_shape',
                    allowBlank: true,
                    value: 'bar',
                    width: '100%',
                    fieldDefaults: {
                        name: 'icon_shape',
                        width: 85,
                        height: 168,
                        margin: '0 5 10 10'
                    },
                    items: [{
                        name: 'icon_shape',
                        xtype: 'radio',
                        inputValue: 'none',
                        hidden: true
                    }, {
                        name: 'icon_shape',
                        inputValue: 'bar',
                        backgroundColor: '#FAFAFA',
                        innerHtml: '<div style="margin:0 0 0 19px; background: #AAA; width:35px; height:123px;border-radius: 17px; padding-top: 17px;">' +
                            '<img style="width:22px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                            '<p style="padding: 0 11px;text-indent: 0;margin-top: 0;font-size: 13px;">在线客服</p>' +
                            '</div>'
                    }, {
                        name: 'icon_shape',
                        inputValue: 'square',
                        backgroundColor: '#FAFAFA',
                        innerHtml: '<div style="margin:0 0 0 9px;background: #AAA; width:58px; height:60px; padding-top: 10px;">' +
                            '<img style="width:22px;margin-left: 10px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                            '<p style="padding: 3px;text-indent: 2px;margin: 0; font-size: 12px;">在线客服</p>' +
                            '</div>'
                    }, {
                        name: 'icon_shape',
                        inputValue: 'circular',
                        backgroundColor: '#FAFAFA',
                        innerHtml: '<div style="margin:0 0 0 9px;background: #AAA; width:60px; height:60px; padding-top: 10px; border-radius: 30px;">' +
                            '<img style="width:22px;margin-left: 12px;" src="//' + location.hostname.replace('app.', 'im.') + '/build/v2/image/message.png" />' +
                            '<p style="margin-top: -2px;text-indent: 6px; font-size: 12px;">在线客服</p>' +
                            '</div>'
                    }, {
                        xtype: 'form',
                        url: '/api/upload',
                        items: [{
                            buttonText: '',
                            buttonOnly: true,
                            labelAlign: 'top',
                            xtype: 'filefield',
                            name: 'file',
                            height: 152,
                            width: 77,
                            style: {
                                cursor: 'pointer'
                            },
                            buttonConfig: {
                                text: '自定义',
                                scale: 'large',
                                height: 152,
                                width: 77,
                                style: {
                                    background: '#DDD',
                                    border: '0px'
                                }
                            },
                            listeners: {
                                change: function() {
                                    var me = this;
                                    this.up('form').getForm().submit({
                                        success: function(form, action) {
                                            var data = Ext.decode(action.response.responseText);
                                            if (data.success) {
                                                var upForm = me.up('editor_dialog_style');
                                                var values = upForm.getValues();
                                                values['customer_icon'] = data.data;
                                                values['icon_shape'] = 'none';
                                                upForm.setValues(values);
                                                upForm.down('#editor_preview').updateStyle(values);
                                            } else {
                                                Ext.Msg.alert('错误', data.msg);
                                            }
                                        },
                                        failure: function(form, action) {
                                            if (action && action.result && action.result.msg) {
                                                Ext.Msg.alert('失败', action.result.msg);
                                            } else {
                                                Ext.Msg.alert('错误', '服务器错误，请稍后再试。');
                                            }
                                        }
                                    })
                                }
                            }
                        }]
                    }],
                    listeners: {
                        change: function() {
                            var style = this.up('form').getValues();
                            style['customer_icon'] = '';
                            this.up('form').setValues(style);
                            this.up('form').down('#editor_preview').updateStyle(style);
                        }
                    }
                }]
            }, {
                xtype: 'hiddenfield',
                name: 'customer_icon',
                listeners: {
                    change: function() {
                        var style = this.up('form').getValues();
                        this.up('form').down('#editor_preview').updateStyle(style);
                    }
                }
            }, {
                xtype: 'radiogroup',
                fieldLabel: '使用表单',
                columns: 5,
                width: 600,
                vertical: true,
                name: 'type',
                value: 'IM',
                defaultType: 'radiofield',
                items: [{
                    boxLabel: '直接对话',
                    name: 'type',
                    inputValue: 'IM'
                }, {
                    boxLabel: '表单提交',
                    name: 'type',
                    inputValue: 'ORDER'
                }]
            },



                {
                xtype: 'button',
                ui: 'soft-green',
                text: '保存',
                scale: 'large',
                handler: function() {
                    var win = this.up('im_editor');
                    var values = this.up('form').getValues();
                    values['button_bg_color'] = values['title_bg_color'];
                    values['message_right_bg_color'] = values['title_bg_color'];
                    values['message_left_bg_color'] = 'fff';

                    values['title_txt_color'] = 'ffffff';
                    values['button_txt_color'] = 'ffffff';
                    values['chatWin_bg_color'] = 'fafafa';
                    values['message_right_font_color'] = 'ffffff';

                    values['message_left_font_color'] = '000000';

                    var pluginstore = Ext.data.StoreManager.lookup('pluginstore');

                    if(win.record){
                        win.record.set(values);
                        pluginstore.setModel(win.record);
                    }else{
                        pluginstore.add([values]);
                    }
                }
            }],
            flex: 4
        }, {
            flex: 1
        }, {
            itemId: 'editor_preview',
            xtype: 'editor_preview',
            flex: 6
        }]
    }],
    listeners: {
        afterrender: function() {
            var win = this.up('im_editor');
            if (win.record) {
                this.setValues(win.record.data);
            } else {
                this.setValues({});
            }
        }
    }
});
