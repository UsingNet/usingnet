import React, { PropTypes } from 'react';
import Header from './header';
import Sidebar from './sidebar';
import reqwest from 'reqwest';
import cookie from 'react-cookie';
import voip from 'modules/voip';
import store from 'network/store';
import config from 'config';
import storeConfig from 'network/store_config';
import Socket from 'network/socket';
import { withRouter } from 'react-router';
import { Message, Alert } from 'antd';
import './layout.less';
import notify from 'modules/notify';

class Layout extends React.Component
{
    // 判断客服是否处于活跃状态
    state = {
        chatTips: false,
        pageTitle: '首页',
        orders: [],
        currentOrder: null,
        agentStatus: cookie.load('agent_status'),
        routePath: '/',
        voipStatus: null,
        me: {},
        setting: {},
        firstMount: true,
    };

    tokens = []
    orderInfos = []

    setSyncState = (obj, cb = null) => {
        for (const i in obj) {
            if (obj.hasOwnProperty(i)) {
                this.syncState[i] = obj[i];
            }
        }
        this.setState(this.syncState, cb);
    };

    windowTimeout = false;
    componentDidMount() {
        if (!this.syncState.agentStatus) {
            cookie.save('agent_status', 'online', { path: '/' });
        }

        this.setPageTitle(this.props.children.props.route.name);
        store.setting.base.subscribe(this.setting);
        const windowToken = new Date().getTime() + Math.random();
        const tokenKey = '_usingnettoken';
        cookie.save(tokenKey, windowToken, { path: '/' });

        // 判断是否打开多个窗口
        setInterval(() => {
            if (cookie.load(tokenKey) !== windowToken) {
                Socket.closeAll();
                if (!this.windowTimeout) {
                    this.windowTimeout = true;
                    this.setState({ orders: [] });
                }
            }
        }, 1000);
        // this.loadMessage();
        // this.getSocket();
    }

    componentDidUpdate() {
        this.setPageTitle(this.props.children.props.route.name);
        if (this.props.children.props.route.path === 'chat') {
            if (this.syncState.chatTips) {
                this.setSyncState({
                    chatTips: false,
                });
            }
        }

        let hasUnread = false;
        this.syncState.orders.forEach((order) => {
            if (order.unread) {
                hasUnread = true;
            }
        });

        if (!hasUnread) {
            notify.clearMessage();
        }
    }

    getMeOneTime = (me) => {
        this.setSyncState({
            me,
        });

        if (!this.haveMe) {
            store.order.all.subscribe(this.order);
            this.haveMe = true;
        }
    }

    setting = (e) => {
        const self = this;
        const setting = e.data.data;
        const agentStatus = this.syncState.agentStatus;
        if (setting.plan.slug != 'experience' && setting.expiration < 15 && !cookie.load('plan_expiration_tips')) {
            Message.warning(`您的套餐还有 ${setting.expiration} 天到期，请及时续费`, 5);
            cookie.save('plan_expiration_tips', 1, {path: '/'})
        }

        if (setting.online + 1 > setting.plan.agent_num) {
            this.setSyncState({
                agentStatus: 'offline',
                setting
            });
            //return this.props.router.push('/limit');
        } else if (this.props.location.pathname === '/limit') {
            this.props.router.push('/')
        }

        if (agentStatus !== 'offline') {
            this.connectionListener();
            if (setting.functions.chat.voip.status) {
                voip.init((fn) => {
                    fn.when_connected(() => {
                        voip.onwork();
                        self.syncState.orders.forEach(o => {
                            o.voipStatus = 'connected';
                        });
                        self.setSyncState({ voipStatus: 'connected', hasVoip: false });
                    });
                    fn.when_outbound(() => {
                        const orders = this.syncState.orders;
                        if (self.syncState.voipStatus !== 'outbound') {
                            let current = {};
                            orders.forEach(o => {
                                if (o.id === Number(self.props.params.id)) {
                                    current = o;
                                }
                            });
                            current.voipStatus = 'outbound';
                            self.setSyncState({ voipStatus: 'outbound' });
                        }
                    });
                    fn.when_inbound(() => {
                        const orders = this.syncState.orders;
                        let current = {};
                        orders.forEach(o => {
                            if (o.id === Number(this.state.voipOrderId)) {
                                current = o;
                            }
                        });
                        current.voipStatus = 'inbound';
                        self.setSyncState({ voipStatus: 'inbound', hasVoip: true });
                    });
                    fn.when_active(() => {
                        const orders = this.syncState.orders;
                        let current = {};
                        orders.forEach(o => {
                            if (o.id === Number(self.props.params.id)) {
                                current = o;
                            }
                        });
                        current.voipStatus = 'active';
                        self.setSyncState({ voipStatus: 'active' });
                    });
                });
            }
        }

        store.online.subscribe(this.agentOnlines);
        this.setSyncState({
            setting,
        });
    };

