import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import { Icon } from 'antd';
import async from 'async';
import io from 'socket.io-client';
import cookie from 'react-cookie';
import OrderList from './orderList';
import ChatBox from './chatBox';
import InformationPanel from './informationPanel';
import FastReply from './fastReply';
import store from 'network/store';
import { withRouter } from 'react-router';
import './chat.less';

class Chat extends React.Component
{
    state = {
        orders: [],
        currentOrder: {},
    };

    componentDidUpdate()
    {
        const self = this;
        const orders = this.props.orders;
        if (orders.length) {
            let id = this.props.params.id;
            if (!id) {
                id = cookie.load('current_order_id');
                if (!id) {
                    id = orders[0].id;
                }
            }
            cookie.save('current_order_id', id, { path: '/' });

            if (!this.props.params.id) {
                this.props.router.push('/chat/' + id);
            }

            const exists = orders.filter((order) => {return order.id == id;});
            if (!exists.length) {
                this.props.router.push('/chat/' + orders[0].id);
            }

            // const currentOrder = exists[0];
            // if (currentOrder) {
            //     currentOrder.unread = 0;
            //     currentOrder.messages.forEach((message) => {
            //         if (!message.package.read && message.direction === 'RECEIVE') {
            //             this.props.socket.send({ action: 'read', _id: message._id, message_id: Math.random() });
            //         }
            //     });
            // }
        }
    }

    updateContact = (e) => {
        const currentOrder = this.props.orders.find((order => order.id === Number(this.props.params.id)));
        const currentContact = currentOrder.contact;
        const changedField = e.target.name;
        currentContact[changedField] = e.target.value;
    }

    updateOrder = (newOrder) => {
        const currentOrder = this.props.orders.find((order => order.id === Number(newOrder.id)));
        if (currentOrder && newOrder) {
            currentOrder.type = newOrder.type;
        }
    }

    switchChat = (order) => {
        order.unread = 0;
        order.messages.forEach((msg) => {
            if (!msg.package.read && msg.direction === 'RECEIVE') {
                this.props.socket.send({ action: 'read', _id: msg._id, message_id: Math.random() });
                msg.package.read = true;
            }
        });
    }

    onCloseFastReply = () => {
        const chatBox = this.refs.chatBox;
        if (chatBox) {
            chatBox.refs.sendBox.onShowReply();
        }
    }

    onFastReplyClick = (content) => {
        const orders = this.props.orders;
        let currentOrder = {};
        orders.forEach((order) => {
            if (order.id == this.props.params.id) {
                currentOrder = order;
            }
        });

        currentOrder.defaultMessage = content;

        const chatBox = this.refs.chatBox;
        if (chatBox) {
            chatBox.refs.sendBox.setState({
                defaultMessage: content
            });
            document.querySelector('.send-box textarea').focus();
        }
    }

    setNow(order) {
    }

    render() {
        const orders = this.props.orders;
        let currentOrder = {};
        orders.forEach((order) => {
            if (order.id == this.props.params.id) {
                currentOrder = order;
            }
        });


        let chatBox = (<div id="chat"><div className="empty-box"> <Icon type="inbox" /><div>没有对话</div></div></div>);
        if (this.props.agentStatus == 'offline') {
            chatBox = (<div id="chat"><div className="empty-box"> <Icon type="inbox" /><div>已离线</div></div></div>);
        }


        if (orders.length && currentOrder.id && currentOrder.id == this.props.params.id) {
            const contact = currentOrder.contact;
            chatBox = (
                <div className="chat-wapper">
                    <OrderList switchChat={this.switchChat} orders={orders} order={currentOrder} />
                    <div className="main-tab">
                        <ChatBox
                            ref="chatBox"
                            socket={this.props.socket}
                            order={currentOrder}
                            updateOrder={this.updateOrder}
                            closeOrder={this.props.closeOrder}
                            transferOrder={this.props.transferOrder}
                            voipStatus={this.props.voipStatus}
                            setting={this.props.setting}
                            saveOrder={this.props.saveOrder}
                            me={this.props.me}
                            orders={this.props.orders}
                            setSyncState={this.props.setSyncState}
                        />
                    <FastReply
                        onCloseFastReply={ () => {this.onCloseFastReply()} }
                        onFastReplyClick={ (content) => {this.onFastReplyClick(content)} } />
                        <InformationPanel
                            contact={contact}
                            order={currentOrder}
                            saveOrder={this.props.saveOrder}
                            saveContact={this.props.saveContact}
                            updateContact={this.updateContact}
                            setting={this.props.setting}
                        />
                    </div>
                </div>
            );
        }



        return (
            <div id="chat">
                {chatBox}
            </div>
        );
    }
}

export default withRouter(Chat);
