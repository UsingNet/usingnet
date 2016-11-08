import React from 'react';
import { Card, Row, Col, Icon, Popover } from 'antd';

export default class Square extends React.Component {

    stringFormat = (str='0秒') => {
        let string = str.split('');
        for (let i = 0; i < str.length; i++) {
            const num = Number(str[i]);
            if (isNaN(num)) {
                string[i] = `<i>${str[i]}</i>`;
            }
        }
        return { __html: `<span>${ string.join('') }</span>` };
    }

    render() {
        let data = this.props.data;

        if (!data) {
            data = {
                reply_ratio: 0,
                answer_ratio: 0,
                absolute_ratio: 0,
                relative_ratio: 0
            };
        }

        return (
            <div className="sub-item overview-statistics-firstRow">
                <Row gutter={16}>
                    <Col span="5">
                        <Card>
                            <div className="firstRow-card-content">
                                <div>
                                    <header>对话数</header>
                                    <section>{ data.orders }</section>
                                </div>
                                <div>
                                    <header>
                                        回复率
                                        <Popover placement="right" content={ <p style={{ margin: 10 }}>已接待对话数与对话总数的比值</p> }>
                                            <Icon type="question-circle" />
                                        </Popover>
                                    </header>
                                    <section>{ `${ data.reply_ratio }%` }</section>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span="5">
                        <Card>
                            <div className="firstRow-card-content">
                                <div>
                                    <header>总消息数</header>
                                    <section>{ data.messages }</section>
                                </div>
                                <div>
                                    <header>
                                        问答比
                                        <Popover placement="right" content={ <p style={{ margin: 10 }}>客服发出消息与访客发出消息的比值</p> }>
                                            <Icon type="question-circle" />
                                        </Popover>
                                    </header>
                                    <section>{ `${ data.answer_ratio }%` }</section>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span="9">
                        <Card>
                            <div className="firstRow-card-content">
                                <div>
                                    <header>平均首次响应时间</header>
                                    <section dangerouslySetInnerHTML={ this.stringFormat(data.first_response_avg) }></section>
                                </div>
                                <div>
                                    <header>平均响应时间</header>
                                    <section dangerouslySetInnerHTML={ this.stringFormat(data.response_avg) }></section>
                                </div>
                                <div>
                                    <header>平均会话时长</header>
                                    <section dangerouslySetInnerHTML={ this.stringFormat(data.session_avg) }></section>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span="5">
                        <Card>
                            <div className="firstRow-card-content">
                                <div>
                                    <header>
                                        相对满意度
                                        <Popover placement="right" content={ <p style={{ margin: 10 }}>好评的个数与评价数的比值</p> }>
                                            <Icon type="question-circle" />
                                        </Popover>
                                    </header>
                                    <section>{ `${ data.relative_ratio }%` }</section>
                                </div>
                                <div>
                                    <header>
                                        绝对满意度
                                        <Popover placement="right" content={ <p style={{ margin: 10 }}>好评的个数与总对话数的比值</p> }>
                                            <Icon type="question-circle" />
                                        </Popover>
                                    </header>
                                    <section>{ `${ data.absolute_ratio }%` }</section>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}
