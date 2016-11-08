/**
 * Created by jhli on 15-12-22.
 */
Ext.define('Admin.view.main.taskList.TaskListModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.tasklistmodel',

    stores: {
        tasklist: {
            type: 'tasklist',
            autoLoad: true
        }
    },

    data: {}
});
