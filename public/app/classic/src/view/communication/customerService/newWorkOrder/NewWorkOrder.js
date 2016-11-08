// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.newWorkOrder.NewWorkOrder', {
    extend: 'Ext.button.Split',
    xtype: 'newworkorder',
    controller: 'newworkordercontroller',
    requires: [
        'Ext.button.Button'
    ],
    hidden: true,
    menu: {
        xtype: 'menu',
        items: []
    },
    handler: function() {
        this.showMenu();
    },
    listeners: {
        hide: function() {
            Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({
                order: 0
            });
        },
        beforerender: function() {
            var me = this;
            me.on('setmenu', this.controller.setmenu);
            
            Admin.data.User.on('onlinetiming', function() {
                if ('1' != Ext.util.Cookies.get('online')) {
                    me.hide();
                }
            });
        },
        menushow: function() {
            this.menu.items.each(function(menuItem) {
                menuItem.setHandler(function() {
                    if ('#customerservice' !== location.hash) {
                        location.hash = '#customerservice';
                    }
                    Ext.Ajax.request({
                        url: '/api/order',
                        method: 'POST',
                        jsonData: Ext.JSON.encode({
                            //to: this.from,
                            //from: this.to,
                            //type: this.type
                            message_id: this.messageId
                        }),
                        success: function(response) {
                            var res = Ext.decode(response.responseText);
                            if (!res.success) {
                                Ext.Msg.alert('错误', res.msg);
                                return;
                            }
                            Ext.getCmp('chatWindow').up('customerservice').down('workorderpanel').getViewModel().storeInfo.workorderstore.load();
                            //var record = [res];
                            //Ext.getCmp('chatWindow').up('customerservice').down('workorderpanel').controller.workOrderStoreLoad(null, record);
                        }
                    });
                });
            });
        }
    }
});
