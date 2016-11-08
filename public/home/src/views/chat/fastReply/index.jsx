import React from 'react';
import { Icon, Tabs } from 'antd';
import { Link } from 'react-router';
import Store from 'network/store';

const TabPane = Tabs.TabPane;

export default class FastReply extends React.Component {
    state = {
        personalFastReply: '',
        commonFastReply: ''
    };


    componentDidMount() {
        Store.setting.quickReplyPersonal.subscribe(this.onPersonalFastReplyLoaded);
        Store.setting.quickReplyCommon.subscribe(this.onCommonFastReplyLoaded);

    }

    componentWillUnmount() {

        Store.setting.quickReplyPersonal.unsubscribe(this.onPersonalFastReplyLoaded);
        Store.setting.quickReplyCommon.unsubscribe(this.onCommonFastReplyLoaded);
    }

    onPersonalFastReplyLoaded = (e) => {
        const data = e.data.data;

        this.setState({
            personalFastReply: this.renderFastReply(data)
        });

    }

    onCommonFastReplyLoaded = (e) => {
        let data = e.data.data;


        this.setState({
            commonFastReply: this.renderFastReply(data)
        });
    }

    renderFastReply = (data) => {
        const fastReply = data.map((e, i) => {
            return (
                <li key={ i } title={ e.content } onClick={ () => {this.onFastReplyClick(e.content)} }>
                    #<span>{ ` ${e.shortcut}` }</span>
                    <span>{ e.content }</span>
                </li>
            );
        });

        if (!fastReply.length) {
            fastReply.push(
                <div key="0" style={{ textAlign: 'center' }}>
                    <Icon type="frown" /><span key="0">暂无数据</span>
                </div>
            );
        }

        return (
            <ul>{ fastReply }</ul>
        );

    }

    onFastReplyClick = (content) => {
        this.props.onFastReplyClick(content)
    }


    render() {

        return (
            <div className="chatBox-fastReply">
                <header>
                    <span>快捷回复</span>
                    <div>
                        <Link to="/profile/fastReply">
                            <Icon type="setting" />
                        </Link>
                        <Icon type="cross" onClick={ () => {this.props.onCloseFastReply()} }/>
                    </div>
                </header>
                <Tabs className="chatBox-fastReply-tabContent">
                    <TabPane tab="自定义" key="1">{ this.state.personalFastReply }</TabPane>
                    <TabPane tab="通用" key="2">{ this.state.commonFastReply }</TabPane>
                </Tabs>
            </div>
        );
    }
}
