import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from 'antd';
import Messages from 'views/components/Messages';

export default class HistoryContent extends React.Component {

    componentDidUpdate() {
        if (this.props.action === 'row' && this.props.messages) {
            this.resetScroll();
        }
    }

    resetScroll = () => {
        const dom = ReactDOM.findDOMNode(this.refs.messages);
        const height = dom.scrollHeight;
        dom.scrollTop = height;
        const images = dom.getElementsByTagName('img');
        const count = images.length;
        for (let i = 0; i < count; i++) {
            images[i].onload = () => {
                const newHeight = dom.scrollHeight;
                dom.scrollTop = newHeight;
            };
        }
    };

    render() {
        const hasMoreMessage = this.props.messages ? (this.props.messages.length % 11 === 0) : false;

        return (
            <div className="history-content">
                <div className="head">
                    <div className="close" onClick={this.props.onCloseClick}>
                        <Icon type="cross" />
                    </div>
                    <span className="user-name">
                        {this.props.order ? this.props.order.contact.name : ''}
                    </span>
                </div>
                <div className="content" ref="content">
                    <Messages
                        ref="messages"
                        onLoadMoreMessage={this.props.onLoadMoreMessage}
                        messages={this.props.messages}
                        hasMoreMessage={hasMoreMessage}
                    />
                </div>
            </div>
        );
    }
}

HistoryContent.propTypes = {
    action: PropTypes.string,
    order: PropTypes.object,
    messages: PropTypes.array,
    onLoadMoreMessage: PropTypes.func,
    onCloseClick: PropTypes.func,
};
