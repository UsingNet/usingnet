/**
 * Created by jhli on 15-12-21.
 */
Ext.define('Admin.view.settings.weixin.WeixinModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.weixin',

    stores: {
        weixin:{
            type:'weixin',
            autoLoad: true
        }
    },

    data: {}
});
