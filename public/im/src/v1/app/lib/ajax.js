/**
 * Created by henry on 15-12-10.
 */
define([], function() {
    var Ajax = {};
    var jsonpRootKey = '__using_root_key_' + ((new Date()).getTime()).toString() + (parseInt(Math.random() * 10000).toString());
    window[jsonpRootKey] = {};
    Ajax.get = function(url, params, cb) {
        Ajax.send(url, 'GET', params, cb);
    };

    Ajax.post = function(url, params, cb) {
        Ajax.send(url, 'POST', params, cb);
    };

    Ajax.send = function(url, method, params, cb) {
        var xhr = typeof(XMLHttpRequest) != 'undefined' ? (new XMLHttpRequest()) : (new ActiveXObject("Microsoft.XMLHTTP"));
        var body;
        if (params) {
            var bodies = [];
            for (var name in params) {
                bodies.push(name + '=' + encodeURIComponent(params[name]));
            }
            body = bodies.join('&');
        }

        if (method == "GET") {
            xhr.open(method, url + "?" + body, true);
            xhr.send();
        } else {
            xhr.open(method, url, true);
            if (body.length) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            xhr.send(body);
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var data = xhr.responseText;
                try {
                    data = JSON.parse(data);
                } catch (exc) {}
                if (cb) {
                    cb(data);
                }
            }
        };
    };

    Ajax.jsonp = function(url, params, callback) {
        var jsonpKey = 'using_json_key_' + ((new Date()).getTime()).toString() + (parseInt(Math.random() * 10000).toString());
        params['callback'] = jsonpRootKey+'.'+jsonpKey;
        if (params) {
            var bodies = [];
            for (var name in params) {
                bodies.push(name + '=' + encodeURIComponent(params[name]));
            }
            url = url + "?" + bodies.join('&');
        }

        var jsonpScript = document.createElement('script');
        jsonpScript.src = url;

        window[jsonpRootKey][jsonpKey] = function(obj) {
            try {
                if (callback && typeof(callback) == 'function') {
                    callback(obj);
                }
            } catch (e) {;}
            delete window[jsonpRootKey][jsonpKey];
            document.body.removeChild(jsonpScript);
        };
        document.body.appendChild(jsonpScript);
    };

    return Ajax;
});
