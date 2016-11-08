import React from 'react';
import SendBox from './sendBox';
import MessageBox from './messageBox';

export default class ChatBox extends React.Component
{
    render() {
        const order = this.props.order;
        return (
            <div className="chat-box">
                <MessageBox
                    setSyncState={this.props.setSyncState}
                    orders={this.props.orders}
                    me={this.props.me}
                    socket={this.props.socket}
                    order={order}
                    closeOrder={this.props.closeOrder}
                    transferOrder={this.props.transferOrder}
                    saveOrder={this.props.saveOrder}
                />
                <SendBox
                    ref="sendBox"
                    order={order}
                    updateOrder={this.props.updateOrder}
                    setting={this.props.setting}
                    saveOrder={this.props.saveOrder}
                    voipStatus={this.props.voipStatus}
                />
            </div>
        );
    }
}
