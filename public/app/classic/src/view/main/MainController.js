Ext.define('Admin.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',
    requires: [
        'Admin.data.User'
    ],
    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onRouteChange'
            }
        }
    },
    routes: {
        ':node': 'onRouteChange'
    },
    lastView: null,
    setCurrentView: function(hashTag) {
        hashTag = (hashTag || '').toLowerCase();
        var hashTable = {
            noticepage: 'noticepage',
            logintimeoutpage: 'logintimeoutpage',
            loginotherplacepage: 'loginotherplacepage'
        };
        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel,
            mainLayout = mainCard.getLayout(),
            navigationList = refs.navigationTreeList,
            store = navigationList.getStore(),
            node = store.findNode('routeId', hashTag) ||
            store.findNode('viewType', hashTag),
            view = (node && node.get('viewType')) || hashTable[hashTag] || 'page404',
            lastView = me.lastView,
            existingItem = mainCard.child('component[routeId=' + hashTag + ']'),
            newView;
        // Kill any previously routed window
        if (lastView && lastView.isWindow) {
            lastView.destroy();
        }
        lastView = mainLayout.getActiveItem();
        if (!existingItem) {
            newView = Ext.create({
                xtype: view,
                routeId: hashTag, // for existingItem search later
                hideMode: 'offsets'
            });
        }
        if (!newView || !newView.isWindow) {
            // !newView means we have an existing view, but if the newView isWindow
            // we don't add it to the card layout.
            if (existingItem) {
                // We don't have a newView, so activate the existing view.
                if (existingItem !== lastView) {
                    mainLayout.setActiveItem(existingItem);
                }
                newView = existingItem;
            } else {
                // newView is set (did not exist already), so add it and make it the
                // activeItem.
                Ext.suspendLayouts();
                mainLayout.setActiveItem(mainCard.add(newView));
                Ext.resumeLayouts(true);
            }
        }
        navigationList.setSelection(node);
        if (node && node.parentNode) {
            node.parentNode.expand()
        }
        if (newView.isFocusable(true)) {
            newView.focus();
        }
        me.lastView = newView;
    },
    onToggleNavigationSize: function(button, e, autoCollapsing) {
        var me = this,
            refs = me.getReferences(),
            navigationList = refs.navigationTreeList,
            mainSilder = refs.mainSilder,
            wrapContainer = refs.mainContainerWrap,
            // collapsing = !navigationList.getMicro(),
            // collapsing = !Admin.data.User.get('extend.collapsing');
            collapsing = Admin.data.User.get('extend.collapsing'),
            collapsing = autoCollapsing ? collapsing : !collapsing,
            new_width = collapsing ? 64 : 200;
        if (Ext.isIE9m || !Ext.os.is.Desktop) {
            Ext.suspendLayouts();
            refs.senchaLogo.setWidth(new_width);
            navigationList.setWidth(new_width);
            // navigationList.setMicro(collapsing);
            Admin.data.User.set('collapsing', Boolean(collapsing));
            Ext.resumeLayouts(); // do not flush the layout here...
            // No animation for IE9 or lower...
            wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
            wrapContainer.updateLayout(); // ... since this will flush them
        } else {
            if (!autoCollapsing) {
                Admin.data.User.set('collapsing', !!collapsing);
            }

            if (!collapsing) {
                mainSilder.setMicro(false);
                navigationList.setMicro(false);
            }
            // Start this layout first since it does not require a layout
            refs.senchaLogo.animate({
                dynamic: true,
                to: {
                    width: new_width
                }
            });
            mainSilder.animate({
                dynamic: false,
                to: {
                    width: new_width
                }
            });
            // Directly adjust the width config and then run the main wrap container layout
            // as the root layout (it and its chidren). This will cause the adjusted size to
            // be flushed to the element and animate to that new size.
            mainSilder.setWidth(new_width);
            navigationList.setWidth(new_width);

            navigationList.el.addCls('nav-tree-animating');
            //mainSilder.el.addCls('nav-tree-animating');
            // We need to switch to micro mode on the navlist *after* the animation (this
            // allows the "sweep" to leave the item text in place until it is no longer
            // visible.

            if (collapsing) {
                //navigationList.on({
                //    afterlayoutanimation: function() {
                //        navigationList.setMicro(true);
                //        mainSilder.setMicro(true);
                //        mainSilder.el.removeCls('nav-tree-animating');
                //        navigationList.el.removeCls('nav-tree-animating');
                //    },
                //    single: true
                //});
                navigationList.setMicro(true);
                mainSilder.setMicro(true);
                navigationList.el.removeCls('nav-tree-animating');
            }
        }
    },
    onMainViewRender: function() {
        if (!window.location.hash) {
            this.redirectTo("dashboard");
            // this.redirectTo("customerservice");
        }
    },
    onRouteChange: function(id) {
        var me = this;
        var store = Ext.data.StoreManager.lookup('NavigationTree');
        if (store.data.length) {
            me.setCurrentView(id);
        } else {
            store.addListener('change', function() {
                me.setCurrentView(id);
            });
        }
    },
    onSearchRouteChange: function() {
        this.setCurrentView('searchresults');
    },
    onSwitchToModern: function() {
        Ext.Msg.confirm('Switch to Modern', 'Are you sure you want to switch toolkits?',
            this.onSwitchToModernConfirmed, this);
    },
    onSwitchToModernConfirmed: function(choice) {
        if (choice === 'yes') {
            var s = location.search;
            // Strip "?classic" or "&classic" with optionally more "&foo" tokens
            // following and ensure we don't start with "?".
            s = s.replace(/(^\?|&)classic($|&)/, '').replace(/^\?/, '');
            // Add "?modern&" before the remaining tokens and strip & if there are
            // none.
            location.search = ('?modern&' + s).replace(/&$/, '');
        }
    },
    onEmailRouteChange: function() {
        this.setCurrentView('email');
    },


    //以下是新增加的代码
    //判定用户登陆状态,若未登录即跳转到登陆页面
    beforerender: function() {
        //绑定load事件去通知图标的store 实时更新通知数
        var noticeStore = this.view.viewModel.storeInfo.notices;
        noticeStore.addListener('load', function(a, b, c) {
            var node = Ext.getCmp('systemNotice');
            var length = noticeStore.getUnreadNotices().length;
            if (length) {
                node.setText(length);
            } else {
                node.setText('');
            }
        });
        return true;
    },
    afterlayout: function() {
        // 初始化判断是否折叠左侧导航并执行
        Ext.getCmp('main-navigation-btn').up('mainViewport').controller.onToggleNavigationSize(null, null, true);
    },

    //获取消息推送的token 监控新工单的生成
    afterrender: function() {
        (function() {
            var a = document.createElement("script");
            a.setAttribute("charset", "UTF-8");
            a.src = "//" + location.host.replace('app.', 'im.') + "/build/app.min.js";
            document.body.appendChild(a);
            window.usingnetJsonP = function(usingnetInit) {
                usingnetInit("943b3255785a550a13e007f63a6e58b8", {
                    email: Admin.data.User.store.email,
                    extend_id: Admin.data.User.store.id,
                    name: Admin.data.User.store.name,
                    img: Admin.data.User.store.img
                });
            };
        })();
    },

    readNotice: function(self) {
        location.href = '#noticepage';
    },

    init: function() {


        var me = this,
            refs = me.getReferences(),
            mainCard = refs.mainCardPanel;
        mainCard.add(Ext.create({
            xtype: 'customerservice',
            routeId: 'customerservice',
            hideMode: 'offsets'
        }));

        var windowToken = (new Date()).getTime() + Math.random();
        var tokenKey = '_ustoken';
        Ext.util.Cookies.set(tokenKey, windowToken);
        setInterval(function() {
            if (Ext.util.Cookies.get(tokenKey) != windowToken) {
                Ext.create('Admin.store.communication.customerService.WebSocket').closeAll();
                Ext.Msg.addListener('beforeclose', function() {
                    return false;
                });
                XMLHttpRequest.isCloseTheRequest = true;
                Ext.Msg.show({
                    title: '警告',
                    message: '同时打开多个优信后台窗口可能会导致不必要的错误, 请关闭本窗口.',
                    buttons: [],
                    icon: Ext.Msg.WARNING,
                    closable: false
                });
            }
        }, 1000);
    }
});
