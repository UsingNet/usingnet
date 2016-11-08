Ext.define('Admin.view.dashboard2.widgets.Lumps', {
    extend: 'Ext.panel.Panel',
    xtype: 'lumps',
    height: 130,
    bodyStyle: {
        'background': 'transparent',
        'border-radius': '2px'
    },
    style: {
        'border-radius': '2px'
    },
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'lump',
        itemId: 'weeklyorder',
        bodyStyle: {
            background: '#00c0ef'
        },
        data: {
            title: '本周工单',
            value: '暂无数据',
            imgSrc: '/resources/images/dashboardIcons/dashboard_order.png',
            progressColor: '#709FC9',
            progress: '0%',
            top: '暂无数据'
        }
    }, {
        xtype: 'lump',
        itemId: 'avgtime',
        margin: '0 0 0 20',
        bodyStyle: {
            background: '#00a65a'
        },
        data: {
            title: '平均用时',
            value: '暂无数据',
            imgSrc: '/resources/images/dashboardIcons/dashboard_time2.png',
            progressColor: '#BFCE6C',
            progress: '0%',
            top: '暂无数据'
        }
    }, {
        xtype: 'lump',
        itemId: 'task',
        margin: '0 0 0 20',
        bodyStyle: {
            background: '#f39c12'
        },
        data: {
            title: '回访任务',
            value: '暂无数据',
            imgSrc: '/resources/images/dashboardIcons/dashboard_task.png',
            progressColor: '#F39C12',
            progress: '0%',
            top: '暂无数据'
        }
    }, {
        xtype: 'lump',
        itemId: 'validrank',
        margin: '0 0 0 20',
        bodyStyle: {
            background: '#f56954'
        },
        data: {
            title: '有效回访率',
            value: '暂无数据',
            imgSrc: '/resources/images/dashboardIcons/dashboard_percent.png',
            progressColor: '#DD4B39',
            progress: '0%',
            top: '暂无数据'
        }
    }],
    formatTime: function(second) {
        var str = '';
        if (second >= 3600) {
            str += parseInt(second / 3600) + ':';
        }
        if (second >= 60) {
            str += parseInt((second % 3600) / 60) + '\':';
        }
        str += parseInt(second % 60) + '"';
        return str;
    },
    listeners: {
        beforerender: function() {
            var me = this;
            Admin.data.Dashboard.on('lumpready', function() {
                var data = this.get('lump');
                me.down('#weeklyorder').setData({
                    title: '本周工单',
                    icon: 'fa-bars',
                    value: data.self_order_count,
                    imgSrc: '/resources/images/dashboardIcons/dashboard_order.png',
                    progress: data.all_order_count ? (data.self_order_count / data.all_order_count * 100).toFixed(2) + '%' : '0%',
                    top: data.order_rank
                });
                var rate = data.avg_time ? (data.avg_time / data.avg_self_time * 100).toFixed(2) : 0;
                var avgSelfTime = me.formatTime(parseInt(data.avg_self_time));
                me.down('#avgtime').setData({
                    title: '平均用时',
                    icon: 'fa-clock-o',
                    value: avgSelfTime,
                    imgSrc: '/resources/images/dashboardIcons/dashboard_time2.png',
                    progress: rate > 100 ? 100 + '%' : rate + '%',
                    top: data.time_rank
                });
                me.down('#task').setData({
                    title: '回访任务',
                    icon: 'fa-tasks',
                    value: data.self_task,
                    imgSrc: '/resources/images/dashboardIcons/dashboard_task.png',
                    progress: data.all_task ? (data.self_task / data.all_task * 100).toFixed(2) + '%' : '0%',
                    top: data.task_rank
                });
                var taskRate = parseInt(data.valid_task) ? (parseInt(data.self_valid_task) / parseInt(data.valid_task) * 100).toFixed(2) + '%' : '0%';
                me.down('#validrank').setData({
                    title: '有效回访率',
                    icon: 'fa-area-chart',
                    value: data.self_valid_task,
                    imgSrc: '/resources/images/dashboardIcons/dashboard_percent.png',
                    progress: taskRate,
                    top: data.valid_rank
                });
            });
        }
    }
});
