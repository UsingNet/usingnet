import Immutable from 'immutable';
import reqwest from 'reqwest';
import { Message } from 'antd';
import urls from './urls';
import config from 'config';

let reqwestErrorHandler = (err) => {
    let resp = {};
    try {
        resp = JSON.parse(err.response);
    } catch (e) {
    }

    if (resp.code == 408) {
        window.location.replace = config.login;
    } else {
        Message.error(resp.msg);
    }
};

let prepareAjaxMethod = (url, method) => {

    return (options) => {
        if (options) {
            options = Immutable.fromJS(options);
        } else {
            options = Immutable.Map();
        }

        let params = url.split(/\//)
            .filter((param) => {
                return param[0] == ':';
            })
            .map((param) => {
                return param.slice(1);
            });


        let newUrl = params.reduce((url, param) => {
            let val = options.getIn(['params', param]);
            if (val) {
                return url.replace(`:${param}`, val);
            }

            return url;
        }, url);


        if (options.get('queryParams')) {
            let notEmpty = !(options.get('queryParams').isEmpty());
            let allValid = options.get('queryParams').every((queryParam) => {
                return queryParam != null;
            });

            if (notEmpty && allValid) {
                let urlPart = options.get('queryParams').map((value, key) => {
                    return key + '=' + value;
                }).join('&');
                newUrl = newUrl + '?' + urlPart;
            }
        }

        if (options.has('data')) {
            options = options.set('data', JSON.stringify(options.get('data')));
        }

        // restful 转换为 GET or POST
        method = method.toUpperCase();
        let methods = {
            GET: 'GET',
            POST: 'POST',
            PUT: 'POST',
            DELETE: 'POST',
        };

        options = options.merge({
            url: config.api + newUrl,
            method: methods[method],
            contentType: 'application/json',
            error: reqwestErrorHandler,
            headers: {
                'X-Http-Method-Override': method,
            },
        });

        return reqwest(options.toJS());
    };
};

let constructUrl = (stringOrObject, method) => {
    if (Immutable.Map.isMap(stringOrObject)) {
        return stringOrObject.map((value) => {
            return constructUrl(value, method);
        });
    } else {
        return Immutable.Map().set(method, prepareAjaxMethod(stringOrObject, method));
    }
};




let api = Immutable.fromJS(urls)
    .map(constructUrl)
    .reduce((prev, next) => {
        return prev.mergeDeep(next);
    })
    .toJS();

// module.exports = api

export default api;