    sendInterval = null;
    setPageTitle = (title) => {
        if (this.state.setting.name) {
            document.title = `${title} - ${this.state.setting.name}`;
        }
        const path = this.props.children.props.route.path ?
            this.props.children.props.route.path : '/';
        if (title !== this.syncState.pageTitle) {
            this.setSyncState({
                pageTitle: title,
                routePath: path,
            });
        }
    };
    componentWillUnmount() {
        store.setting.base.unsubscribe(this.setting);
    }

    onMenuClick = (linkTo) => {
        if ('/' === linkTo) {
            store.online.reload();
        }
    }

    setAgentStatus = () => {
        if (this.state.setting.online + 1 > this.state.setting.plan.agent_num) {
            this.props.router.push('/limit');
        }
        const status = this.syncState.agentStatus === 'offline' ? 'online' : 'offline';
        if (status !== 'offline') {
            this.connectionListener();
        } else {
            let agentOnlines = this.syncState.agentOnlines;
            reqwest({ url: '/api/user/offline', method: 'POST' })
                .then((resp) => {
                    if (resp.code === 410) {
                        return ;
                    }
                    cookie.save('agent_status', status, { path: '/' });
                    this.setSyncState({ agentStatus: status });
                    if (resp.success) {
                        agentOnlines = agentOnlines.filter((agent) => agent.id !== resp.data.id);
                        this.setSyncState({
                            orders: [],
                            agentOnlines,
                        });
                        this.socket = null;
                        Socket.closeAll();
                    }
                })
                .fail(() => {
                    Message.error('服务器错误');
                });
        }
    };
    syncState = {
        firstMount: true,
        chatTips: false,
        pageTitle: '首页',
        orders: [],
        currentOrder: null,
        agentStatus: cookie.load('agent_status'),
        routePath: '/',
        voipStatus: null,
        me: {},
        setting: {},
        agentOnlines: [],
        hasVoip: false,
        voipOrderId: 0,
    };

    order = (resp) => {
        // #763 对话工单刷新时，首页的在线客服要及时刷新
        store.online.reload();

        if (resp.data.success && this.syncState.agentStatus !== 'offline') {
            const orders = this.syncState.orders;
            // if (orders.length === 0) {
            //     orders = resp.data.data;
            //     orders.forEach((order) => {
            //         order.unread = 0;
            //         order.messages = [];
            //     });
            // }

            const tokens = [];
            const orderInfos = [];
            const length = orders.length;
            resp.data.data.forEach((item) => {
                const exists = orders.filter(order => order.id === item.id);
                if (!exists.length) {
                    item.unread = 0;
                    item.sortId = 0;
                    item.messages = [];

                    if (length === 0) {
                        orders.push(item)
                    } else {
                        orders.unshift(item);
                    }

                    tokens.push(item.token);
                    orderInfos.push(item);
                    this.tokens.push(item.token);
                    this.orderInfos.push(item);
                }
            });
            this.setSyncState({ orders });
            if (resp.data.data.length && this.syncState.agentStatus !== 'offline') {
                // this.loadMessage();
                this.addTokensToSocket(tokens, orderInfos, orders);
            }

            if (resp.condition && resp.condition.order_id) {
                this.props.router.push(`/chat/${resp.condition.order_id}`)
            }
        }
    };

