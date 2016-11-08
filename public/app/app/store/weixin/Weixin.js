/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.weixin.Weixin', {
    extend: 'Admin.store.Base',
    storeId: 'storeWeixin',
    alias: 'store.weixin',

    proxy: {
        type: 'rest',
        url: '/api/setting/wechat',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    sorters: [{
        property: 'id',
        direction: 'DESC'
    }]

});
