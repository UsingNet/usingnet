import React, { PropTypes } from 'react';

export default class MessageSendItem extends React.Component {
    renderSendNode = (message, createMarkup, info) => {
        if (info.revocable) {
            if (!message.package.undo && message.type === 'IM') {
                return (
                    <span className="message-inner">
                        <p
                            className="bd"
                            dangerouslySetInnerHTML={createMarkup(message.body)}
                        >
                        </p>
                        <span
                            className="undo-action"
                            onClick={(event) => info.onOperator('undo', message._id, event)}
                        >
                            <a href="#">撤销</a>
                        </span>
                    </span>
                );
            }

            if (message.type === 'MAIL') {
                return (
                    <span className="message-inner">
                        <p className="bd">
                            标题：{message.package.subject}
                        </p>
                        <span
                            className="check-mail"
                            onClick={() => this.props.onShowMail(message)}
                        >
                            查看邮件内容
                        </span>
                    </span>
                );
            }

            return (
                <span className="message-inner">
                    <p
                        className={message.package.undo ? 'undo bd' : 'bd'}
                        dangerouslySetInnerHTML={createMarkup(message.body)}
                    >
                    </p>
                </span>
            );
        }

        if (!message.package.undo && message.type === 'IM') {
            return (
                <span className="message-inner">
                    <p
                        className="bd"
                        dangerouslySetInnerHTML={createMarkup(message.body)}
                    >
                    </p>
                </span>
            );
        }

        if (message.type === 'MAIL') {
            return (
                <span className="message-inner">
                    <p className="bd">
                        标题：{message.package.subject}
                    </p>
                    <span
                        className="check-mail"
                        onClick={() => this.props.onShowMail(message)}
                    >
                        查看邮件内容
                    </span>
                </span>
            );
        }

        return (
            <span className="message-inner">
                <p
                    className={message.package.undo ? 'undo bd' : 'bd'}
                    dangerouslySetInnerHTML={createMarkup(message.body)}
                >
                </p>
            </span>
        );
    }

    render() {
        let sendNode = '';
        const { createdAt, createMarkup, message, onOperator } = this.props;

        if (onOperator) {
            sendNode = this.renderSendNode(
                message, createMarkup,
                { onOperator, revocable: true }
            );
        } else {
            sendNode = this.renderSendNode(message, createMarkup, { revocable: false });
        }

        return (
            <div className="message-item send">
                <div className="hd">
                    <span className="date">{createdAt}</span>
                    <span className="name">{message.package.agent.name}</span>
                </div>
                {sendNode}
            </div>
        );
    }
}

MessageSendItem.propTypes = {
    createdAt: PropTypes.string,
    createMarkup: PropTypes.func,
    message: PropTypes.object,
    onOperator: PropTypes.func,
    onShowMail: PropTypes.func,
};
