/**
 * Created by jhli on 16-2-24.
 */
Ext.define('Admin.view.communication.historyDialogue.widgets.HistoryChatWin', {
    extend: 'Ext.panel.Panel',
    xtype: 'historychatwin',
    scrollable: 'vertical',
    dockedItems: [{
        xtype: 'pagingtoolbar',
        dock: 'bottom',
        displayInfo: true,
        listeners: {
            change: function(me, pageData, eOpts) {
                var container = me.up('historychatwin');
                container.removeAll();
                var records = me.store.data.items;
                records.forEach(function(record) {
                    Admin.view.communication.historyDialogue.HistoryMessageFactory.emit(record.data, container);
                });
            }
        }
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            var order_id = me.up('window').config.customData.order_id;

            var store = Ext.create('Admin.store.communication.historyDialogue.HistoryChatRecord', {
                proxy: {
                    url: '/api/message?order_id=' + order_id
                }
            });
            me.down('pagingtoolbar').setStore(store);
        },
        add: function (me, component, index, eOpts) {
            var data = null;
            if (!index) {
                data = component.data;
                data.displayTime = 'block';
                component.setData(data);
                return;
            }

            var prev = me.items.getAt(index - 1);
            if (component.createdAt - prev.createdAt > 120) {
                data = component.data;
                data.displayTime = 'block';
                component.setData(data);
            }
            //var next = me.items.getAt(index + 1);
            //var prev = me.items.getAt(index - 1);
            //if ((prev && !prev.createdAt) || (next && !prev) || (!next && !prev)) {
            //    component.setData(component.data.displayTime = 'block');
            //}
            //if (next) {
            //    if (next.createdAt - component.createdAt > 120) {
            //        next.data.displayTime = 'block';
            //        next.setData(next.data);
            //    } else {
            //        next.data.displayTime = 'none';
            //        next.setData(next.data);
            //    }
            //} else if (prev && prev.createdAt) {
            //    if (component.createdAt - prev.createdAt > 120) {
            //        component.setData(component.data.displayTime = 'block');
            //    }
            //}
        }
    }
});