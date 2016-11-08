/**
 * Created by jhli on 16-02-15.
 */
Ext.define('Admin.store.access.Plugin', {
    extend: 'Admin.store.Base',
    alias: 'store.plugin',
    storeId: 'pluginstore',
    proxy: {
        type: 'rest',
        url: '/api/setting/web',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },
    remoteFilter: true,
    remoteSort: true
});
