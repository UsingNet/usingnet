import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Icon, Tooltip, Badge, Tag } from 'antd';
import store from 'network/store';
import pkg from '../../../package.json';
import reqwest from 'reqwest';

export default class Sidebar extends React.Component {
    state = {
        menus: [],
        user: {},
        setting: {},
    };

    componentDidMount() {
        store.me.subscribe(this.user);
    }

    componentWillUnmount() {
        store.me.unsubscribe(this.user);
    }

    onPermissionsGet = (resp) => {
        const permissions = resp.data;
        let defaultMenus = [
            this.homeMenu,
            this.chatMenu,
        ];
        if (resp.success) {
            if (this.state.user.role === 'MEMBER') {
                for (const p of permissions) {
                    if (p.used) {
                        switch (p.slug) {
                        case 'history':
                            defaultMenus.push(this.historyMenu);
                            break;
                        case 'statistics':
                            defaultMenus.push(this.statisticsMenu);
                            break;
                        case 'contact':
                            defaultMenus.push(this.contactMenu);
                            break;
                        case 'agent':
                            defaultMenus.push(this.agentMenu);
                            break;
                        case 'appstore':
                            defaultMenus.push(this.appMenu);
                            break;
                        case 'setting':
                            defaultMenus.push(this.settingMenu);
                            break;
                        default:
                            break;
                        }
                    }
                }
            } else {
                defaultMenus = defaultMenus.concat([
                    this.historyMenu,
                    this.statisticsMenu,
                    this.contactMenu,
                    this.agentMenu,
                    this.appMenu,
                    this.settingMenu,
                ]);
            }
        }

        this.setState({
            menus: defaultMenus,
        });
    };

    settingMenu = {
        link: 'setting',
        icon: 'setting',
        name: '设置',
    };

    homeMenu = {
        link: '/',
        icon: 'home',
        name: '首页',
    };

    chatMenu = {
        link: 'chat',
        icon: 'message',
        name: '对话',
    };

    historyMenu = {
        link: 'history',
        icon: 'clock-circle-o',
        name: '历史',
    };

    statisticsMenu = {
        link: 'statistics',
        icon: 'line-chart',
        name: '统计',
    };

    contactMenu = {
        link: 'contact',
        icon: 'team',
        name: '客户',
    };

    appMenu = {
        link: 'appstore',
        icon: 'appstore-o',
        name: '应用'
    };

    agentMenu = {
        link: 'agent',
        icon: 'customerservice',
        name: '客服',
    };

    user = (resp) => {
        if (resp.data.success) {
            reqwest('/api/permission').then(response => this.onPermissionsGet(response));
            this.setState({
                user: resp.data.data,
            });
        }
    };

    goHelpPage = () => {
        const url = window.usingnetCrm.getUrl();
        window.open(url);
    };

    render() {
        const path = this.props.routePath;
        const self = this;
        const setting = this.props.setting;
        let plan = '';
        if (setting.plan) {
            const color = setting.plan.slug === 'experience' ? '' : 'yellow';
            plan = <Tag color={ color }>{setting.plan.name}</Tag>
        }

        return (
            <aside id="sidebar">
                <Link to="/">
                    <img
                        alt="logo"
                        className="logo"
                        src="//o1hpnn7d6.qnssl.com/company-logo3.png"
                    />
                </Link>
                <ul className="menu">
                    {
                        this.state.menus.map((item, i) => {
                            let current = path === item.link ? 'current' : '';
                            return (<li key={i} className={current}>
                                <Tooltip title={item.name} placement="right">
                                    <Link to={ item.link === '/' ? '/' : `/${item.link}` } onClick={ () => { this.props.onMenuClick(item.link) } }>
                                        <Badge dot={item.link === 'chat' && self.props.chatTips}>
                                            <Icon type={item.icon} />
                                        </Badge>
                                    </Link>
                                </Tooltip>
                            </li>);
                        })
                    }
                </ul>
                <div className="bottom">
                    <span className="to-nest-im" onClick={this.goHelpPage}>
                        <Icon type="question" />
                        <div className="version">v{pkg.version}</div>
                    </span>
                    <Link to="/setting/combo">
                        <div className="plan">{plan}</div>
                    </Link>
                </div>
            </aside>
        );
    }
}

Sidebar.propTypes = {
    routePath: PropTypes.string,
    onMenuClick: PropTypes.func,
};
