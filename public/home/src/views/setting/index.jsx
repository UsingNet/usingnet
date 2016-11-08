import React from 'react';
import { Card } from 'antd';
import SettingMenu from 'views/setting/settingMenu';
import PhoneAccess from './interface/phoneAccess';
import SmsAccess from './interface/smsAccess';
import Web from './interface/web/index';
import Wechat from './interface/wechat/index';
import Weibo from './interface/weibo/index';
import Email from './interface/email';
import Combo from './account/combo';
import Recharge from './account/recharge';
import Expense from './account/expense';
import Permission from './account/permission';
import Plugin from './plugin/plugin';
import Assign from './agent/assign';
import './setting.less';
import store from 'network/store';

export default class Setting extends React.Component {

    state = {
        current: 'web',
        contentInterface: <Web />, contentKey: 'web',
    };

    getPage(key) {
        switch (key) {
        case 'web':
            return <Web setting={this.props.setting} />;
        case 'wechat':
            return <Wechat />;
        case 'weibo':
            return <Weibo router={this.props.router} />;
        case 'phoneAccess':
            return <PhoneAccess />;
        case 'smsAccess':
            return <SmsAccess />;
        case 'email':
            return <Email />;
        case 'combo':
            return <Combo />;
        case 'plugin':
            return <Plugin />;
        case 'expense':
            return <Expense />;
        case 'recharge':
            return <Recharge />;
        case 'permission':
            return <Permission />;
        case 'assign':
            return <Assign />;
        default:
            break;
        }
    }

    render() {
        const type = this.props.params.type;
        const current = type ? type : 'web';
        const page = this.getPage(current);

        return (
      <div id="setting">
        <div className="ant-layout-container">
          <aside className="ant-layout-sider">
            <SettingMenu current={current} />
          </aside>
          <div className="ant-layout-content">
            <div style={{ height: '100%', clear: 'both' }}>
              {page}
            </div>
          </div>
        </div>
      </div>
    );
    }
}