    addTokensToSocket = (tokens, orderInfos, orders) => {
        if (tokens && tokens.length) {
            this.getSocket().sendWithCallback({
                action: 'add_token',
                token: tokens,
            }, () => {
                orderInfos.forEach(info => {
                    this.getSocket().sendWithCallback({
                        action: 'tail',
                        read: true,
                        limit: 11,
                        pipe: [info.contact.token, this.syncState.me.team_token],
                    }, (m) => {
                        const messages = m.data.messages;
                        let orderId = '';
                        let current = '';

                        if (messages.length > 0 && messages[0].package) {
                            orderId = messages[0].package.order_id;
                        }

                        if (orderId) {
                            current = orders.find((o) => o.id === info.id);
                        }

                        if (current) {
                            if (messages.length === 11) {
                                messages.splice(0, 1);
                                current.hasMore = true;
                            } else {
                                current.hasMore = false;
                            }
                            current.action = 'tail';
                            if (current.messages.length >= 10) {
                                current.action = 'more';
                            }

                            for (const msg of messages) {
                                if (msg.package && msg.package.order_id === info.id) {
                                    current.messages.unshift(msg);
                                }
                            }
                        }

                        this.setSyncState({
                            orders,
                        });
                    });
                });
            });
        }
    }

    newMessageIds = []

    initSocket = (order) => {
        const socket = Socket.connection(`${config.socket}${order.token}&empty=true`);
        const self = this;
        socket.on('message', (message) => {
            const orders = this.syncState.orders;



            if (message.type === 'message') {
                let hasUnread = false;
                let current = {};
                let orderId = '';

                if (message.data.package) {
                    orderId = message.data.package.order_id;
                }

                if (orderId) {
                    current = orders.find((o) => o.id === orderId);
                }

                if (message.data.direction === 'SEND') {
                    orders.forEach(order => {
                        if (!order.unread && order.sortId) {
                            order.sortId = 0;
                        }
                    });
                }

                if (current) {
                    if (message.data.notice && message.data.notice.type === 'voip') {
                        this.setSyncState({
                            voipOrderId: orderId,
                            hasVoip: true,
                        });
                        const others = orders.filter(o => o.id !== message.data.package.order_id);

                        others.forEach(ot => ot.voipStatus = 'disabled')
                    }

                    if (this.newMessageIds.indexOf(message.data._id) === -1) {
                        if (!message.data.package.read
                            && (message.data.package.order_id !== self.props.children.props.params.id)
                            && message.data.direction === 'RECEIVE' && message.data.type !== 'SYSTEM'
                        ) {
                            current.unread++;
                            current.sortId++;
                            hasUnread = true;
                            notify.message(current, this.props.router);
                        }

                        if (!hasUnread && !self.sendInterval) {
                            notify.clearMessage();
                        }

                        if (message.data.direction === 'SEND') {
                            if (self.sendInterval) {
                                clearTimeout(self.sendInterval);
                                self.sendInterval = null;
                                let withUnread = false;
                                orders.forEach((item) => {
                                    if (item.unread) {
                                        withUnread = true;
                                    }
                                });
                                if (!withUnread) {
                                    notify.clearMessage();
                                }
                            }
                        } else {
                            if (!self.sendInterval && !hasUnread) {
                                self.sendInterval = setTimeout(() => {
                                    notify.message(current, this.props.router);
                                    self.sendInterval = null;
                                }, 10000);
                            }
                        }

                        current.typing = false;
                        current.messages.push(message.data);
                        current.action = 'message';

                        if (current.id === Number(this.props.params.id)) {
                            current.unread = 0;
                            current.messages.forEach((msg) => {
                                if (!msg.package.read && msg.direction === 'RECEIVE') {
                                    this.socket.send({
                                        action: 'read',
                                        _id: msg._id,
                                        message_id: Math.random(),
                                    });
                                    msg.package.read = true;
                                }
                            });
                        }
                    }

                    orders.splice(orders.indexOf(current), 1);
                    orders.unshift(current);
                }

                this.newMessageIds.push(message.data._id);

                self.setSyncState({
                    orders,
                });
            }

            if (message.type === 'event') {
                const data = message.data;

                if (!this.syncState.firstMount && data.action === 'online') {
                    if (this.tokens.length) {
                        this.getSocket().send({
                            action: 'add_token',
                            token: this.tokens,
                        });
                    }
                }

                if (data.action === 'online') {
                    this.setSyncState({
                        firstMount: false,
                    });
                }

                if (data.action === 'notice' && data.data.action ===
                    'typing' && data.data.message) {
                    for (const o of orders) {
                        o.typing = data.data.message;
                    }
                    // order.typing = data.data.message;
                    self.setSyncState({
                        orders,
                    });
                }

                if (data.action === 'remote_offline') {
                    // order.typing = false;
                    self.setSyncState({ orders });
                }
            }
        });
        return socket;
    };

