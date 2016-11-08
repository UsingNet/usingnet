/**
 * Created by jiahonglee on 2016/4/1.
 */
Ext.define('Admin.view.communication.customerService.editor.widgets.ImgZoomWin', {
    extend: 'Ext.window.Window',
    xtype: 'imgzoomwin',
    modal: true,
    autoShow: true,
    items: [{
        xtype: 'panel',
        data: {
            src: ''
        },
        tpl: '<img src="{src}" style="zoom: 1.5;"></img>'
    }],
    listeners: {
        afterrender: function() {
            var me = this;
            me.down('panel').setHeight(me.metadata.height * 1.5 + 'px');
            me.down('panel').setWidth(me.metadata.width * 1.5 + 'px');
            me.down('panel').setData({
                src: me.metadata.src
            });
        }
    }
});