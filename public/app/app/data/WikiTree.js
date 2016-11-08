/**
 * Created by jhli on 16-3-21.
 */
Ext.define('Admin.data.WikiTree', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    constructor: function () {
        var self = this;
        self.callParent(arguments);
        self.loadTreeData();
        self.on('updatetreedata', self.loadTreeData);
    },
    loadTreeData: function(treeNodeId) {
        var self = this;
        Ext.Ajax.request({
            url: '/api/knowledge',
            success: function (response) {
                var res = Ext.decode(response.responseText);
                if (!res.success) {
                    return;
                }
                var data = res.data;
                var map = {};
                var nodes = [];
                for (var i = 0; i < data.length; i++) {
                    map[data[i]._id] = {
                        iconCls: 'x-fa fa-question-circle',
                        metadata: data[i],
                        text: data[i].title,
                        leaf: !data[i].next_notes.length,
                        children: !!data[i].next_notes.length ? [] : null,
                        next_notes: data[i].next_notes
                    };

                    if (!data[i].parent_note_id) {
                        nodes.push(map[data[i]._id]);
                    }
                }
                for (var j = 0; j < nodes.length; j++) {
                    if (nodes[j].next_notes.length) {
                        splitChildren(nodes[j], nodes[j].next_notes);
                    }
                }
                function splitChildren(node, children) {
                    for (var k = 0; k < children.length; k++) {
                        node.children.push(map[children[k]]);

                        if (map[children[k]].next_notes.length) {
                            splitChildren(map[children[k]], map[children[k]].next_notes);
                        }
                    }
                }
                self.store.nodes = nodes;
                self.store.map = map;
                self.fireEvent('nodesloaded', treeNodeId);
            }
        });
    },

    get: function(key) {
        var self = this;
        return self.store[key];
    }
});