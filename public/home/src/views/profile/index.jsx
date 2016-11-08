import React from 'react';
import { Form, Input, Button, Checkbox, Tabs, Icon, Menu, Modal } from 'antd';
import { Link } from 'react-router';
import Account from './account';
import Shortcut from './shortcut';
import FastReply from './fastReply';
import Wechat from './wechat';

import './index.less';

export default class Profile extends React.Component {

    state = {
        visible: false,
    }

    pages = {
        account: <Account />,
        wechat: <Wechat />,
        shortcut: <Shortcut />,
        fastReply: <FastReply />,
    };

    render() {
        let page = <Account />;
        const type = this.props.params.type;
        if (this.pages[type]) {
            page = this.pages[type];
        }

        return (<div id="profile" className="ant-layout-container">
                <aside className="ant-layout-sider aside">
                    <Menu selectedKeys={[this.props.params.type || 'account']} mode="inline">
                        <Menu.Item key="account">
                            <Link to="/profile/account">账号信息</Link>
                        </Menu.Item>
                        <Menu.Item key="wechat">
                            <Link to="/profile/wechat">绑定微信</Link>
                        </Menu.Item>
                        {
                            // <Menu.Item key="shortcut">
                            //     <Link to="/profile/shortcut">快捷回复</Link>
                            // </Menu.Item>
                        }
                        <Menu.Item key="fastReply">
                            <Link to="/profile/fastReply">快捷回复</Link>
                        </Menu.Item>
                    </Menu>
                </aside>
                <div className="ant-layout-content content">
                    <div style={{ height: '100%', clear: 'both' }}>
                        {page}
                    </div>
                </div>


        </div>);
    }
}
