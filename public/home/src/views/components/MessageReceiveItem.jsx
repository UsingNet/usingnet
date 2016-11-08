import React, { PropTypes } from 'react';

export default class MessageReceiveItem extends React.Component {
    renderReceiveNode = (message, createMarkup) => {
        if (message.type === 'MAIL') {
            return (
                <div className="message-item receive">
                    <div className="hd">
                        <span className="name">
                            {this.props.message.package.contact.name}
                        </span>
                        <span className="date">{this.props.createdAt}</span>
                    </div>

                    <p className="bd">
                        标题：{message.package.subject}
                    </p>
                    <span
                        className="check-mail"
                        onClick={() => this.props.onShowMail(message)}
                    >
                        查看邮件内容
                    </span>
                </div>
            );
        }

        return (
            <div className="message-item receive">
                <div className="hd">
                    <span className="name">
                        {message.package.contact.name}
                    </span>
                    <span className="date">{this.props.createdAt}</span>
                </div>

                <p
                    className="bd"
                    dangerouslySetInnerHTML={createMarkup(message.body)}
                >
                </p>
            </div>
        );
    }

    render() {
        const { createMarkup, message } = this.props;
        const receiveNode = this.renderReceiveNode(message, createMarkup);

        return (
            receiveNode
        );
    }
}

MessageReceiveItem.propTypes = {
    createdAt: PropTypes.string,
    message: PropTypes.object,
    createMarkup: PropTypes.func,
    onShowMail: PropTypes.func,
};