    getSocket = () => {
        if (!this.socket) {
            this.socket = this.initSocket(this.syncState.orders[0]);
        }

        return this.socket;
    }

    closeOrder = (id, cb) => {
        const orders = this.syncState.orders;
        let preOrder = null;
        let index = -1;
        const url = `${config.api}${storeConfig.order.all.url}/${id}`;

        orders.forEach((order, i) => {
            if (order.id === id) {
                if (orders[i - 1]) {
                    preOrder = orders[i - 1];
                }
                index = i;
                // order.socket.disconnect(true);
                this.socket.send({
                    action: 'remove_token',
                    token: order.token,
                });

                order.tokenAdded = false;
                return false;
            }
            return true;
        });

        reqwest({
            url,
            method: 'POST',
            headers: { 'X-Http-Method-Override': 'DELETE' },
        }).then(resp => {
            if (resp.success) {
                Message.success('对话已关闭');
                orders.splice(index, 1);
                this.setSyncState({ orders });
                if (!this.syncState.orders || this.syncState.orders.length === 0) {
                    if (this.sendInterval) {
                        clearTimeout(this.sendInterval);
                        self.sendInterval = null;
                        notify.clearMessage();
                    }
                }

                if (preOrder) {
                    this.props.router.push(`/chat/${preOrder.id}`);
                }
            } else {
                Message.error(resp.msg);
            }

            if (cb && typeof(cb) === 'function') {
                cb();
            }
        }).fail(() => {
            Message.error('服务器错误');
        });
    };

    transferOrder = (agentId, orderId, type) => {
        const self = this;
        reqwest({ url: '/api/order/shift', method: 'POST',
            data: { id: orderId, user_id: agentId, type } })
            .then((resp) => {
                if (resp.success) {
                    const orders = self.syncState.orders.filter(order => order.id !== orderId);
                    self.setSyncState({
                        orders,
                    });
                } else {
                    Message.error(resp.msg);
                }
            })
            .fail(() => {
                Message.error('服务器错误');
            });
    };

    saveOrder = (id, data) => {
        const self = this;
        const orders = this.syncState.orders;
        reqwest({ url: `/api/order/${id}`, method: 'PUT', data, headers: { 'X-Http-Method-Override': 'PUT' } })
            .then((resp) => {
                if (resp.success) {
                    orders.forEach((order, i) => {
                        if (order.id === id) {
                            orders[i].type = resp.data.type;
                            orders[i].category = resp.data.category;
                            if (data.category) {
                                Message.success('保存成功');
                            }
                        }
                    });
                    self.setSyncState({ orders });
                } else {
                    Message.error(resp.msg);
                }
            })
            .fail(() => {
                Message.error('服务器错误');
            });
    };

