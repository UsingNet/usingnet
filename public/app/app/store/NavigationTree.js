Ext.define('Admin.store.NavigationTree', {
    extend: 'Ext.data.TreeStore',
    storeId: 'NavigationTree',
    requires: [
        'Ext.view.settings.voiceService.VoiceService'
    ],
    fields: [{
        name: 'text'
    }],
    root: {
        expanded: true,
        children: (function() {
            var menu = [{
                text: '首页',
                iconCls: 'x-fa fa-desktop',
                // viewType: 'admindashboard',
                viewType: 'dashboard2',
                routeId: 'dashboard', // routeId defaults to viewType
                leaf: true
            }, {
                text: '沟通',
                iconCls: 'x-fa fa-leanpub',
                //expanded: true,
                expanded: false,
                selectable: false,
                children: [{
                    text: '客服',
                    iconCls: 'x-fa fa-comment',
                    viewType: 'customerservice',
                    leaf: true
                }, {
                    text: '历史对话',
                    iconCls: 'x-fa fa-comments',
                    viewType: 'historydialogue',
                    leaf: true
                }]
            }, {
                text: '计划',
                iconCls: 'x-fa fa-edit',
                viewType: 'task',
                leaf: true
            }, {
                text: '媒体',
                iconCls: 'x-fa fa-windows',
                selectable: false,
                expanded: false,
                children: [{
                    text: '邮件模板',
                    iconCls: 'x-fa fa-file-text-o',
                    viewType: 'media-article',
                    leaf: true
                }, {
                    text: '短信模板',
                    iconCls: 'x-fa fa-comments-o',
                    viewType: 'media-sms',
                    leaf: true
                }, {
                    text: '录音',
                    iconCls: 'x-fa fa-volume-up',
                    viewType: 'media-voice',
                    leaf: true
                }]
            }, {
                text: '统计',
                iconCls: 'x-fa fa-bar-chart',
                selectable: false,
                expanded: false,
                children: [{
                    text: '客服统计',
                    iconCls: 'x-fa fa-headphones',
                    viewType: 'customerServiceStatis',
                    leaf: true
                }, {
                    text: '评价统计',
                    iconCls: 'x-fa fa-thumbs-up',
                    viewType: 'evaluate',
                    leaf: true
                }, {
                    text: '访客统计',
                    iconCls: 'x-fa fa-user',
                    viewType: 'access',
                    leaf: true
                }, {
                    text: '工单统计',
                    iconCls: 'x-fa fa-bars',
                    viewType: 'orderstatistic',
                    leaf: true
                }]
            }, {
                text: '客户',
                iconCls: 'x-fa fa-share-alt',
                selectable: false,
                expanded: false,
                children: [{
                    text: '客户管理',
                    iconCls: 'x-fa fa-user',
                    viewType: 'contact',
                    leaf: true
                }, {
                    text: '客户标签',
                    iconCls: 'x-fa fa-tag',
                    viewType: 'tag',
                    leaf: true
                }]
            }, {
                text: '设置',
                iconCls: 'x-fa fa-cogs',
                expanded: false,
                selectable: false,
                children: [{
                    text: '团队设置',
                    iconCls: 'x-fa fa-users',
                    viewType: 'members',
                    leaf: true
                }, {
                    text: '工作时间',
                    iconCls: 'fa fa-clock-o',
                    viewType: 'workingtime',
                    leaf: true
                }, {
                    text: '常用语',
                    iconCls: 'x-fa fa-reply-all',
                    viewType: 'usefulexpressions',
                    leaf: true
                }, {
                    text: '自动回复',
                    iconCls: 'x-fa fa-reply',
                    viewType: 'autoreply',
                    leaf: true
                }, {
                    text: '客服插件',
                    iconCls: 'x-fa fa-cog',
                    viewType: 'team',
                    leaf: true
                }, {
                    text: '异常记录',
                    iconCls: 'x-fa fa-line-chart',
                    viewType: 'errorlog',
                    leaf: true
                }]
            }, {
                text: '接入',
                iconCls: 'x-fa fa-plug',
                expanded: false,
                selectable: false,
                children: [{
                    text: '网站接入',
                    iconCls: 'x-fa fa-comment',
                    viewType: 'plugin',
                    leaf: true
                }, {
                    text: '微信接入',
                    iconCls: 'x-fa fa-weixin',
                    viewType: 'weixin',
                    leaf: true
                }, {
                    text: '短信接入',
                    iconCls: 'x-fa fa-tablet',
                    viewType: 'smsaccess',
                    leaf: true
                }, {
                    text: '邮件接入',
                    iconCls: 'x-fa fa-envelope',
                    // viewType: 'setupmail',
                    viewType: 'emailaccess',
                    leaf: true
                }, {
                    text: '电话接入',
                    iconCls: 'x-fa fa-phone-square',
                    viewType: 'voiceService',
                    leaf: true
                }]
            }, {
                text: '账户',
                iconCls: 'x-fa fa-credit-card',
                name: 'account',
                expanded: false,
                selectable: false,
                children: [{
                    text: '团队认证',
                    iconCls: 'x-fa fa-envelope',
                    viewType: 'teamapprove',
                    leaf: true
                }, {
                    text: '套餐设置',
                    iconCls: 'x-fa fa-briefcase',
                    // viewType: 'combosetting',
                    viewType: 'usingnetcombo',
                    leaf: true
                }, {
                    text: '充值记录',
                    iconCls: 'x-fa fa-money',
                    viewType: 'recharge',
                    leaf: true
                }, {
                    text: '消费记录',
                    iconCls: 'x-fa fa-jpy',
                    viewType: 'consumption',
                    leaf: true
                }]
            }, {
                text: '知识库',
                iconCls: 'x-fa fa-book',
                viewType: 'knowledge',
                routeId: 'knowledge',
                leaf: true
            }];
            if (Admin.data.User.store) {
                if (Admin.data.User.get('role') == 'MEMBER') {
                    return menu.splice(0, 2);
                } else if ('MANAGE' === Admin.data.User.get('role')) {
                    menu.forEach(function(item, index) {
                        if ('account' === item.name) {
                            menu.splice(index, 1);
                        }
                    });
                    return menu;
                } else {
                    return menu;
                }
            } else {
                Admin.data.User.addListener('change', function() {
                    var store = Ext.data.StoreManager.lookup('NavigationTree');
                    store.setRootNode({
                        expanded: true,
                        children: menu
                    });
                    store.fireEvent('change');
                });
                return menu;
            }
        })()
    }
});
