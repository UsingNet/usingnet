import React from 'react';
import ReactDOM from 'react-dom';
import { textToHtml } from 'modules/face';
import { Icon, Message, Popover, Spin, Tag, Modal } from 'antd';
import store from 'network/store';
import moment from 'moment';
import reqwest from 'reqwest';
import Messages from 'views/components/Messages';

let closing = [];

export default class MessageBox extends React.Component
{
    state = {
        onlineAgents: null,
        currentMessageId: null,
        now: null,
        length: 0,
        imgModalVisible: false,
        imgModalSrc: '',
        imgModalWidth: 0,
        order: {
            contact: {},
            user: {},
            messages: [],
        },
    };

    timer = null;

    componentDidMount() {
        this.resetScroll();
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.setState({
                    now: new Date().getMinutes(),
                });
            }, 60000);
        }

        this.setState({
            order: this.props.order,
            length: this.props.order.messages.length,
        });
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    componentDidUpdate() {
        if (this.props.order.action != 'more' && this.state.now != new Date().getSeconds() && (!this.state.imgModalVisible && !this.state.imgModalSrc)) {
            this.resetScroll();
        }
        // this.timer = setInterval(() => {
        //    this.setState({
        //        now: new Date().getTime()
        //    })
        // }, 60000);
    }

    resetScroll = () => {
        const me = this;
        const dom = ReactDOM.findDOMNode(this.refs.messages);
        const height = dom.scrollHeight;
        dom.scrollTop = height;
        const images = dom.getElementsByTagName('img');
        const count = images.length;
        for (let i = 0; i < count; i++) {
            images[i].onload = function () {
                const height = dom.scrollHeight;
                dom.scrollTop = height;
                this.ondblclick = () => {
                    const bodyWidth = document.body.offsetWidth;
                    let imgWidth = 0;
                    if (this.naturalWidth > bodyWidth * 0.8) {
                        imgWidth = bodyWidth * 0.8;
                    } else {
                        imgWidth = this.naturalWidth;
                    }
                    me.setState({
                        imgModalVisible: true,
                        imgModalSrc: this.src,
                        imgModalWidth: imgWidth,
                        imgContainerWidth: imgWidth + 10
                    });
                };
            };
        }
    };

    hideImgModal = () => {
        this.setState({
            imgModalVisible: false,
            imgModalSrc: ''
        });
    }

    onLoadMoreMessage = () => {
        const order = this.props.order;
        this.props.socket.sendWithCallback({
            action: 'tail',
            read: true,
            limit: 11,
            last_id: order.messages.length > 0 ? order.messages[0]._id : '',
            pipe: [order.contact.token, this.props.me.team_token],
            message_id: Math.random,
        }, (m) => {
            const orders = this.props.orders;
            const messages = m.data.messages;
            let orderId = '';
            let current = '';

            if (messages.length > 0 && messages[0].package) {
                orderId = messages[0].package.order_id;
            }

            if (orderId) {
                current = orders.find((o) => o.id === order.id);
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

                current.messages = messages.concat(current.messages);
            }

            this.props.setSyncState({
                orders,
            });
        });
    };

    onGetAgents = () => {
        const self = this;
        reqwest({ url: '/api/online' })
            .then((resp) => {
                if (resp.success) {
                    const onlineAgents = resp.data.filter((agent) => { return agent.id != self.props.order.user_id; });
                    if (onlineAgents.length) {
                        this.setState({ onlineAgents: resp.data });
                    }
                } else {
                    Message.error(resp.msg);
                }
            })
            .fail((err) => {
                Message.error('服务器错误');
            });
    };

    onTransferOrder = (e) => {
        const agentId = e.target.getAttribute('data-id');
        const order = this.props.order;
        this.props.socket.send({
            action: 'remove_token',
            token: order.token,
        });
        this.props.transferOrder(agentId, order.id, order.type);
        order.tokenAdded = false;
    };

    onCloseOrder = () => {
        if (closing.indexOf(this.props.order.id) < 0) {
            closing.push(this.props.order.id);
            this.props.closeOrder(this.props.order.id, () => {
                closing.splice(closing.indexOf(this.props.order.id), 1);
            });
        }
    };

    onOperator = (type, id, event) => {
        event.preventDefault();
        if (type == 'undo') {
            const order = this.state.order;
            reqwest({ url: '/api/message/undo/' + id })
                .then((resp) => {
                    if (resp.success) {
                        Message.success('已撤销');
                        order.messages.map((message) => {
                            if (message._id == id) {
                                message.package.undo = true;
                            }
                        });
                        this.setState({
                            now: new Date().getSeconds(),
                            order: order,
                        });
                    } else {
                        Message.error(resp.msg);
                    }
                });
        }
    };

    render() {
        const self = this;
        const order = this.props.order;
        const messages = order.messages;


        // 消息内容 显示原始 html
        function createMarkup(html) { return { __html: textToHtml(html.replace(/\n/g, '<br/>')) }; }
        let moreMessage = order.hasMore ? (<div className="more-message" onClick={this.onLoadMoreMessage}>更多消息</div>) : '';
        let onlineAgents = (<ul><li>没有在线客服</li></ul>);

        if (this.state.onlineAgents) {
            onlineAgents = this.state.onlineAgents.map((agent, i) => {
                if (agent.id != order.user_id) {
                    return <li key={i} data-id={agent.id} onClick={self.onTransferOrder}>{agent.name}</li>;
                }
            });
            onlineAgents = (<ul className="agent-list">{onlineAgents}</ul>);
        }

        return (
            <div className="message-box">
                <Modal
                    className="chat-box-imgModal"
                    visible={ this.state.imgModalVisible }
                    footer={[]}
                    width={ this.state.imgContainerWidth }
                    bodyStyle={{ padding: 5 }}
                    onCancel={ this.hideImgModal }
                    >
                    <img
                        src={ this.state.imgModalSrc }
                        style={{ width: this.state.imgModalWidth, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                         />
                </Modal>
                <div className="message-header">
                    <div className="contact-name">
                        {order.contact.name}
                    </div>
                    <div className="typing" style={{ display: order.typing ? 'block' : 'none' }}>
                        对方正在输入 [{order.typing}]
                    </div>
                    <div className="action-bar">
                        <div className="transfer">
                            <Popover placement="bottom" content={onlineAgents} trigger="click" onClick={this.onGetAgents}>
                                <span style={{ cursor: 'pointer' }}>转接</span>
                            </Popover>
                        </div>

                        <div className="close" onClick={this.onCloseOrder} data-id={this.props.id}>
                            <Icon type="cross" />
                        </div>
                    </div>
                </div>
                <div className="message-body" ref="messageBody">
                    {/* <div className="messages" ref="messages">
                        {moreMessage}
                        {
                            messages.map((message, i) => {
                                moment.locale('zh-cn');
                                const createdAt = moment(message.created_at*1000).fromNow();
                                let messageOperator = (
                                    <ul className="operator">
                                        <li>
                                            <a href="javascript:;" onClick={ this.onOperator.bind(this, 'undo', message._id)}>撤销</a>
                                        </li>
                                    </ul>
                                )

                                if (message.direction == 'SEND' && message.type != 'SYSTEM') {
                                    return <div key={i} className="message-item send">
                                        <div className="hd">
                                            <span className="date">{createdAt}</span>
                                            <span className="name">{message.package.agent.name}</span>
                                        </div>
                                            {
                                                !message.package.undo && message.type == 'IM' ?
                                                     (<Popover content={ messageOperator } title="操作" trigger="click" data-id={message._id}>
                                                        <p className="bd" dangerouslySetInnerHTML={createMarkup(message.body)}>
                                                        </p>
                                                    </Popover>)
                                                        :
                                                    (<p className={message.package.undo ? 'undo bd' : 'bd'} dangerouslySetInnerHTML={createMarkup(message.body)}>
                                                    </p>)
                                            }
                                    </div>
                                }

                                if (message.direction == 'RECEIVE' && message.type != 'SYSTEM') {
                                    return <div key={i} className="message-item receive">
                                        <div className="hd">
                                            <span className="name">{message.package.contact.name}</span>
                                            <span className="date">{createdAt}</span>
                                        </div>

                                        <p className="bd" dangerouslySetInnerHTML={createMarkup(message.body)}>
                                        </p>
                                    </div>
                                }

                                if (message.type == 'SYSTEM') {
                                    return <div key={i} className="message-item system">
                                        <div className="hd">
                                            <span className="date">{createdAt}</span>
                                        </div>
                                        <div className="bd" dangerouslySetInnerHTML={createMarkup(message.body)}>
                                        </div>
                                    </div>
                                }
                            })
                        }
                    </div>*/}
                    <Messages
                        ref="messages"
                        messages={ messages }
                        onLoadMoreMessage={ this.onLoadMoreMessage }
                        hasMoreMessage={ order.hasMore }
                        onOperator={ this.onOperator }
                    />
                </div>
            </div>
        );
    }

}
