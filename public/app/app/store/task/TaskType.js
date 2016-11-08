/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.store.task.TaskType', {
    extend: 'Ext.data.Store',
    alias: 'store.tasktype',
    storeId: 'taskTypeStore',
    fields: ['name', 'type'],
    data: [
        { 'name': '邮件', 'type': 'MAIL' },
        { 'name': '短信', 'type': 'SMS' },
        { 'name': '语音', 'type': 'VOIP_RECORD' },
        { 'name': '客服拨打', 'type': 'VOIP_STAFF' }
    ]
});
