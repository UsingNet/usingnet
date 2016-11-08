Ext.define('Admin.view.dashboard2.widgets.VisitorSource', {
    extend: 'Ext.panel.Panel',
    xtype: 'visitorsource',
    title: '访客来源',
    flex: 1,
    items: [{
        xtype: 'grid',
        header: false,
        hideHeaders: true,
        viewConfig: {
            enableTextSelection: true
        },
        columns: [{
            dataIndex: 'source',
            flex: 3,
            renderer: function(value, meta, record) {
                if (value.match('http')) {
                    return '<a target="_blank" style="text-decoration: none; color: #000; cursou： pointer;" href="' + value + '">' + value + '</a>';
                } else {
                    return value;
                }

            }
        }, {
            dataIndex: 'count',
            flex: 1
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('visitorready', function () {
                var res = this.get('visitor');
                var source = [];
                for (var i in res.source) {
                    source.push({
                        source: i,
                        count: res.source[i]
                    });
                }
                me.down('grid').setStore(Ext.create('Ext.data.Store', {
                    data: source
                }));
            });
        }
    }
});
