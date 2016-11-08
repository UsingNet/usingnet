Ext.define('Admin.view.dashboard2.widgets.Region', {
    extend: 'Ext.panel.Panel',
    xtype: 'regionstatistics',
    flex: 1,
    //title: '访客统计',
    //layout: {
    //    type: 'hbox',
    //    align: 'stretch'
    //},
    layout: 'fit',

    constructor:function(){
        this.callParent(arguments);
        this.toolBar = document.createElement('div');
        this.toolBar.className = 'china_map_tools_bar';
        document.body.appendChild(this.toolBar);
    },

    items: [
        //{
        //    xtype: 'tagstatistics',
        //    flex: 1,
        //    minWidth: 170,
        //    hidden: true
        //},
        {
            xtype: 'panel',
            itemId: 'map',
            //width: 420,
            tpl: '<div id="dashboard_china_map" style="width: 100%; height: 100%; position: relative; background: -webkit-gradient(linear,left bottom,left top,color-stop(0,#3c8dbc),color-stop(1,#67a8ce))!important;">' +
                '<span style="color: #fff; font-size: 15px; line-height: 16px; position: absolute; top: 12px; left: 0; padding: 10px;">访客统计</span>',
            data: {},
            locationData: null,
            setLocationData: function (data) {
                this.locationData = data;
            },
            realTimeUpdate: function () {
                var toolBar = this.up('regionstatistics').toolBar;
                this.fireEvent('renderMap');
                //var tools_bar = document.querySelector('#china_map_tools_bar');
                var map = document.querySelector('#dashboard_china_map');
                map.addEventListener('mouseover', function(e){
                    toolBar.style.left = e.pageX+'px';
                    toolBar.style.top = e.pageY+'px';
                });
                var svg = Admin.data.D3.d3.select('#dashboard_china_map svg');
                var paths = svg.selectAll('path')[0];

                var maxValue = 1,
                    locationData = this.locationData;
                for (var j in locationData) {
                    if (locationData[j] > maxValue) {
                        maxValue = locationData[j];
                    }
                }

                var fields = Ext.Object.getKeys(locationData);

                for (var i = 0; i < paths.length; i++) {
                    var path = Admin.data.D3.d3.select(paths[i]);
                    var name = path.data()[0].properties.name;
                    if (fields.indexOf(name) > -1) {
                        var pecentValue = locationData[name] / maxValue;
                        path.attr('fill', 'rgba(' + [255, 255, 255, 0.2 + (1 - pecentValue) * 0.6].join(',') + ')');

                        (function (name, count) {
                            path.on('mouseover', function (data) {
                                    Admin.data.D3.d3.select(this).attr('oldColor', Admin.data.D3.d3.select(this).attr('fill'));
                                    Admin.data.D3.d3.select(this).attr('fill', Admin.data.D3.d3.select(this).attr('fill').replace(new RegExp('(\\d+\\,)+([\\.\\d]+)\\)$', 'g'), function (match, a, b) {
                                        return '0,0,0,' + (b * 0.2) + ')';
                                    }));
                                    toolBar.innerHTML = name+'&nbsp;'+count+'人';
                                    toolBar.style.display = 'block';
                                })
                                .on('mouseout', function () {
                                    Admin.data.D3.d3.select(this).attr('fill', Admin.data.D3.d3.select(this).attr('oldColor'));
                                    Admin.data.D3.d3.select("#tooltip1").remove();
                                    Admin.data.D3.d3.select("#tooltip2").remove();
                                    Admin.data.D3.d3.select("#tooltip3").remove();
                                    toolBar.style.display = 'none';
                                })
                        })(name, locationData[name])
                    }
                }
            },
            listeners: {
                beforerender: function () {
                    var me = this;
                    Admin.data.Dashboard.on('visitorready', function () {
                        var data = this.get('visitor');
                        me.setLocationData(data.location);
                        me.realTimeUpdate();
                    });
                },
                renderMap: function () {
                    var container = document.getElementById('dashboard_china_map');
                    var width = 650,
                        height = 500;
                    //if (container.children.length) {
                    //    return;
                    //}
                    var svg = Admin.data.D3.d3.select("#dashboard_china_map")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .style('zoom', 0.85)
                        .style('margin', '0 auto')
                        .style('display', 'block')
                        .style('margin-top', '-12px')
                        .style('background', '-webkit-gradient(linear,left bottom,left top,color-stop(0,#3c8dbc),color-stop(1,#67a8ce))!important');

                    //创建投影(projection)
                    var projection = Admin.data.D3.d3.geo.mercator().translate([width / 2, height / 2]).center([105, 38]).scale(550);

                    //创建path
                    var path = Admin.data.D3.d3.geo.path().projection(projection);

                    //解析json
                    var json = Ext.create('Admin.view.dashboard2.widgets.RegionJson').getRegionJson();
                    svg.selectAll("path")
                        .data(json.features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .on('mouseover', function () {
                            Admin.data.D3.d3.select(this).attr('oldColor', Admin.data.D3.d3.select(this).attr('fill'));
                            Admin.data.D3.d3.select(this).attr('fill', Admin.data.D3.d3.select(this).attr('fill').replace(new RegExp('[\\.\\d]+\\)$', 'g'), 0.6));
                        })
                        .on('mouseout', function () {
                            Admin.data.D3.d3.select(this).attr('fill', Admin.data.D3.d3.select(this).attr('oldColor'));
                            //Remove the tooltip
                            Admin.data.D3.d3.select("#tooltip1").remove();
                            Admin.data.D3.d3.select("#tooltip2").remove();
                        })
                        .attr('fill', 'rgba(228,228,228,1)')
                        .attr('stroke', 'rgba(40,70,90,0.3)')
                        .attr('stroke-width', 1);
                }
            }
        }]
});
