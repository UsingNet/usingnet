/**
 * Created by jhli on 15-11-12.
 */
Ext.define('Admin.view.task.TaskModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.task',

    stores: {
        /*
        A declaration of Ext.data.Store configurations that are first processed as binds to produce an effective
        store configuration. For example:

        users: {
            model: 'Task',
            autoLoad: true
        }
        */
        task: {
            type: 'task',
            autoLoad: true
        },
        taskType: {
            type: 'tasktype'
        },
        contacts: {
            type: 'contacts'
        },
        emailcontacts: {
            type: 'contacts',
            remoteFilter: true,
            filters: [{
                property: 'email',
                value: '',
                operator: 'neq'
            }]
        },
        phonecontacts: {
            type: 'contacts',
            remoteFilter: true,
            filters: [{
                property: 'phone',
                value: '',
                operator: 'neq'
            }]
        },
        members: {
            type: 'members'
        },
        article: {
            type: 'mediaArticle'
        },
        sms: {
            type: 'mediaSms',
            filters: [{
                property: 'status',
                value: 'SUCCESS'
            }]
        },
        voice: {
            type: 'mediaVoice'
        }
    },

    data: {
        /* This object holds the arbitrary data that populates the ViewModel and is then available for binding. */
    }
});
