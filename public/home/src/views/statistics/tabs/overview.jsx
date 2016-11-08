import React from 'react';
import Store from 'network/store';
import { Card, Col, Row } from 'antd';
import Square from '../chartWidgets/square';
import HistogramNative from '../chartWidgets/histogramNative';
import HorizontalHistogram from '../chartWidgets/horizontalHistogram';
import SimplePie from '../chartWidgets/simplePie';
import QueryToolsGroup from '../widgets/queryToolsGroup';

export default class OverView extends React.Component {

    state = {
        containerHeight: 0
    };

    componentDidMount() {
        Store.statistics.headline.subscribe(this.onStatsHeadlineLoaded, false);
        Store.statistics.headline.load();
        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
    }

    componentWillUnmount() {
        Store.statistics.headline.unsubscribe(this.onStatsHeadlineLoaded);
        window.removeEventListener('resize', this.onWindowResize);
    }

    onWindowResize = () => {
        const height = document.querySelector('.content-wapper').offsetHeight - 92;
        this.setState({
            containerHeight: height
        });
    }

    onStatsHeadlineLoaded = (e) => {
        const data = e.data;

        // 首次响应时间
        const firstResponsesTime = {
            yAxis: ['<15s', '15s-30s', '30s-45s', '45s-1m', '>1m', '>1h', '>1天'],
            percent: data.first_responses.map((e, i) => {
                return parseFloat(e);
            }),
            color: '#3FBF88'
        };


        // 响应时间
        const responsesTime = {
            yAxis: ['<15s', '15s-30s', '30s-45s', '45s-1m', '>1m', '>1h', '>1天'],
            percent: data.responses.map((e, i) => {
                return parseFloat(e);
            }),
            color: '#62A8EA'
        };

        // 会话时长
        const chatTime = {
            yAxis: ['<2m', '2m-4m', '4m-6m', '6m-8m', '>8m', '>1h', '>1天'],
            percent: data.sessions.map((e, i) => {
                return parseFloat(e);
            }),
            color: '#926DDE'
        };


        // 客户来源
        const sourcePie = {
            data: [],
            legend: ['网站', '微信', '邮件', '电话', '微博', '电话']
        };
        const sourceMap = {
            im: '网站',
            wechat: '微信',
            mail: '邮件',
            voip: '电话',
            weibo: '微博',
            voice: '电话'
        };
        for (let i in data.from) {
            sourcePie.data.push({
                name: sourceMap[i] || i,
                value: data.from[i]
            });
        }

        // 满意度
        const evaluatePie = {
            data: [],
            legend: ['好评', '差评', '中评', '未评价']
        };
        const evaluateMap = {
            good: '好评',
            bad: '差评',
            general: '中评',
            unevaluated: '未评价'
        };
        for (let j in data.evaluate) {
            evaluatePie.data.push({
                name: evaluateMap[j] || j,
                value: data.evaluate[j]
            });
        }

        // 咨询分类
        const categoryPie = {
            data: [],
            legend: Object.keys(data.categories)
        };
        for (let k in data.categories) {
            categoryPie.data.push({
                name: k,
                value: data.categories[k]
            });
        }

        const orderHistogram = {
            title: '对话数',
            xAxis: data.key,
            yAxis: [data.order.replied, data.order.unreplied],
            legend: ['已接待对话数', '未接待对话数'],
            color: ['#D48265', '#D0CECE'],
            className: 'sub-item overview-statistics-secondRow'
        };

        const messageHistogram = {
            title: '消息数',
            xAxis: data.key,
            yAxis: [data.message.agent, data.message.contact],
            legend: ['客服发出消息', '访客发出消息'],
            color: ['#91C7AE', '#D0CECE'],
            className: 'sub-item overview-statistics-thirdRow'
        };


        this.setState({
            headline: data,
            firstResponsesTime: firstResponsesTime,
            responsesTime: responsesTime,
            chatTime: chatTime,
            sourcePie: sourcePie,
            evaluatePie: evaluatePie,
            categoryPie: categoryPie,
            orderHistogram: orderHistogram,
            messageHistogram: messageHistogram
        });
    }


    onQueryParamsChange = (dateRange) => {
        const condition = {
            begin: dateRange[0],
            end: dateRange[1]
        };

        Store.statistics.headline.load(condition);
    }

    render() {

        return (
            <div style={{ height: this.state.containerHeight }} className="overview-statistics">

                <QueryToolsGroup onQueryParamsChange={ (dateRange) => this.onQueryParamsChange(dateRange) } />

                <Square data={ this.state.headline } />

                <HistogramNative data={ this.state.orderHistogram } chartsId="orderHistogram" />

                <HistogramNative data={ this.state.messageHistogram } chartsId="messageHistogram" />

                <div className="sub-item overview-statistics-fourthRow">
                    <Row gutter={16}>
                        <Col span="8">
                            <header>首次响应时间</header>
                            <HorizontalHistogram data={ this.state.firstResponsesTime } chartsId="firstResponsesTime" />
                        </Col>
                        <Col span="8">
                            <header>响应时间</header>
                            <HorizontalHistogram data={ this.state.responsesTime } chartsId="responsesTime" />
                        </Col>
                        <Col span="8">
                            <header>会话时长</header>
                            <HorizontalHistogram data={ this.state.chatTime } chartsId="chatTime" />
                        </Col>
                    </Row>
                </div>

                <div className="sub-item overview-statistics-fifthRow">
                    <Row gutter={16}>
                        <Col span="12">
                            <header>客户来源</header>
                            <SimplePie data={ this.state.sourcePie } chartsId="sourcePie" />
                        </Col>
                        <Col span="12">
                            <header>满意度</header>
                            <SimplePie data={ this.state.evaluatePie } chartsId="evaluatePie" />
                        </Col>
                    </Row>
                </div>

                <div className="sub-item overview-statistics-sixthRow">
                    <header>咨询分类</header>
                    <SimplePie data={ this.state.categoryPie } chartsId="categoryPie" />
                </div>

            </div>
        );
    }
}
