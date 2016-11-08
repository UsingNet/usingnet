/**
 * Created by jhli on 16-3-3.
 */
Ext.define('Admin.view.wiki.WikiContent', {
    extend: 'Ext.panel.Panel',
    xtype: 'wikicontent',
    scrollable: true,
    cls: 'shadow',
    title: '问答详情',
    data: {
        title: '',
        message: ''
    },
    tpl: '<div class="wikiContent-container">' +
        '<span class="title">{title}</span>' +
        '<p class="message">{message}</p>' +
    '</div>',
    listeners: {
        afterrender: function() {
            var me = this;
            var wikieditor = me.next('wikieditor');
            wikieditor.on('show', function() {
                me.hide();
            });
            wikieditor.on('hide', function() {
                me.show();
            });
        }
    }
});