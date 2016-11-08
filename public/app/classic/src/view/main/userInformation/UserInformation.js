/**
 * Created by jhli on 16-01-25.
 */
Ext.define('Admin.view.main.userInformation.UserInformation', {
    extend: 'Ext.menu.Item',
    xtype: 'userInformation',
    iconCls: 'x-fa fa-user',
    text: '个人中心',
    handler: function(self, event) {
        Ext.create('Ext.window.Window', {
            title: '个人中心',
            animateTarget: 'personalInformation',
            autoShow: true,
            closable: true,
            modal: true,
            bodyPadding: 10,
            width: 600,
            height: 650,
            layout: 'fit',
            items: [{
                xtype: 'tabpanel',
                activeTab: 0,
                tabPosition: 'top',
                items: [{
                    xtype: 'userdata'
                }, {
                    xtype: 'usersetting'
                }]
            }]
        });
    }
});
