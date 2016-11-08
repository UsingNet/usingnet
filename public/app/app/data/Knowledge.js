/**
 * Created by jhli on 16-5-10.
 */
Ext.define('Admin.data.Knowledge', {
    extend: 'Ext.data.AbstractStore',
    singleton: true,
    store: {},
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me._getClassifyData();

        me.on('refreshClassifyData', function(recordIndex) {
            me._getClassifyData(recordIndex);
        });
        me.on('refreshIssuesData', function() {
            me._getIssuesByClassifyId(me.lastRequestIssuesId);
        });
        me.on('getIssuesByClassifyId', function(classifyId) {
            me._getIssuesByClassifyId(classifyId);
        });
        me.on('writeClassifyData', function(data, writeType, recordId, record) {
            me._writeClassifyData(data, writeType, recordId, record);
        });
        me.on('writeIssuesData', function(data, writeType, recordId) {
            me._writeIssuesData(data, writeType, recordId);
        });
    },

    get: function(key) {
        if (key) {
            return this.store[key];
        }
    },

    _showError: function(msg) {
        Ext.Msg.alert('错误', msg ? msg : '服务器错误！');
    },

    _getClassifyData: function(recordIndex) {
        var me = this;
        Ext.Ajax.request({
            url: '/api/knowledge/category',
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (res.success) {
                    me.store.classify = res.data;
                    me.fireEvent('classifyDataLoaded', recordIndex);
                } else {
                    me._showError(res.msg);
                }
            },
            failure: me._showError
        });
    },

    lastRequestIssuesId: null,
    _getIssuesByClassifyId: function(id) {
        var me = this;
        if (id) {
            me.lastRequestIssuesId = id;
            (function(id) {
                Ext.Ajax.request({
                    url: '/api/knowledge?category_id=' + id,
                    success: function(response) {
                        var res = Ext.decode(response.responseText);
                        if (res.success) {
                            if (id === me.lastRequestIssuesId) {
                                me.store.issues = res.data;
                                me.fireEvent('issuesDataLoaded');

                            }
                        } else {
                            me._showError(res.msg);
                        }
                    },
                    failure: me._showError
                });
            })(id);
        }
    },

    _writeClassifyData: function(data, writeType, recordId, record) {
        var me = this;
        Ext.Ajax.request({
            url: '/api/knowledge/category' + (recordId ? '/' + recordId : ''),
            method: writeType,
            jsonData: data ? Ext.encode(data) : '',
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (res.success) {
                    Admin.view.widgets.BubbleMessage.alert(data ? '保存成功！' : '删除成功！');
                    me.fireEvent('refreshClassifyData', record ? record.data.index.toString() : '');
                } else {
                    me._showError(res.msg);
                }
            },
            failure: me._showError
        });
    },

    _writeIssuesData: function(data, writeType, recordId) {
        var me = this;
        if (data && typeof data === 'object') {
            data.category_id = me.lastRequestIssuesId;
            data.keywords = data.keywords.split('，');
        }
        Ext.Ajax.request({
            url: '/api/knowledge' + (recordId ? '/' + recordId : ''),
            method: writeType,
            jsonData: data ? Ext.encode(data) : '',
            success: function(response) {
                var res = Ext.decode(response.responseText);
                if (res.success) {
                    Admin.view.widgets.BubbleMessage.alert(data ? '保存成功！' : '删除成功！');
                    me.fireEvent('refreshIssuesData');
                } else {
                    me._showError(res.msg);
                }
            },
            failure: me._showError
        });
    }
});
