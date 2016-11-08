import React, { PropTypes } from 'react';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { Modal, Button } from 'antd';
import { textToHtml } from 'modules/face';
import MessageSendItem from './MessageSendItem';
import MessageReceiveItem from './MessageReceiveItem';
import MessageSystemItem from './MessageSystemItem';

export default class Messages extends React.Component {
    state = {
        mailVisible: false,
        mailBody: '',
        mailTitle: '',
    }

    onShowMail = (message) => {
        this.setState({
            mailVisible: true,
            mailTitle: message.package.subject,
            mailBody: message.body,
        });
    }

    createMarkup = (html) => ({
        __html: textToHtml(html.replace(/\n/g, '<br/>')),
    })

    handleClose = () => {
        this.setState({
            mailVisible: false,
        });
    }

    render() {
        const moreNode = (
            <div
                className="more-message"
                onClick={this.props.onLoadMoreMessage}
            >
            更多消息
            </div>
        );

        const moreMessage = this.props.hasMoreMessage ? moreNode : '';

        let messageNodes = '';

        if (this.props.messages) {
            // eslint-disable-next-line array-callback-return, consistent-return
            const sortedMessages = this.props.messages.sort((prev, next) => {
                /* eslint-disable no-underscore-dangle */
                if (prev._id > next._id) {
                    return 1;
                } else if (prev._id < next._id) {
                    return -1;
                }
                /* eslint-enable no-underscore-dangle */

                return 0;
            });

            messageNodes = sortedMessages.map((message, i) => {
                moment.locale('zh-cn');
                let createdAt = '';

                if (typeof message.created_at === 'string') {
                    const createdAtUnix = moment(message.created_at).unix();
                    createdAt = moment(createdAtUnix * 1000).fromNow();
                } else {
                    createdAt = moment(message.created_at * 1000).fromNow();
                }

                if (message.direction === 'SEND' && message.type !== 'SYSTEM') {
                    return (
                        <MessageSendItem
                            key={i}
                            message={message}
                            createdAt={createdAt}
                            createMarkup={this.createMarkup}
                            onOperator={this.props.onOperator}
                            onShowMail={this.onShowMail}
                        />
                    );
                }

                if (message.direction === 'RECEIVE' && message.type !== 'SYSTEM') {
                    return (
                        <MessageReceiveItem
                            key={i}
                            message={message}
                            createdAt={createdAt}
                            createMarkup={this.createMarkup}
                            onShowMail={this.onShowMail}
                        />
                    );
                }

                if (message.type === 'SYSTEM') {
                    return (
                        <MessageSystemItem
                            key={i}
                            message={message}
                            createdAt={createdAt}
                            createMarkup={this.createMarkup}
                        />
                    );
                }

                return (<div key={i}></div>);
            });
        }

        const modalFooter = (
            <Button type="primary" size="large" onClick={this.handleClose}>确定</Button>
        );

        return (
            <div className="messages">
                {moreMessage}
                {messageNodes}

                <Modal
                    title="邮件详细"
                    wrapClassName="mail-modal"
                    visible={this.state.mailVisible}
                    onCancel={this.handleClose}
                    footer={modalFooter}
                >
                    <div className="head">
                        <h4>标题</h4>
                        <p>
                            {this.state.mailTitle}
                        </p>
                    </div>
                    <div className="body">
                        <h4>内容</h4>
                        <p dangerouslySetInnerHTML={this.createMarkup(this.state.mailBody)}></p>
                    </div>
                </Modal>
            </div>
        );
    }
}

Messages.propTypes = {
    messages: PropTypes.array,
    hasMoreMessage: PropTypes.bool,
    onLoadMoreMessage: PropTypes.func,
    onOperator: PropTypes.func,
};
