/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.view.settings.domain.Domain', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Admin.view.settings.domain.DomainModel',
		'Admin.view.settings.domain.DomainController',
        'Ext.window.Window',
        'Ext.grid.Panel'
    ],

    xtype: 'domain',

    margin: 20,
    cls: 'shadow',
    viewModel: {
        type: 'domain'
    },

    //layout: {
    //    //type: 'vbox',
    //    align: 'middle'
    //},

    //vertical: false,
    //align: 'middle',
    layout: 'vbox',

    controller: 'domain',

    items: [

        {
            xtype:'grid',
            title:'域名管理',
            flex: 1,
            margin: 20,
            cls: 'shadow',
            width: '100%',
            viewModel:{
                type:'team'
            },
            bind:{
                store:'{domains}'
            },
            columns:[
                { xtype: 'rownumberer'},
                { text: '域名', dataIndex: 'domain', editor:'textfield', flex:1},
                { text: 'SPF', dataIndex:'spf', flex:1},
                { text: 'DKIM', dataIndex:'dkim', flex:2},
                {
                    text: '操作',
                    align: 'center',
                    xtype: 'actioncolumn',
                    items: [
                        {
                            iconCls: 'x-fa fa-edit',
                            tooltip: '编辑',
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex);
                                this.ownerCt.up().plugins[0].startEdit(rec, 0);
                            }
                        },
                        {
                            iconCls: 'x-fa fa-times-circle',
                            tooltip: '删除',
                            handler: function(grid, rowIndex, colIndex) {
                                Ext.Msg.confirm('确定', '确定要删除这个域名吗?', function(btnId) {
                                    if ('yes' === btnId) {
                                        var store = grid.getStore();
                                        var rec = grid.getStore().getAt(rowIndex);
                                        store.remove(rec);
                                    }
                                });
                            }
                        }
                    ]
                }
            ],
            plugins: {
                ptype: 'rowediting',
                clicksToEdit: 2,
                listeners: {
                    cancelEdit: function(rowEditing, context) {
                        if (context.record.phantom) {
                            rowEditing.grid.store.remove(context.record);
                        }
                    }
                }
            },
            dockedItems: [
                {
                    xtype: 'pagingtoolbar',
                    bind: {
                        store: '{domains}'
                    },
                    dock: 'bottom',
                    displayInfo: true
                }
            ],
            tbar:[
                '->',
                {'text':'添加', width: 100, ui: 'soft-green', handler:function(){
                    var grid = this.ownerCt.up();
                    var model = Ext.create('Admin.model.communication.email.Domain');
                    grid.store.add(model);
                    grid.plugins[0].startEdit(model, 1);
                }}
            ],
            listeners:{
              cellclick:function(table,td, columnsIndex){
                if(td.innerText.length>30){
                    var dialog = Ext.create('Ext.window.Window',{
                            title:'详情',
                            padding:20,
                            autoDestroy:true,
                            closable : true,
                            modal: true,
                            items:[
                                {
                                    fieldLabel:table.grid.columns[columnsIndex].text,
                                    height: 200,
                                    width: 500,
                                    xtype:'textareafield',
                                    readOnly:true,
                                    value:td.innerText,
                                    grow      : true,
                                    anchor    : '100%'
                                }
                            ],
                            buttons: [
                                {
                                    xtype:'button',
                                    text: '关闭',
                                    handler:function(button){
                                        button.ownerCt.ownerCt.close()
                                    }
                                }
                            ]
                    });
                    dialog.show();
                }
              }
            }
            //minHeight:400
        }
    ]
});
