/**
 * Created by jhli on 15-11-19.
 */
Ext.define('Admin.store.dashboard.UserTaskList', {
	extend: 'Admin.store.Base',
	storeId: 'storeUserTaskList',
	alias: 'store.usertasklist',
	autoLoad: false,
    model: 'Admin.model.dashboard.UserTaskList',
	proxy: {
		pageParam: undefined,
		startParam: undefined,
		limitParam: undefined,
		type: 'rest',
		url: '/api/tasklist',
        appendId: true,
		reader: {
			type: 'json',
			rootProperty: 'data'
		},
		writer: {
			type: 'json'
		}
	},

	sorters: [{
		property: 'id',
		direction: 'DESC'
	}]

});
