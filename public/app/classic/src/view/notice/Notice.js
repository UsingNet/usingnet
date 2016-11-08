/**
 * Created by henry on 15-12-21.
 */
Ext.define('Admin.view.notice.Notice', {
    extend: 'Ext.container.Container',
    xtype: 'noticepage',
    requires: [
        'Ext.container.Container'
    ],
    anchor: '100% -1',
    layout: {
        type: 'vbox',
        pack: 'center',
        align: 'center'
    },
    viewModel: {
        type: 'notice'
    },
    items: [{
        xtype: 'grid',
        title: '通知',
        emptyText: '<center>暂无通知</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{notices}'
        },
        columns: [{
            text: '时间',
            dataIndex: 'created_at',
            renderer: function(value) {
                return Ext.util.Format.date(new Date(parseInt(value) * 1000));
            }
        }, {
            text: '内容',
            dataIndex: 'body',
            flex: 1,
            renderer: function(value) {
                return Ext.String.htmlEncode(value);
            }
        }, {
            text: '状态',
            dataIndex: 'package',
            renderer: function(value) {
                return (value && value.read) ? "已读" : "未读";
            }
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{notices}'
            },
            dock: 'bottom',
            displayInfo: true
        }],
        listeners: {
            rowclick: function(self, record, tr, rowIndex, e, eOpts) {
                // Ext.Msg.show({
                //     title: "系统通知",
                //     message: record.data.body,
                //     buttons: Ext.Msg.YES,
                //     fn: function(btn) {
                //         record.set('package.read', true);
                //         record.store.sync();
                //     }
                // });
                Ext.create('Ext.window.Window', {
                    autoShow: true,
                    width: '80%',
                    height: '60%',
                    title: '通知内容',
                    modal: true,
                    scrollable: true,
                    bodyPadding: 20,
                    html: record.data.body,
                    bbar: ['->', {
                        text: '关闭',
                        ui: 'soft-blue',
                        handler: function() {
                            this.up('window').close();
                        }
                    }]
                });
                record.set('package.read', true);
                record.store.sync();
            }
        }
    }]
});
