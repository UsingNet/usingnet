Ext.define('Admin.view.dashboard2.widgets.LoadOfService', {
    extend: 'Ext.panel.Panel',
    xtype: 'loadofservice',
    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.series.Bar'
    ],
    flex: 1,
    title: '实时客服负荷',
    layout: 'fit',
    items: [{
        xtype: 'cartesian',
        insetPadding: '20 20 20 20',
        axes: [{
            type: 'numeric',
            position: 'left',
            fields: 'order',
            grid: true,
            minimum: 0,
            majorTickSteps: 1
        }, {
            type: 'category',
            position: 'bottom',
            fields: 'name'
        }],
        series: {
            type: 'bar',
            xField: 'name',
            yField: 'order',
            style: {
                minGapWidth: 20
            },
            highlight: {
                strokeStyle: 'black',
                fillStyle: 'gold'
            },
            label: {
                field: 'order',
                display: 'outside',
                orientation: 'horizontal'
            }
        }
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('agentready', function() {
                var agent = this.get('agent.agents');
                var data = [];
                var maximum = 0;
                for (var name in agent) {
                    if (agent.hasOwnProperty(name)) {
                        data.push({
                            name: name,
                            order: agent[name]
                        });
                        if (agent[name] > maximum) {
                            maximum = agent[name];
                        }
                    }
                }
                var store = Ext.create('Ext.data.Store', {
                    fields: ['name', 'order'],
                    data: data
                });
                var cartesian = me.down('cartesian');
                cartesian.axes[0].setMaximum(maximum ? maximum + 5 : 10);
                var count = store.getCount();
                var colors = [];
                var genColor = function(i) {
                    var n = i + 1;
                    var base = Math.floor(Math.log2(n)) + 1;
                    var point = ((n - Math.pow(2, base - 1)) * 2 + 1) / (Math.pow(2, base));
                    return 'rgba(30,141,188,' + point + ')';
                };
                for (var i = 0; i < count; i++) {
                    colors.push(genColor(i));
                }
                //count;
                //cartesian.setColors(colors);
                cartesian.setStore(store);
                var series = cartesian.getSeries();
                series[0].setColors(colors);
                //s.setColors(['rgba(30,141,188,'+ point + ')']);
            });
        }
    }
});
