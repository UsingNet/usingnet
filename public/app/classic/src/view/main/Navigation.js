/**
 * Created by henry on 16-1-27.
 */
Ext.define('Admin.view.main.Navigation', {
    extend:'Ext.list.Tree',
    xtype:'mainmenu',
    store: 'NavigationTree',
    ui: 'navigation',
    width: 200,
    expanderFirst: false,
    expanderOnly: false,
    singleExpand: true,

    listeners: {
        selectionchange: function(tree, node) {
            tree.el.dom.style.overflowY = 'auto';
            var to = node && (node.get('routeId') || node.get('viewType'));
            if (to) {
                this.up('mainViewport').controller.redirectTo(to);
            }
        }
    }
    /*viewModel: 'main',
    item:[
        {
            xtype:'treelist',
            reference: 'navigationTreeList',
            id: 'navigationTreeList',
            itemId: 'navigationTreeList',
            ui: 'navigation',
            store: 'NavigationTree',
            width: 200,
            expanderFirst: false,
            expanderOnly: false,
            singleExpand: true,

        }
    ]*/
});