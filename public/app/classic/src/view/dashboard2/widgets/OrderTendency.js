Ext.define('Admin.view.dashboard2.widgets.OrderTendency', {
    extend: 'Ext.panel.Panel',
    xtype: 'ordertendency',
    requires: [
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Area',
        'Ext.chart.interactions.ItemHighlight',
        'Ext.chart.series.Line'
    ],
    height: 400,
    layout: 'fit',
    title: '工单趋势',
    items: [{
        xtype: 'cartesian',
        reference: 'chart',
        width: '100%',
        height: 600,
        insetPadding: '20 20 20 20',
        legend: {
            docked: 'right'
        },
        axes: [
            Ext.create('Admin.view.dashboard2.Numeric', {
                //type: 'numeric',
                position: 'left',
                grid: true,
                minimum: 0,
                majorTickSteps: 10
            }), {
                type: 'category',
                position: 'bottom',
                label: {
                    rotate: {
                        degrees: -45
                    }
                }
            }
        ]
    }],
    listeners: {
        beforerender: function() {
            var me = this,
                chart = me.down('cartesian');
            var fileds = {};
            Admin.data.Dashboard.on('ordertrendready', function() {
                var data = this.get('ordertrend');
                if (data.length) {
                    var length = Ext.Object.getSize(data[0].result);
                    var colors = [];
                }
                var genColor = function(i) {
                    var n = i + 1;
                    var base = Math.floor(Math.log2(n)) + 1;
                    var point = ((n - Math.pow(2, base - 1)) * 2 + 1) / (Math.pow(2, base));
                    return 'rgba(30,141,188,' + point + ')';
                };

                for (var i in data) {
                    for (var j in data[i].result) {
                        data[i]['result.' + j] = data[i].result[j];
                        fileds['result.' + j] = j;
                    }
                }
                var serises = [];
                var n = 0;
                for (var k in fileds) {
                    n++;
                    serises.push({
                        type: 'line',
                        fill: true,
                        smooth: true,
                        // color: colors[0],
                        colors: [genColor(n)],
                        title: fileds[k],
                        xField: 'date',
                        yField: k,
                        style: {
                            opacity: 0.60
                        },
                        marker: {
                            opacity: 0,
                            scaling: 0.01,
                            fx: {
                                duration: 200,
                                easing: 'easeOut'
                            }
                        },
                        highlightCfg: {
                            opacity: 1,
                            scaling: 1.5
                        },
                        tooltip: {
                            trackMouse: true,
                            renderer: function(tooltip, record, item) {
                                tooltip.setHtml(fileds[k] + ' (' + record.get('date') + '): ' + record.get(k));
                            }
                        }
                    })
                }
                chart.setSeries(serises);
                chart.setStore(Ext.create('Ext.data.Store', {
                    data: data
                }));

                chart.redraw();
            });
        }
    }
});
