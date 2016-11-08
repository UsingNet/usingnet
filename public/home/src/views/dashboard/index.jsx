import React from 'react';
import OnlineCustomerService from './onlineCustomerService';
import OnlineVisitor from './onlineVisitor';

import './dashboard.less';

export default class Dashboard extends React.Component {

    render() {
        return (
            <div style={{ width: "100%", height: "100%", background: "#F7F7F7", overflowY: 'auto' }}>
                <div style={{ padding: 20 }}>
                    <OnlineCustomerService agentOnlines={this.props.agentOnlines} />
                    <OnlineVisitor history={this.props.router} />
                </div>
            </div>
        );
    }
}
