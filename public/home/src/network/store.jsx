import config from './store_config';
import reqwest from 'reqwest';
import apiConfig from 'config';
import { Message } from 'antd';

let store = {};

var restProxyConstructor = (storeConfig) => {
    let $ = {};
    let lastResponseData = null;
    let lastCondition = {};
    let loading = false;

    if (!storeConfig['id_attribute']) {
        storeConfig['id_attribute'] = 'id';
    }

    let eventDelegate = document.createDocumentFragment();

    $.addEventListener = (eventName, callback) => {
        eventDelegate.addEventListener(eventName, callback);
    };

    $.removeEventListener = (eventName, callback) => {
        eventDelegate.removeEventListener(eventName, callback);
    };

    /**
     * Subscribe
     * @param id [not require]
     * @param callback
     * @param auto_init default true
     */
    $.subscribe = (id = null, callback, auto_init = true) => {
        if (typeof(id) == 'function') {
            auto_init = typeof(callback) == 'boolean' ? callback : true;
            callback = id;
            id = null;
        }

        if (id) {
            eventDelegate.addEventListener('change:' + id, callback);
            if (auto_init) {
                $.get(id, (event) => {
                    var e = new CustomEvent('change:' + id);
                    e.data = event.data;
                    eventDelegate.dispatchEvent(e);
                });
            }
        } else {
            eventDelegate.addEventListener('change', callback);

            if (auto_init) {
                if (lastResponseData) {
                    var e = new CustomEvent('change');
                    e.data = lastResponseData;
                    eventDelegate.dispatchEvent(e);
                } else {
                    if(!loading){
                        $.reload();
                    }
                }
            }
        }
    };

    $.unsubscribe = (id = null, callback) => {
        if (typeof(id) == 'function') {
            callback = id;
            id = null;
        }
        if (id) {
            eventDelegate.removeEventListener('change:' + id, callback);
        } else {
            eventDelegate.removeEventListener('change', callback);
        }
    };

    $.get = (id, callback, condition={}) => {
        reqwest({
            url: apiConfig.api + storeConfig['url'] + '/' + id,
            data: condition
        }).then((resp) => {
            if (resp.code == 408 || resp.code == 409) {
                location.href = apiConfig.login;
            }
            if (resp.success) {
                var e = new CustomEvent('change:' + id);
                e.data = resp;
                callback(e);
            } else {
                Message.warning(resp.msg);
            }
        })
        .fail((err, msg) => {
            Message.error('服务器错误');
        });
    };

    $.load = (condition = {}) => {
        lastCondition = condition;

        eventDelegate.dispatchEvent(new CustomEvent('beforeload'));

        loading = true;

        reqwest({
            url: apiConfig.api + storeConfig['url'],
            data: condition,
        }).then((resp) => {
            if (resp.code == 408 || resp.code == 409) {
                location.href = apiConfig.login;
            }
            if (resp.success) {
                lastResponseData = resp;
                var e = new CustomEvent('change');
                e.condition = condition;
                e.data = lastResponseData;
                eventDelegate.dispatchEvent(e);
            } else {
                Message.warning(resp.msg);
            }
        })
        .fail((err, msg) => {
            Message.error('服务器错误');
        })
        .always((resp) => {
            loading = false;
            eventDelegate.dispatchEvent(new CustomEvent('afterload'));
        });
    };

    $.reload = (condition = {}) => {
        if(loading && (!condition || Object.keys(condition).length == 0)){
            return;
        }
        for (var i in condition) {
            lastCondition[i] = condition[i];
        }
        // Object.assign(lastCondition, condition);
        $.load(lastCondition);
    };

    $.save = (modal, extra) => {
        var requestOption = {
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(modal),
        };
        if (modal[storeConfig['id_attribute']]) {
            // Update
            requestOption['url'] = `${storeConfig['url']}/${modal[storeConfig['id_attribute']]}`;
            requestOption['headers'] = { 'X-Http-Method-Override': 'PUT' };
        } else {
            // Create
            requestOption['url'] = storeConfig['url'];
        }

        if (extra) {
            const extraKeys = Object.keys(extra);
            for (const key of extraKeys) {
                if (requestOption.url.indexOf('?') > -1) {
                    requestOption.url += `&${key}=${extra[key]}`;
                } else {
                    requestOption.url += `?${key}=${extra[key]}`;
                }
            }
        }

        requestOption['url'] = apiConfig.api + requestOption['url'];

        return reqwest(requestOption).then((resp) => {
            if (resp.success) {
                var e = new CustomEvent('change:' + modal[storeConfig['id_attribute']]);
                e.data = resp;
                eventDelegate.dispatchEvent(e);
                $.reload();
            } else {
                Message.error(resp.msg);
            }
            return resp;
        })
        .fail((err, msg) => {

        });
    };

    $.remove = (id) => {
        var requestOption = {
            method: 'POST',
            url: apiConfig.api + `${storeConfig['url']}/${id}`,
            headers: { 'X-Http-Method-Override': 'DELETE' },
        };
        return reqwest(requestOption).then((resp) => {
            if (resp.success) {
                $.reload();
            }
            return resp;
        })
            .fail((err, msg) => {

            });
    };

    return $;
};


let initStore = (store, config) => {
    for (let storeName in config) {
        let storeConfig = config[storeName];
        if (storeConfig && storeConfig['url']) {
            if (!storeConfig.type || storeConfig.type == 'rest') {
                store[storeName] = restProxyConstructor(storeConfig);
            }
        } else {
            store[storeName] = {};
            initStore(store[storeName], storeConfig);
        }
    }
};

initStore(store, config);


export default store;
