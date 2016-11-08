Ext.define('Admin.view.communication.customerService.workOrderTab.TimingOrdersPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'timingorderspanel',

    title: '延期的对话',
    layout: 'fit',
    height: '100%',
    width: '100%',
    scrollable: true,
    layout: 'vbox',
    listeners: {
        afterrender: function() {
            var me = this;
            me.removeAll(true);
            Ext.Ajax.request({
                url: '/api/order/timing',
                success: function(response) {
                    var res = Ext.decode(response.responseText);
                    var iconMap = {
                        IM: 'fa-television',
                        WECHAT: 'fa-weixin',
                        SMS: 'fa-mobile',
                        MAIL: 'fa-envelope',
                        VOICE: 'fa-phone'
                    };
                    var tagshtml = '';

                    if (res.success) {
                        Ext.Array.forEach(res.data, function(item, index, arr) {
                            Ext.each(item.contact.tags, function(tag, index) {
                                if (index < 2) {
                                    tagshtml += '<span style="background-color: #' + tag.color + ';">' + tag.name + '</span>';
                                } else if (2 === index) {
                                    tagshtml += '...'
                                }
                            });
                            me.insert(0, {
                                xtype: 'timingordernode',
                                workOrder: item,
                                data: {
                                    imgSrc: item.contact.img,
                                    iconCls: iconMap[item.type],
                                    contact: item.contact.remark ? item.contact.remark + '（' + item.contact.name + '）' : item.contact.name,
                                    isTask: !!parseInt(item.task_id) ? 'block' : 'none',
                                    time: '',
                                    content: item.remark ? item.remark : '没有备注',
                                    display: 'none',
                                    showTags: !!tagshtml ? 'block' : 'none',
                                    tagshtml: tagshtml
                                }
                            });
                        });
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
