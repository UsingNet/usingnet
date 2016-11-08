import React, { PropTypes } from 'react';

export default class MessageSystemItem extends React.Component {
    render() {
        return (
            <div className="message-item system">
                <div className="hd">
                    <span className="date">{this.props.createdAt}</span>
                </div>
                <div
                    className="bd"
                    dangerouslySetInnerHTML={this.props.createMarkup(this.props.message.body)}
                >
                </div>
            </div>
        );
    }
}

MessageSystemItem.propTypes = {
    message: PropTypes.object,
    createdAt: PropTypes.string,
    createMarkup: PropTypes.func,
};
