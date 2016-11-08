/**
 * Created by henry on 16-3-3.
 */
Ext.define('Admin.view.access.plugin.editor.Editor', {
    extend: 'Ext.panel.Panel',
    xtype: 'im_editor',
    width: '100%',
    style: {
        background: 'none'
    },
    bodyStyle: {
        background: 'none'
    },
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        { xtype: 'editor_code' },
        { xtype: 'editor_dialog_style' }
    ]
});
