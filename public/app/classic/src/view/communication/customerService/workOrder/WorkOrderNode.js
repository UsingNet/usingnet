Ext.define('Admin.view.communication.customerService.workOrder.WorkOrderNode', {
    extend: 'Ext.panel.Panel',
    xtype: 'workordernode',
    width: '100%',
    data: {
        display: 'none'
    },
    tpl: '<div class="workOrderNode" style="width: 100%;">' +
        '<span class="offline">已离线</span>' +
        // '<div class="closeOrderIcon" style="display: none;">' +
        // '<span class="x-fa fa-times"></span>' +
        // '</div>' +
        '<div style="width: 20%; height: 60px; display: flex; justify-content: center; align-items: center; float: left;">' +
        '<div style="position: relative;">' +
        '<div class="unreadRemind" style="display: {display}">{unreadMsgCount}</div>' +
        '<i class="x-fa fa-exclamation unreadRemind" style="background-color: #F98C00; border-color: #F98C00; display: {showNewOrderIcon}"></i>' +
        '<span title="计划工单" class="x-fa fa-thumb-tack" style="display: {isTask};"></span>' +
        '<img src="{imgSrc}' + '-avatar' + '" style="width: 36px; height: 36px; border-radius: 18px; border: 1px solid #3C8DBC; padding: 1px; display: block;">' +
        '</div>' +
        '</div>' +
        '<div style="float: right; width: 80%; margin: 11px 0; color: gray; height: 36px; position: relative;">' +
        '<div>' +
        '<span class="x-fa {iconCls}" style="float: left; color: #3C8DBC;"></span>' +
        '<span style="max-width: 48%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-left: 4px; line-height: 14px; height: 14px; display: block; float: left;" title="{contact}">{contact}</span>' +
        '<span style="float: right; line-height: 14px; height: 14px; display: block; margin-right: 10px;">{time}</span>' +
        '</div>' +
        '<span style="display: block; clear: both; position: absolute; bottom: 0; font-size: 14px; width: 62%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: {contentColor}">{content}</span>' +
        '</div>' +
        '<div class="tags" style="height: 20px; display: {showTags}">' +
        '<div style="position: absolute; top: -10px; white-space: nowrap;">' +
        '{tagshtml}' +
        '</div>' +
        '</div>' +
        '</div>',
    isSelected: function() {
        return !!this._isSelected;
    },
    select: function() {
        if (!this.isSelected()) {
            this.addCls('selected');
            this._isSelected = true;
        }
    },
    deSelect: function() {
        if (this.isSelected()) {
            this.removeCls('selected');
            this._isSelected = false;
        }
    },
    constructor: function() {
        var me = this;
        me.callParent(arguments);
        me.workOrderChatPanel = Ext.create({
            xtype: 'workorderchatpanel',
            workOrder: me.workOrder,
            workOrderComponent: me,
            data: {
                remote: me.workOrder.to
            },
            listeners: {
                unreadCountChange: function() {
                    var data = me.data;
                    if (!data) {
                        return;
                    }
                    data.unreadMsgCount = this.unreadCount > 99 ? '99' : this.unreadCount;
                    data.display = !!this.unreadCount ? 'block' : 'none';
                    me.setData(data);

                    var count = 0;
                    me.up().items.each(function(node) {
                        // if (!node._isSelected) {
                        count += node.workOrderChatPanel.unreadCount;
                        // }
                    });
                    Admin.view.communication.customerService.singleton.MessageRemind.fireRemindHnadler({ message: count });
                    var navigation = Ext.getCmp('navigationTreeList');
                    var treeStore = navigation.getStore();
                    var item = navigation.getItem(treeStore.data.getAt(1));
                    var dom = item.el.dom.querySelector('div.x-treelist-item-text');

                    var classname = 'x-treelist-item-text' + (count > 0 ? (' nav-tree-num nav-tree-num-' + (count > 99 ? '99' : count)) : '');
                    dom.className = classname;
                },
                lastReceiveMessageChange: function() {
                    var msg = this.lastReceiveMessage;
                    var data = me.data;
                    if (!data) {
                        return;
                    }
                    var message_container = document.createElement('div');
                    message_container.innerHTML = msg.body.replace(/\<img[^\>]+\>/g, '[图片]').replace(/\<audio[^\>]+\>/g, '[语音]').replace(/\<video[^\>]+\>/g, '[视频]');
                    data.content = message_container.innerText;
                    data.contentColor = '';
                    data.showNewOrderIcon = 'none';
                    data.time = Admin.data.Tools.CustomTools.formatTime(msg.created_at * 1000, 'HH:mm:ss');
                    me.setData(data);
                }
            }
        });
    },
    listeners: {
        remoteoffline: function() {
            if ('IM' == this.workOrder.type) {
                this.removeCls('remoteoffline');
                this.addCls('remoteoffline');
            }
        },
        remoteonline: function() {
            this.removeCls('remoteoffline');
        },
        removed: function(me, ownerCt, eOpts) {
            if (me.workOrderChatPanel.WebSocket) {
                me.workOrderChatPanel.WebSocket.close();
            }

            if (ownerCt.items.getAt(0)) {
                ownerCt.select(ownerCt.items.getAt(0));
            }
        },
        click: function() {
            this.up().select(this);
        },
        // closeIconClick: function() {

        // },
        afterrender: function() {
            var me = this;
            me.el.dom.onclick = function(e) {
                // if (e.target.className == 'closeOrderIcon' || e.target.parentElement.className == 'closeOrderIcon') {
                //     me.fireEvent('closeIconClick');
                // } else {
                me.fireEvent('click');
                // }
            };
        }
    }
});
