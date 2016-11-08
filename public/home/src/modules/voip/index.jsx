import reqwest from 'reqwest';
import config from 'config';
import { Message } from 'antd';
import storeConfig from 'network/store_config';

const Voip = {
    status: false,
};

function initCallback(status)
{
    Voip.status = 'connected';
    const obj = document.querySelector('object');
    obj.style.zoom = 3;
    obj.style.opacity = 0.1;

    setTimeout(() => {
        obj.style.opacity = 1;
        obj.style.zoom = 1;
    }, 2000);
}

function notifyCallback(status)
{
}

Voip.init = function (callback) {
    let flashWapper = document.createElement('div');
    let flashScript = document.createElement('script');
    let voipScript = document.createElement('script');
    flashWapper.id = 'flash';
    flashWapper.style.width = '215px';
    flashWapper.style.height = '138px';
    flashScript.src = '/resource/js/swfobject.js';
    voipScript.src = '/resource/js/yuntongxun.js';
    document.querySelector('.content-wapper').appendChild(flashWapper);
    document.querySelector('body').appendChild(flashScript);
    document.querySelector('body').appendChild(voipScript);
    voipScript.onload = () => {
        reqwest('/api' + storeConfig.voip.token.url)
            .then(resp => {
                const token = config.voipToken + '#' + resp.data;
                Cloopen.init('flash', initCallback, notifyCallback, token);
                callback(Cloopen);
            });
    };
};

Voip.call = function (number) {
    if (!Voip.status) {
        Message.error('电话初始化失败，请刷新页面重试');
        return;
    }
    Cloopen.invitetel(number);
};

Voip.hangup = () => {
    Cloopen.bye();
};

Voip.answer = () => {
    Cloopen.accept();
};

Voip.onwork = () => {
    reqwest(`/api${storeConfig.voip.onwork.url}`)
        .then(resp => {
            reqwest(`/api${storeConfig.voip.onready.url}`)
                .then(resp => {
                })
        });
};

export default Voip;
