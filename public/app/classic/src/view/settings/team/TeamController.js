/**
 * Created by henry on 15-10-29.
 */
Ext.define('Admin.view.settings.team.TeamController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.team',

    /**
     * Called when the view is created
     */
    init: function() {
        // Ext.Ajax.request({
        //     url: '/api/message/agent?type=sms',
        //     success: function(response) {
        //         var res = Ext.JSON.decode(response.responseText);
        //         if (200 === res.code) {
        //             var token = res.data;
        //             var qr = Admin.view.settings.team.Qrcode.init()(5, 'M');
        //             qr.addData('{"url":"ws://ws.' + location.host.replace('app.', '') + '/ws?","token":"' + token +'"}');
        //             qr.make();
        //             Ext.getCmp('qrcode').setSrc(qr.createImgTag().match(/src="(.*?)"/)[1]);
        //         }
        //     }
        // });
    },

    beforerender: function(self, eOpts) {
        //Ext.Ajax.request({
        //    url: '/api/team',
        //    async: false,
        //    success: function(response) {
        //        var res = Ext.decode(response.responseText);
        //        // callback
        //        Ext.getCmp('callbackAddress').setValue(res.data.callback);
        //    }
        //});
    }

});
