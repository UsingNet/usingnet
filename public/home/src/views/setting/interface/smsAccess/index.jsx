import React from 'react';

import SmsSignature from './smsSignature';
import SmsTemplate from './smsTemplate';
import './smsAccess.less';

export default class SmsAccess extends React.Component {

    render() {
        return (
            <div className="sms-setting">
                <SmsSignature />
                <SmsTemplate />
            </div>
        );
    }
}
