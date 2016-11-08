/**
 * Created by henry on 15-10-30.
 */
Ext.define('Admin.store.Tags', {
    extend: 'Admin.store.Base',
    alias: 'store.tags',
    model: 'Admin.model.Tag',
    storeId: 'tagStore',
    proxy: {
        type: 'rest',
        url: '/api/tag',
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json'
        }
    }
});