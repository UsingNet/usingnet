/**
 * Created by jhli on 16-3-2.
 */
Ext.define('Admin.view.wiki.Wiki', {
    extend: 'Ext.container.Container',
    xtype: 'wiki',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'wikitree',
        margin: '20 10 20 20',
        width: '40%'
    }, {
        xtype: 'wikicontent',
        margin: '20 20 20 0',
        flex: 1
    }, {
        xtype: 'wikieditor',
        margin: '20 20 20 0',
        flex: 1,
        hidden: true
    }]
});