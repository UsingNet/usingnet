Ext.define('Admin.view.dashboard2.widgets.TagStatistics', {
    extend: 'Ext.panel.Panel',
    xtype: 'tagstatistics',
    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.series.Bar'
    ],
    layout: 'fit',
    title: '访客标签',
    items: [{
        xtype: 'cartesian',
        //background: {
        //    type: 'linear',
        //    degrees: 45,
        //    stops: [{
        //        offset: 0,
        //        color: '#72DBDB'
        //    }, {
        //        offset: 1,
        //        color: '#72DBDB'
        //    }]
        //},
        colors: ['#8FC6DE'],
        insetPadding: '20 20 20 5',
        // flipXY: true,
        axes: [{
            type: 'numeric',
            position: 'left',
            fields: 'count',
            grid: true,
            majorTickSteps: 1

        }, {
            type: 'category',
            position: 'bottom',
            grid: true
        }],
        series: [{
            type: 'bar',
            xField: 'name',
            yField: 'count',
            //style: {
            //    opacity: 0.80,
            //    minGapWidth: 10
            //},
            highlightCfg: {
                strokeStyle: 'black',
                fillStyle: 'gold'
                    //radius: 10
            },
            label: {
                field: 'count',
                display: 'insideEnd',
                // display: 'outside',
                orientation: 'horizontal'
            }
        }]
    }],
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('visitorready', function() {
                var data = this.get('visitor');
                var tagData = [];
                for (var k in data.group) {
                    tagData.push({
                        name: k,
                        count: data.group[k]
                    });
                }
                me.down('cartesian').setStore(Ext.create('Ext.data.Store', {
                    data: tagData
                }));
            });

        }
    }
});
//#72DBDB
