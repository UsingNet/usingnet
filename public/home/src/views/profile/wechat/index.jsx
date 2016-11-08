import React from 'react';

export default class Wechat extends React.Component {
    state = {};

    render() {
        return (
            <div className="wechat">
                <h4>绑定微信</h4>
                <div className="main">
                    <img style={{ width: 200 }} src="/api/wechat/qrcode" />
                    <h4>使用微信“扫一扫”，绑定微信</h4>
                    <p style={{ marginTop: 40 }}>当所有客服都不在线时，客户发来咨询消息将通过微信公众号通知您。</p>
                </div>
            </div>
        );
    }
}
