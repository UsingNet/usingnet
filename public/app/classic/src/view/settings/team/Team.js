/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.view.settings.team.Team', {
    extend: 'Ext.container.Container',
    xtype:'team',
    scrollable: true,

    requires: [
        'Admin.view.settings.team.TeamModel',
        'Ext.Component'
    ],

    //title:'基本设置',

    controller: 'team',
    layout: {
        type: 'vbox'
        //align: ''
    },

    // margin: 20,
    cls: 'shadow',

    listeners:{
        beforerender:'beforerender'
    },

    items:[
        //{
        //    xtype:'teaminfo',
        //    userCls: 'big-50 small-100'
        //},
        {
            xtype:'contactapi'
        }
    ]
});
