Ext.define('Admin.view.communication.customerService.chat.TrackWindow', {
    extend: 'Ext.window.Window',
    autoShow: true,
    modal: true,
    title: '用户轨迹',
    height: 600,
    width: '70%',
    layout: 'fit',
    listeners: {
        beforerender: function() {
            var params = {
                _id: this.config.user_id
            };
            this.down('grid').getViewModel().storeInfo.track.on('beforeload', function(store, operation, eOpts) {
                operation.setParams(params);
            });

            this.down('grid').getViewModel().storeInfo.track.load({
                params: params
            });
        }
    },
    items: [{
        xtype: 'grid',
        margin: '5 0 0 0',
        viewModel: 'trackwindowmodel',
        cls: 'shadow',
        emptyText: '<center>无用户轨迹</center>',
        bind: {
            store: '{track}'
        },
        columns: [{
            text: '访问时间',
            dataIndex: 'created_at',
            flex: 1,
            renderer: function(value, metaData, record) {
                return value.substr(5);
            }
        }, {
            text: '访问页面',
            sortable: false,
            flex: 2,
            renderer: function(value, metaData, record) {
                return '<a style="text-decoration: none; color: #000;" target="_blank" href="' + record.data.url + '">' + record.data.title + '</a>';
            }
        }, {
            text: '停留时间',
            sortable: false,
            flex: 1,
            renderer: function(value, metaData, record) {
                var
                    begin = record.data.created_at,
                    end = record.data.updated_at;
                var time = new Date(end) - new Date(begin);
                var second = time / 1000;
                var hourNum = parseInt(second / 3600);
                var hourStr = hourNum ? hourNum + '小时' : '';
                var minNum = parseInt(second % 3600 / 60);
                var minStr = minNum ? minNum + '分' : '';
                var secNum = parseInt(second % 3600 % 60);
                var secStr = secNum ? secNum + '秒' : '1秒';
                return hourStr + minStr + secStr;
            }
        }]
    }]
});
