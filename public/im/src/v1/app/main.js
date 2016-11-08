/**
 * Created by henry on 15-12-7.
 */
requirejs(['window', 'widget', 'app/config/app', 'lib/extend'], function(Window, Widget, appConfig) {
    if (location.host.match(new RegExp(appConfig['IM_HOST']))) {
        var linkTag = document.createElement('link');
        linkTag.type = 'text/css';
        linkTag.rel = 'stylesheet';
        if (requirejs.version) {
            linkTag.href = './src/v1/css/main.css';
        } else {
            linkTag.href = './build/v1/css/main.min.css';
        }
        document.getElementsByTagName('head')[0].appendChild(linkTag);
        Window();
    } else {
        window.usingnetInit = function(tid, uid) {
            if (typeof(uid) == 'undefined') {
                uid = null;
            }

            try {
                var Popup = Widget(tid, uid);
                window.usingnetCrm = {
                    'show': function() {
                        return Popup.show();
                    },
                    'hide': function() {
                        return Popup.hide();
                    },
                    'getUrl': function() {
                        return Popup.getUrl();
                    }
                };

            } catch (err) {
                var img = new Image();
                var params = {
                    message: err.description || err.message,
                    script: err.name,
                    line: err.stack || '',
                    column: '',
                    object: err
                };
                var arr = [];
                for (var name in params) {
                    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
                }
                img.src = '/api/log?' + arr.join('&') + Math.random() * 1000;
            }
        };
        if (typeof(usingnetJsonP) == 'function') {
            usingnetJsonP(window.usingnetInit);
        }
    }
});
