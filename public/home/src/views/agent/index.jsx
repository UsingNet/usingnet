/**
 * Created by henry on 16-5-25.
 */
import React from 'react';
import { Card, Icon, Tabs } from 'antd';
import Member from './member';
import Group from './group';
const TabPane = Tabs.TabPane;
import { withRouter } from 'react-router';

class Agent extends React.Component {
    state = { current: 'all' };


    componentDidMount() {
        this.setState({
            current: this.props.params.type || 'all',
        });
    }


    handleClick = (e) => {
        this.setState({
            current: e,
        });
        this.props.router.push('/agent/' + e);
    };

    render() {
        return (<div id="agent">
          <Tabs style={{ padding: 20 }} activeKey={this.state.current} onChange={this.handleClick}>
            <TabPane tab="所有人" key="all">
              <Member />
            </TabPane>
            <TabPane tab="分组" key="group">
              <Group />
            </TabPane>
          </Tabs>
        </div>);
    }
}

export default withRouter(Agent);
