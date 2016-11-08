Ext.define('Admin.view.main.MainContainerWrap', {
    extend: 'Ext.container.Container',
    xtype: 'maincontainerwrap',

    requires: [
        'Ext.layout.container.HBox'
    ],

    scrollable: 'y',

    layout: {
        type: 'hbox',
        align: 'stretchmax',

        // Tell the layout to animate the x/width of the child items.
        animate: true,
        animatePolicy: {
            x: true,
            width: true
        }
    },

    beforeLayout: function() {
        // We setup some minHeights dynamically to ensure we stretch to fill the height
        // of the viewport minus the top toolbar
        var me = this,
            height = Ext.Element.getViewportHeight() - 50,  // offset by topmost toolbar height
            // We use itemId/getComponent instead of "reference" because the initial
            // layout occurs too early for the reference to be resolved
            treeHeight = height - Admin.data.User.get('extend.collapsing') ? 91 : 151,
            navTree = Ext.getCmp('navigationTreeList');

        //me.minHeight = height;
        me.setHeight(height);
        me.items.each(function(item){
            item.setHeight(height);
        });

        //me.down('#contentPanel').setHeight(height);
        //navTree.setStyle({
        //    'min-height': treeHeight + 'px'
        //});

        me.callParent(arguments);
    }
});
