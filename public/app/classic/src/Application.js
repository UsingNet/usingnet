Ext.define('Admin.Application', {
    extend: 'Ext.app.Application',

    name: 'Admin',

    stores: [
        'NavigationTree',
        'communication.service.Contacts'
    ],

    defaultToken: 'dashboard',

    // The name of the initial view to create. This class will gain a "viewport" plugin
    // if it does not extend Ext.Viewport.
    //
    mainView: 'Admin.view.main.Main',

    launch: function() {
        Ext.Ajax.on('requestcomplete', function(conn, response, options) {
            var res = Ext.JSON.decode(response.responseText);
            if (408 == res.code) {
                //Admin.data.User.get('email')
                Ext.create('Admin.store.communication.customerService.WebSocket').closeAll();
                if (!Admin.data.User.get('email')) {
                    location.replace(res.data.login);
                    // return;
                }
                Ext.getCmp('main-navigation-btn').up('mainViewport').controller.setCurrentView('logintimeoutpage');
                if (!Admin.data.User.store) {
                    Admin.data.User.store = {};
                }
                Admin.data.User.store.login = res.data.login;
                //var loginUrl = res.data.login;
                //var dom = Ext.getCmp('page401LoginUrl').el.dom;
                //var aTag = dom.getElementsByTagName('a')[0];
                //aTag.setAttribute('href', loginUrl);
            } else if (409 == res.code) {
                //Admin.data.User.get('email')
                Ext.create('Admin.store.communication.customerService.WebSocket').closeAll();
                if (!Admin.data.User.get('email')) {
                    location.replace(res.data.login);
                    // return;
                }
                Ext.getCmp('main-navigation-btn').up('mainViewport').controller.setCurrentView('loginotherplacepage');
                if (!Admin.data.User.store) {
                    Admin.data.User.store = {};
                }
                Admin.data.User.store.login = res.data.login;
                //var loginUrl = res.data.login;
                //var dom = Ext.getCmp('page401LoginUrl').el.dom;
                //var aTag = dom.getElementsByTagName('a')[0];
                //aTag.setAttribute('href', loginUrl);
            } else if (401 === res.code) {
                Ext.Msg.show({
                    title: '错误',
                    closable: false,
                    message: '没有权限访问此页面，请点击刷新按钮刷新页面！',
                    buttonText: {
                        ok: '刷新'
                    },
                    icon: Ext.Msg.WARNING,
                    fn: function(btn) {
                        if ('ok' === btn) {
                            location.hash = '#dashboard';
                            location.reload();
                        }
                    }
                });
            }
        });
        var errorStore = {};

        // 前端onerror报log
        window.onerror = function(errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
            var baseUrl = '/api/log';
            var params = {
                message: errorMessage,
                script: scriptURI,
                line: lineNumber,
                column: columnNumber
            };
            var key = JSON.stringify(params);
            if (!errorStore[key]) {
                errorStore[key] = 1;
            } else {
                errorStore[key]++;
            }
            if (errorStore[key].toString().match(/^10*$/)) {
                params['object'] = errorObj.stack;
                params['count'] = errorStore[key];
                var arr = [];
                for (var name in params) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
                }
                //var url = baseUrl + arr.join('&') + Math.random() * 1000;
                //var img = new Image();
                //img.src = url;
                Ext.Ajax.request({ url: baseUrl, method: 'POST', params: params, disableCaching: true });
            }
            //return true;
        }
    },

    onAppUpdate: function() {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function(choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
