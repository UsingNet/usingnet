import React from 'react';
import { Icon, Dropdown, Menu, Badge, Notification } from 'antd';
import { Link, History } from 'react-router';
import config from 'config';
import store from 'network/store';
import Reqwest from 'reqwest';
import Socket from 'network/socket';
import { withRouter } from 'react-router';

class Header extends React.Component
{

    state = {
        user: {
            img: '//o1hpnn7d6.qnssl.com/default-avatar.png',
        },
        hasNotice: false,
    };

    onClick = () => {
        this.props.setAgentStatus();
    };

    user = (e) => {
        const userData = e.data.data;
        this.setState({
            user: e.data.data,
        });

        if (!this.scriptAppended) {
            const a = document.createElement('script');
            a.setAttribute('charset', 'UTF-8');
            a.src = '//im.usingnet.com/build/app.min.js';
            document.body.appendChild(a);
            window.usingnetJsonP = (usingnetInit) => {
                usingnetInit('943b3255785a550a13e007f63a6e58b8', {
                    email: userData.email,
                    phone: userData.phone,
                    extend_id: userData.token,
                    name: userData.name,
                    img: userData.img,
                });
            };

            this.props.getMeOneTime(userData);
            this.scriptAppended = true;
        }
    };

    checkNotice = (e, data) => {
        this.setState({
            hasNotice: false,
        });

        if (!this.props.router.isActive('notice')) {
            this.props.router.push({
                pathname: '/notice',
                state: data.data
            });
        } else {
            const e = new CustomEvent('noticeOnClick');
            e.notice = data.data;
            Socket.dispatchEvent(e);
        }

    }

    componentDidMount() {
        store.me.subscribe(this.user);

        const me = this;
        Reqwest({
            url: '/api/message/agent?type=IM&remote=SYSTEM',
        })
        .then((resp) => {
            if (resp.success) {
                const noticeSocket = Socket.connection(config.socket + resp.data, 'noticeSocket');
                noticeSocket.on('message', (data) => {
                    if ('message' === data.type) {
                        const reg = new RegExp('<[^<]*>', 'gi');
                        const msg = data.data.body.replace(reg, '');
                        Notification.info({
                            message: '系统消息',
                            description: <a onClick={(e) => {me.checkNotice(e, data)}}>{ msg.length > 100 ? (msg.substr(0, 100) + '...') : msg }</a>,
                        });
                        store.notice.reload();
                        if (!me.props.router.isActive('notice')) {
                            me.setState({
                                hasNotice: true,
                            });
                        }

                    }
                });
            }
        });
    }

    hideNoticeDot = () => {
        this.setState({
            hasNotice: false,
        });
    }

    componentWillUnmount() {
        store.me.unsubscribe(this.user);
    }

    render() {
        const logout = config.logout;
        const menu = (
            <Menu>
                <Menu.Item key="0">
                    <Link to="profile">
                        <Icon type="setting" /> 个人设置
                    </Link>
                </Menu.Item>
                {
                    // <Menu.Item key="0.5">
                    //     <Icon type="rollback" /> <a href={ `//${location.host.replace('home', 'app')}` } style={{ display: 'inline-block' }}>回旧版</a>
                    // </Menu.Item>
                }
                <Menu.Item key="1">
                    <Icon type="logout" /> <a href={logout} style={{ display: 'inline-block' }}>退出</a>
                </Menu.Item>
            </Menu>
        );

        let phoneStatus = '';
        switch (this.props.voipStatus) {
            case 'connected':
                break;
            case 'inbound':
                phoneStatus = (
                    <div
                        className="voip-status"
                        onClick={this.props.toVoipChat}
                    >
                        <Icon type="phone"></Icon>
                        <span>有来电...</span>
                        {
                            this.props.hasVoip
                            ? <span className="dot"></span>
                            : ''
                        }
                    </div>
                );
                break;
            case 'outbound':
                phoneStatus = (
                    <div
                      className="voip-status"
                      onClick={this.props.toVoipChat}
                    >
                      <Icon type="phone"></Icon>
                      <span>拨号中...</span>
                      {
                          this.props.hasVoip
                          ? <span className="dot"></span>
                          : ''
                      }
                    </div>
                );
                break;
            case 'active':
                phoneStatus = (
                    <div
                      className="voip-status"
                      onClick={this.props.toVoipChat}
                    >
                      <Icon type="phone"></Icon>
                      <span>通话中...</span>
                      {
                          this.props.hasVoip
                          ? <span className="dot"></span>
                          : ''
                      }
                    </div>
                );
                break;
            default:
                phoneStatus = '';
                break;
        }

        return (
            <header className="header">
                <div className="header-box">
                    <div className="nav-bar">
                        {this.props.pageTitle}
                    </div>
                    <div className="action-bar" >
                        <div className={ this.props.agentStatus == 'offline' ? 'offline' : 'online'}>
                            {phoneStatus}
                            <div className="status" onClick={ this.props.setAgentStatus }>
                                <span className="dot"></span>
                                <span>{this.props.agentStatus === 'offline' ? '离线' : '在线'}</span>
                            </div>

                            <div style={{ display: 'inline-block', marginLeft: 10, cursor: 'pointer' }} onClick={ this.hideNoticeDot }>
                                <Link to="/notice">
                                    <Badge dot={this.state.hasNotice}>
                                        <Icon type="notification" style={{ color: 'gray' }} />
                                    </Badge>
                                </Link>
                            </div>
                            <div className="user">
                                <Dropdown overlay={menu} trigger={['click']}>
                                    <a className="ant-dropdown-link" href="#">
                                        <img className="avatar" src={ `${this.state.user.img}-avatar` } alt="" />
                                    </a>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

export default withRouter(Header);