    saveContact = (id, tags) => {
        const self = this;
        const orders = this.syncState.orders;
        reqwest({ url: `/api/contact/${id}`, method: 'PUT', data: {tags: tags.length ? tags : ''}, headers: { 'X-Http-Method-Override': 'PUT' } })
            .then((resp) => {
                if (resp.success) {
                    orders.forEach((order, i) => {
                        if (order.contact.id === id) {
                            resp.data.source = order.contact.source;
                            order.contact = resp.data;
                            Message.success('保存成功');
                        }
                    });
                    self.setSyncState({ orders });
                } else {
                    Message.error(resp.msg);
                }
            })
            .fail(() => {
                Message.error('服务器错误');
            });
    };

    agentOnlines = (resp) => {
        if (resp.data.success) {
            this.setSyncState({
                agentOnlines: resp.data.data,
            });
        }
    }

    connectionListener = () => {
        reqwest({ url: '/api/message/agent', data: { type: 'LISTENER' } })
            .then((resp) => {
                if (resp.code === 410) {
                    return ;
                }
                if (this.syncState.agentStatus === 'offline') {
                    const status = 'online';
                    cookie.save('agent_status', status, { path: '/' });
                    this.setSyncState({ agentStatus: status });
                }
                const host = config.socket + resp.data;
                const socket = Socket.connection(host);
                socket.on('message', (message) => {
                    const data = message.data;
                    if (message.type === 'event') {
                        if (data.action === 'request' && data.data.action === 'offline') {
                            this.socket = null;
                            if (data.data) {
                                switch (data.data.from) {
                                case 'manage':
                                    Message.error(`您的账号已被管理员${data.data.name}要求下线`);
                                    break;
                                case 'wechat':
                                    Message.error('您的账号已在微信端登录');
                                    break;
                                default:
                                    break;
                                }
                            } else {
                                Message.error('您的账号已被系统离线');
                            }

                            if (this.syncState.agentStatus === 'online') {
                                this.setAgentStatus();
                            }
                        }
                    }
                    if (Object.keys(message.data).length && message.type === 'message') {
                        store.order.all.reload();
                    }
                });

                store.order.all.reload();
                socket.on('connect', () => {
                    store.online.reload();
                });
            });
    };

    disconnection = () => {
        Socket.closeAll();
    };

    toVoipChat = () => {
        if (this.syncState.voipOrderId) {
            this.props.router.push(`/chat/${this.syncState.voipOrderId}`);
        }
    }

    render() {
        let childrenWithProps = React.Children.map(this.props.children,
            (child) => React.cloneElement(child, {
                setSyncState: this.setSyncState,
                orders: this.syncState.orders,
                closeOrder: this.closeOrder,
                transferOrder: this.transferOrder,
                saveOrder: this.saveOrder,
                voipStatus: this.syncState.voipStatus,
                setting: this.syncState.setting,
                me: this.syncState.me,
                agentStatus: this.syncState.agentStatus,
                agentOnlines: this.syncState.agentOnlines,
                socket: this.socket,
                router: this.props.router,
                saveContact: this.saveContact
            }));


        if (this.windowTimeout) {
            childrenWithProps =
                (<div className="window-timeout">
                    <Alert
                        message="页面已过期，请关闭窗口或刷新"
                        description="同时打开多个后台窗口可能会导致不必要的错误"
                        type="error"
                        showIcon
                    />
                </div>);
        }

        return (
            <div className="container">
                <Sidebar
                    onMenuClick={this.onMenuClick}
                    chatTips={this.syncState.chatTips}
                    routePath={this.syncState.routePath}
                    setting={this.syncState.setting}
                />
                <div id="main">
                    <Header
                        history={this.props.router}
                        setAgentStatus={this.setAgentStatus}
                        agentStatus={this.syncState.agentStatus}
                        pageTitle={this.syncState.pageTitle}
                        getMeOneTime={this.getMeOneTime}
                        hasVoip={this.syncState.hasVoip}
                        voipStatus={this.syncState.voipStatus}
                        voipOrderId={this.syncState.voipOrderId}
                        toVoipChat={this.toVoipChat}
                    />
                    <div className="content-wapper">
                        {childrenWithProps}
                    </div>
                </div>
            </div>
        );
    }
}

Layout.propTypes = {
    children: PropTypes.object,
    router: PropTypes.object,
};

export default withRouter(Layout);
