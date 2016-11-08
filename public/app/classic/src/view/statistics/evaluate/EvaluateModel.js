/**
 * Created by jhli on 16-02-15.
 */
Ext.define('Admin.view.statistics.evaluate.EvaluateModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.evaluate',

    stores: {
        evaluate: {
            type: 'evaluate'
        }
    },

    data: {}
});
