Ext.define('Admin.view.communication.customerService.workOrderTab.TimingOrderNode', {
    extend: 'Ext.panel.Panel',
    xtype: 'timingordernode',
    width: '100%',
    data: {},
    tpl: '<div class="workOrderNode">' +
        '<div class="closeOrderIcon" style="display: block !important; position: absolute; right: 8px; top: 29px; color: gray; cursor: pointer; z-index: 99;">' +
        '<span class="x-fa fa-times"></span>' +
        '</div>' +
        '<div style="width: 20%; height: 60px; display: flex; justify-content: center; align-items: center; float: left;">' +
        '<div style="position: relative;">' +
        '<span title="计划工单" class="x-fa fa-thumb-tack" style="display: {isTask};"></span>' +
        '<img src="{imgSrc}' + '-avatar' + '" style="width: 36px; height: 36px; border-radius: 18px; border: 1px solid #3C8DBC; padding: 1px; display: block;">' +
        '</div>' +
        '</div>' +
        '<div style="float: right; width: 80%; margin: 11px 0; color: gray; height: 36px; position: relative;">' +
        '<div>' +
        '<span class="x-fa {iconCls}" style="float: left; color: #3C8DBC;"></span>' +
        '<span style="max-width: 48%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-left: 4px; line-height: 14px; height: 14px; display: block; float: left;" title="{contact}">{contact}</span>' +
        '<i class="x-fa fa-comment" style="float: right; margin-right: 8px; cursor: pointer;"></i>' +
        '</div>' +
        '<span style="display: block; clear: both; position: absolute; bottom: 0; font-size: 14px; width: 62%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="{content}">{content}</span>' +
        '</div>' +
        '<div class="tags" style="height: 20px; display: {showTags}">' +
        '<div style="position: absolute; top: -10px; white-space: nowrap;">' +
        '{tagshtml}' +
        '</div>' +
        '</div>' +
        '</div>',
    listeners: {
        afterrender: function() {
            var me = this;
            me.el.dom.onclick = function(e) {
                if (e.target.className == 'closeOrderIcon' || e.target.parentElement.className == 'closeOrderIcon') {
                    Ext.Msg.show({
                        title: '确认',
                        message: '确定关闭延期工单？',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.WARNING,
                        fn: function(btn) {
                            if ('yes' === btn) {
                                Ext.Ajax.request({
                                    url: '/api/order/' + me.workOrder.id,
                                    method: 'DELETE',
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText)
                                        if (res.success) {
                                            me.up().remove(me);
                                        } else {
                                            Ext.Msg.alert('错误', res.msg);
                                        }
                                    },
                                    failure: function(response) {
                                        Ext.Msg.alert('错误', '服务器错误！');
                                    }
                                });
                            }
                        }
                    });
                } else if (e.target.className == 'x-fa fa-comment') {
                    if ('1' != Ext.util.Cookies.get('online')) {
                        Ext.Msg.alert('错误', '您目前处于离线状态，不能恢复延期工单！');
                        return;
                    }
                    Ext.Msg.show({
                        title: '确认',
                        message: '确定恢复延期工单？',
                        buttons: Ext.Msg.YESNO,
                        icon: Ext.Msg.WARNING,
                        fn: function(btn) {
                            if ('yes' === btn) {
                                Ext.Ajax.request({
                                    url: '/api/order/' + me.workOrder.id,
                                    method: 'PUT',
                                    jsonData: Ext.encode({
                                        status: 'OPEN'
                                    }),
                                    success: function(response) {
                                        var res = Ext.decode(response.responseText)
                                        if (res.success) {
                                            Ext.getCmp('treelist').getViewModel().storeInfo.workorderstore.load(function(records, operation, success) {
                                                var father = Ext.getCmp('treelist');
                                                father.select(father.items.getAt(0));
                                            });
                                            me.up('workordertab').setActiveTab(0);
                                            me.up().remove(me);
                                        } else {
                                            Ext.Msg.alert('错误', res.msg);
                                        }
                                    },
                                    failure: function(response) {
                                        Ext.Msg.alert('错误', '服务器错误！');
                                    }
                                });
                            }
                        }
                    });
                }
            };
        }
    }
});
