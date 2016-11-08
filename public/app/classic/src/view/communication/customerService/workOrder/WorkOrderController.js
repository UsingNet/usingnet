// add by jhli on 15-12-24
Ext.define('Admin.view.communication.customerService.workOrder.WorkOrderController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.workordercontroller',

    // workOrderStore的load事件,根据records组装treeListStore的节点
    workOrderStoreLoad: function(store, records, successful, operation, eOpts) {
        if (!successful) {
            return;
        }

        var workOrderPanel = Ext.getCmp('chatWindow').up('customerservice').down('workorderpanel');
        var iconMap = {
            IM: 'fa-television',
            WECHAT: 'fa-weixin',
            SMS: 'fa-mobile',
            MAIL: 'fa-envelope',
            VOICE: 'fa-phone'
        };

        // 设置是否初始化的标记
        if (store.loadCount > 1) {
            workOrderPanel.afterInit = true;
        } else {
            workOrderPanel.afterInit = false;
        }

        // if (workOrderPanel.items.length) {
        //     workOrderPanel.afterInit = true;
        // }else{
        //     workOrderPanel.afterInit = false;
        // }

        var len = records.length;
        while (len--) {
            var id = records[len].id;
            var items = workOrderPanel.items.items;
            for (var j = 0; j < items.length; j++) {
                if (items[j].workOrder.id === id) {
                    records[len].exist = true;
                    break;
                }
            }

            if (!records[len].exist) {
                if (records[len].data.contact) {
                    var tagshtml = '';
                    Ext.each(records[len].data.contact.tags, function(tag, index) {
                        if (index < 2) {
                            tagshtml += '<span style="background-color: #' + tag.color + ';">' + tag.name + '</span>';
                        } else if (2 === index) {
                            tagshtml += '...'
                        }

                    });
                    workOrderPanel.insert(0, {
                        xtype: 'workordernode',
                        record: records[len],
                        workOrder: records[len].data,
                        data: {
                            imgSrc: records[len].data.contact.img,
                            iconCls: iconMap[records[len].data.type],
                            contact: records[len].data.contact.remark ? records[len].data.contact.remark + '（' + records[len].data.contact.name + '）' : records[len].data.contact.name,
                            isTask: !!parseInt(records[len].data.task_id) ? 'block' : 'none',
                            time: workOrderPanel.afterInit ? records[len].data.updated_at.substr(11) : '',
                            content: workOrderPanel.afterInit ? '【新工单】' : '',
                            contentColor: workOrderPanel.afterInit ? '#F98C00' : '',
                            showNewOrderIcon: workOrderPanel.afterInit ? 'block' : 'none',
                            display: 'none',
                            showTags: !!tagshtml ? 'block' : 'none',
                            tagshtml: tagshtml
                        }
                    });
                }
            }
        }
    },

    beforedeselect: function(self, record, index) {
        Ext.getCmp('sendTypeCombo').setValue('');
    },
    // treepanel的select和deselect事件
    deselect: function(record, index, eOpts) {
        var record = this;
        record.isSelected = false;
        if (record.workOrderChatPanel) {
            Ext.getCmp('chatWindow').remove(record.workOrderChatPanel, false);
            record.workOrderChatPanel.isChatting = false;
        }

        var sendTypeToolbar = Ext.getCmp('sendTypeToolbar');
        sendTypeToolbar.hide();
        sendTypeToolbar.up().hide();

        Ext.data.StoreManager.lookup('storeTrack').removeAll();
        Ext.getCmp('userInfo').store.removeAll();
        Ext.getCmp('userInfoHtml').setHtml('');


    },
    select: function(record, index, eOpts) {
        //隐藏无数据提示
        var record = this;


        record.isSelected = true;
        if (record.workOrderChatPanel) {
            Ext.getCmp('chatWindow').add(record.workOrderChatPanel);
            record.workOrderChatPanel.isChatting = true;
        }

        var workOrderData = record.workOrder;

        var sendTypeToolbar = Ext.getCmp('sendTypeToolbar');
        sendTypeToolbar.show();
        sendTypeToolbar.up().show();

        // 绑定工单数据到编辑器
        Ext.getCmp('sendTypeCombo').workOrderData = workOrderData;
        // if (workOrderData.to) {

        // }
    }
});
