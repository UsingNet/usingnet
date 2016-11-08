// add by jhli on 16-01-21
Ext.define('Admin.view.communication.customerService.newWorkOrder.NewWorkOrderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.newworkordercontroller',

    setmenu: function() {
        var menuLength = this.getMenu().items.items.length;
        if (menuLength) {
            this.show();
            this.enable();
            this.setText(menuLength);
        } else {
            this.hide();
        }
    }
});
