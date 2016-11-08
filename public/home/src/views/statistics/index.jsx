import React from 'react';
import { Tabs, Icon } from 'antd';

import Service from './tabs/service';
import Evaluation from './tabs/evaluation';
import Visitor from './tabs/visitor';
import OverView from './tabs/overview';
import { withRouter } from 'react-router';
import './statistics.less';

const TabPane = Tabs.TabPane;

class Statistics extends React.Component {

    state = {};

    componentDidMount() {
        this.setState({
            current: this.props.params.type || 'overview',
        });
    }

    handleClick = (e) => {
        this.setState({
            current: e,
        });
        this.props.router.push('/statistics/' + e);
    };

    render() {
        return (
            <Tabs style={{ padding: 20 }}  activeKey={ this.state.current } onChange={ this.handleClick }>
                <TabPane tab={<span><Icon type="book" />总览</span>} key="overview">
                    <OverView />
                </TabPane>
                <TabPane tab={<span><Icon type="user" />客服</span>} key="service">
                    <Service />
                </TabPane>
                <TabPane tab={<span><Icon type="like" />评价</span>} key="evaluation">
                    <Evaluation />
                </TabPane>
                <TabPane tab={<span><Icon type='team' />访客</span>} key='visitor'>
                    <Visitor />
                </TabPane>
                {
                    // <TabPane tab={<span><Icon type='customerservice' />对话</span>} key='3'></TabPane>
                }
            </Tabs>
        );
    }
}

export default withRouter(Statistics);
