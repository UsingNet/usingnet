/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.view.knowledge.Knowledge', {
    extend: 'Ext.container.Container',
    xtype: 'knowledge',
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'knowledgetree',
        width: '25%'
    }, {
        xtype: 'issueslist',
        flex: 1
    }]
});
