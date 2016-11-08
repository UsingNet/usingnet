Ext.define('Admin.view.main.Main', {
    extend: 'Ext.container.Viewport',
    xtype: 'mainViewport',
    requires: [
        'Ext.button.Segmented',
        'Ext.list.Tree',
        'Admin.view.main.MainModel'
    ],
    controller: 'main',
    viewModel: 'main',
    cls: 'sencha-dash-viewport',
    itemId: 'mainView',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    listeners: {
        render: 'onMainViewRender',
        beforerender: 'beforerender',
        afterrender: 'afterrender',
        afterlayout: 'afterlayout'
    },
    items: [{
        xtype: 'toolbar',
        cls: 'sencha-dash-dash-headerbar shadow',
        height: 50,
        itemId: 'headerBar',

        items: [{
                xtype: 'component',
                reference: 'senchaLogo',
                cls: 'sencha-logo',
                html: '<div class="main-logo"><img style="height: 30px;" src="resources/images/company-logo3.png">优信CRM</div>',
                width: 200
            }, {
                margin: '0 0 0 8',
                ui: 'header',
                iconCls: 'x-fa fa-navicon',
                id: 'main-navigation-btn',
                handler: 'onToggleNavigationSize'
            },
            '->', {
                text: '去新版',
                ui: 'soft-green',
                handler: function() {
                    location.replace('//' + location.host.replace('app', 'home'));
                }
            }, {
                xtype: 'newworkorder',
                iconCls: 'x-fa fa-tags',
                id: 'tagsReminding',
                ui: 'soft-green'
            }, {
                xtype: 'newworkorder',
                iconCls: 'x-fa fa-commenting',
                id: 'messageReminding',
                ui: 'soft-orange'
            }, {
                xtype: 'button',
                id: 'answerPhoneBtn',
                width: 32,
                height: 32,
                iconCls: 'x-fa fa-phone',
                ui: 'soft-green',
                hidden: true,
                style: {
                    borderRadius: '50%'
                },
                handler: function() {
                    Cloopen.accept();
                }
            }, {
                xtype: 'tbtext',
                id: 'balance',
                style: {
                    color: '#fff'
                },
                cls: 'top-user-name',
                hidden: 'MASTER' !== Admin.data.User.get('role'),
                listeners: {
                    beforerender: function() {
                        var self = this;
                        Admin.data.Team.addListener('sync', function() {
                            self.fireEvent('afterrender');
                        });
                    },
                    afterrender: function() {
                        var balance = Admin.data.Team.get('balance');
                        if (balance) {
                            this.setText('余额：' + balance + '元');
                        }
                    }
                }
            }, {
                userCls: 'circular-icon',
                ui: 'navigation-tools',
                iconCls: 'x-fa fa-jpy',
                tooltip: '充值',
                hidden: 'MASTER' !== Admin.data.User.get('role'),
                handler: function() {
                    Ext.create('Admin.view.main.recharge.Recharge');
                }
            }, {
                xtype: 'agentphone',
                ui: 'navigation-tools'
            }, {
                xtype: 'taskListBtn',
                ui: 'navigation-tools'
            }, {
                xtype: 'button',
                tooltip: '系统通知',
                ui: 'navigation-tools',
                text: '',
                userCls: 'circular-icon',
                iconCls: 'x-fa fa-bell',
                id: 'systemNotice',
                hidden: false,
                handler: 'readNotice'
            }, {
                xtype: 'splitimage',
                id: 'userImg',
                alt: '用户头像',
                imageHeight: 32,
                imageWidth: 32,
                imageBorderRadius: 16,
                border: 'none',
                padding: 0,
                arrowVisible: false,
                isFocusable: false,
                src: "",
                handler: function() {
                    this.showMenu();
                },
                style: {
                    borderRadius: '16px',
                    background: '#FFF',
                    boxShadow: 'none'
                },
                menuAlign: 'tr-br?',
                menu: new Ext.menu.Menu({
                    items: [{
                        xtype: 'userInformation',
                        id: 'personalInformation'
                    }, {
                        xtype: 'menuitem',
                        id: 'logoutBtn',
                        iconCls: 'x-fa fa-sign-out',
                        text: '退出',
                        handler: function() {
                            location.replace(Admin.data.User.get('logout'));
                        }
                    }]
                }),
                listeners: {
                    afterrender: function() {
                        var me = this;
                        Admin.data.User.addListener('change', function() {
                            me.fireEvent('beforerender');
                        });
                    },
                    beforerender: function() {
                        var img = Admin.data.User.get('img');
                        if (img) {
                            this.setSrc(img + '-avatar');
                        }
                    }
                }
            }
        ]
    }, {
        xtype: 'maincontainerwrap',
        id: 'main-view-detail-wrap',
        reference: 'mainContainerWrap',
        flex: 1,
        items: [{
            xtype: 'panel',
            reference: 'mainSilder',
            id: 'mainSilder',
            itemId: 'mainSilder',
            bodyStyle: {
                background: '#222d32'
            },
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            style: {
                borderRadius: 0
            },
            //scrollable: true,
            setMicro: function(flag) {
                this.getComponent('menuTitle').setHidden(flag);
                // this.getComponent('menuSearch').setHidden(flag);
                this.down('menuprofile').setMicro(flag);
            },
            items: [{
                xtype: 'menuprofile',
                height: 45,
                margin: 10
            }, {
                xtype: 'panel',
                itemId: 'menuTitle',
                userCls: 'transparentBg',
                padding: '0 0 0 20',
                height: 35,
                width: 200,
                style: { background: '#1a2226' },
                bodyStyle: { color: '#4b646f', lineHeight: '35px' },
                html: '主菜单'
            }, {
                xtype: 'mainmenu',
                scrollable: true,
                userCls: 'scrollable-treelist',
                reference: 'navigationTreeList',
                id: 'navigationTreeList',
                itemId: 'navigationTreeList',
                flex: 1
            }, {
                xtype: 'panel',
                html: '<div id="qwer" style="height:30px;position:fixed;bottom:13px;left:20px;">' +
                    '<a title="需要帮助" href="javascript:window.open(usingnetCrm.getUrl());" style="color:#eee; font-size:26px;">' +
                    '<span class="fa fa-question-circle"></span></a>' +
                    '</div>',
                float: true
            }]
        }, {
            xtype: 'container',
            flex: 1,
            style: {
                backgroundColor: '#ECF0F5'
            },
            reference: 'mainCardPanel',
            cls: 'sencha-dash-right-main-container',
            itemId: 'contentPanel',
            layout: {
                type: 'card',
                anchor: '100%'
            }
        }]
    }]
});
