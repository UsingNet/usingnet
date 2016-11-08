import React, { PropTypes } from 'react';
import SourceDevices from 'views/components/SourceDevices';

export default class UserInfo extends React.Component {
    render() {
        const contact = this.props.contact;
        let devices = '';
        let referrer = '';

        if (contact && contact.package && contact.package.user_agent) {
            const pkg = contact.package;
            let userAgent = pkg.user_agent;

            devices = (
                <SourceDevices userAgent={userAgent} />
            );

            if (contact.package.referrer) {
                referrer = (
                    <p className="referrer ant-col-14">
                        <a href={pkg.referrer.url} target="_blank">
                            {pkg.referrer.name}
                        </a>
                    </p>
                );
            }
        }

        return (
            <div className="user-info">
                <div className="head">
                    <span>用户信息</span>
                </div>
                <div className="user-content">
                    <div className="clearfix info-item">
                        <h4 className="title">
                            客户资料
                        </h4>

                        <ul>
                            <li className="ant-col-24">
                                <span className="ant-col-6">姓名：</span>
                                <p className="ant-col-14">{contact.name}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">备注：</span>
                                <p className="ant-col-14">{contact.remark}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">手机：</span>
                                <p className="ant-col-14">{contact.phone}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">邮箱：</span>
                                <p className="ant-col-14">{contact.email}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">微信昵称：</span>
                                <p className="ant-col-14">{contact.nickname}</p>
                            </li>
                        </ul>
                    </div>

                    <div className="clearfix info-item">
                        <h4 className="title">
                            访问信息
                        </h4>

                        <ul>
                            <li className="ant-col-24">
                                <span className="ant-col-6">地址：</span>
                                <p className="ant-col-14">{contact.package.address}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">IP：</span>
                                <p className="ant-col-14">{contact.ip}</p>
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">设备：</span>
                                {devices}
                            </li>
                            <li className="ant-col-24">
                                <span className="ant-col-6">来源：</span>
                                {referrer}
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        );
    }
}

UserInfo.propTypes = {
    contact: PropTypes.object.isRequired,
};
