/**
 * Created by jhli on 16-01-29.
 */
Ext.define('Admin.view.settings.errorLog.ErrorLog', {
    extend: 'Ext.container.Container',
    xtype: 'errorlog',
    scrollable: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    viewModel: {
        type: 'errorlog'
    },
    cls: 'shadow',
    items: [{
        xtype: 'grid',
        title: '异常记录',
        emptyText: '<center>暂未有异常记录</center>',
        flex: 1,
        margin: 20,
        cls: 'shadow',
        width: '100%',
        modelValidation: true,
        viewConfig: {
            enableTextSelection: true
        },
        bind: {
            store: '{errorlog}'
        },
        columns: [{
            text: '日期',
            dataIndex: 'created_at',
            sortable: true,
            flex: 1
        }, {
            text: '异常',
            dataIndex: 'message',
            sortable: true,
            flex: 2,
            renderer: function(value) {
                return Ext.String.htmlEncode(value);
            }
        }, {
            text: '数据',
            dataIndex: 'data',
            sortable: true,
            flex: 1,
            renderer: function(value) {
                return Ext.String.htmlEncode(value);
            }
        }],
        dockedItems: [{
            xtype: 'pagingtoolbar',
            bind: {
                store: '{errorlog}'
            },
            dock: 'bottom',
            displayInfo: true
        }],
        listeners: {
            celldblclick: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                if (1 === cellIndex || 2 === cellIndex) {
                    Ext.create('Ext.window.Window', {
                        autoShow: true,
                        modal: true,
                        title: '数据',
                        width: '60%',
                        height: 600,
                        bodyPadding: 20,
                        layout: 'fit',
                        items: [{
                            xtype: 'panel',
                            scrollable: true,
                            padding: 5,
                            html: 1 === cellIndex ? Ext.String.htmlEncode(record.data.message) : Ext.String.htmlEncode(record.data.data)
                        }],
                        buttons: [{
                            text: '关闭',
                            handler: function() {
                                this.up('window').close();
                            }
                        }]
                    });
                }
            }
        }
    }]
});