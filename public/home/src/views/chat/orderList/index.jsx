import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Badge, Tag } from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
let scrollTop = 0;

export default class OrderList extends React.Component
{
    timer = null;

    componentDidMount() {
        this.refs['order-list'].scrollTop = scrollTop;
        if (!this.timer) {
            this.timer = setInterval(() => {
                this.setState({
                    now: new Date().getTime()
                });
            }, 60000);
        }
    }

    componentWillUnmount() {
        scrollTop = this.refs['order-list'].scrollTop;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const orders = this.props.orders;
        const self = this;
        moment.locale('zh-cn');
        const ordersCopy = [...orders];
        const orderSorted = ordersCopy.sort((a, b) => {
            if (a.messages.length && b.messages.length) {
                if (a.sortId !== b.sortId) {
                    return a.sortId > b.sortId ? -1 : 1;
                }
                if (a.messages[a.messages.length - 1].created_at ===
                    b.messages[b.messages.length - 1].created_at) {
                    return 0;
                }
                return a.messages[a.messages.length - 1].created_at >
                    b.messages[b.messages.length - 1].created_at ? -1 : 1;
            }
        });

        const orderList = orderSorted.map((order, i) => {
            let current = order.id === self.props.order.id ? 'current' : '';
            const unread = order.id === self.props.order.id ? 0 : order.unread;
            let classNames = 'order-item';
            let lastMessageTime = moment(order.last_replied * 1000).fromNow();

            if (order.messages.length) {
                order.messages.sort((a, b) => {
                    if (a.created_at === b.created_at) {
                        return 0;
                    }
                    return a.created_at > b.created_at ? 1 : -1;
                });

                const lastMessage = order.messages[order.messages.length - 1];
                if (lastMessage.type != 'SYSTEM') {
                    lastMessageTime = moment(lastMessage.created_at * 1000).fromNow();
                }
            }

            if (order.contact_status === 'offline') {
                classNames += ' offline';
            }

            return (<li key={i} className={ classNames } onClick={() => this.props.switchChat(order)}>
                    <Badge count={unread === 0 ? null : unread} style={{ right: 0, top: 50 }}>
                        <Link to={`/chat/${order.id}`} className={current}>
                            <div className="img">
                                <img src={order.contact.img.match(/qnssl/) ? `${order.contact.img}-avatar` : order.contact.img} />
                            </div>
                            <div className="info">
                                <span className="name" title={order.contact.name}>{order.contact.name}</span>
                                <span className="date">{lastMessageTime}</span>
                            </div>
                        </Link>
                    </Badge>
                </li>);
        });

        return (
            <aside className="sidebar">
                <h4>当前对话</h4>
                <ul className="order-list" ref="order-list">
                    {orderList}
                </ul>
            </aside>
        );
    }
}

OrderList.propTypes = {
    orders: PropTypes.array,
};
