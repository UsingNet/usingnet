import React, { PropTypes } from 'react';
import { Table, Button } from 'antd';
import SourceDevices from 'views/components/SourceDevices';

export default class HistoryTable extends React.Component {
    render() {
        const columns = [
            {
                title: '客户',
                dataIndex: 'contact.name',
                width: '20%',
                render: (text, record) => (
                    record.contact
                    ? (<span>
                        <img
                            alt={record.contact.name}
                            className="contact-avatar"
                            src={ record.contact.img && record.contact.img.indexOf('qnssl') !== -1 ? `${record.contact.img}-avatar` : record.contact.img }
                        />
                        {record.contact.name}
                    </span>)
                    : ''
                ),
            }, {
                title: '客服',
                width: '15%',
                dataIndex: 'user.name',
                render: (text, record) => (
                    record.user ? <span>{record.user.name}</span> : ''
                ),
            }, {
                title: '会话开始时间',
                dataIndex: 'created_at',
                width: '20%',
                render: (text, record) => (
                    <span>{record.created_at}</span>
                ),
            }, {
                title: '来源终端',
                dataIndex: 'contact.package.user_agent',
                width: '20%',
                render: (text, record) => {
                    let devices = '';

                    if (
                        record.contact
                        && record.contact.package
                        && record.contact.package.user_agent
                    ) {
                        let userAgent = record.contact.package.user_agent;

                        devices = (
                            <SourceDevices userAgent={userAgent} />
                        );
                    }

                    return (devices);
                },
            }, {
                title: '用户IP地址',
                dataIndex: 'contact.ip',
                width: '15%',
                render: (text, record) => (
                    record.contact ? <span
                    style={{ display: 'block', padding: '13px 0' }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onSelect={(e) => {
                      e.stopPropagation();
                    }}>{record.contact.ip}</span> : ''
                ),
            }, {
                title: '状态',
                dataIndex: 'status',
                width: '5%',
                render: (text, record) => {
                    switch (record.status) {
                    case 'OPEN':
                        return (<span>进行中</span>);
                    case 'SLEEP':
                        return (<span>已休眠</span>);
                    case 'CLOSED':
                        return (<span>已关闭</span>);
                    default:
                        return (<span></span>);
                    }
                },
                filters: [{
                    text: '进行中',
                    value: 'open',
                }, {
                    text: '已休眠',
                    value: 'sleep',
                }, {
                    text: '已关闭',
                    value: 'closed',
                }],
                filterMultiple: false,
            }, {
                title: '操作',
                width: '5%',
                render: (text, record) => {
                    switch (record.status) {
                    case 'SLEEP':
                        return (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(event) => this.props.restoreChat(event, record.id)}
                            >
                                发起对话
                            </Button>
                        );
                    case 'CLOSED':
                        return (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(event) => this.props.restoreChat(event, record.id)}
                            >
                                发起对话
                            </Button>
                        );
                    default:
                        return (<span></span>);
                    }
                },
            },
        ];

        const pagination = {
            total: this.props.orders ? this.props.orders.total : 0,
            current: this.props.orders ? this.props.orders.currentPage : 1,
            pageSize: this.props.orders ? this.props.orders.perPage : 20,
            size: 'default',
            showTotal: (total) => (`共${total}条`),
        };

        return (
            <div>
                <Table
                    onRowClick={this.props.onRowClick}
                    rowKey={record => record.id}
                    size="middle"
                    columns={columns}
                    dataSource={this.props.orders ? this.props.orders.data : []}
                    pagination={pagination}
                    scroll={{ y: this.props.scrollHeight }}
                    onChange={this.props.onTableChange}
                />
            </div>
        );
    }
}

HistoryTable.propTypes = {
    orders: PropTypes.object,
    onRowClick: PropTypes.func,
    onTableChange: PropTypes.func,
    scrollHeight: PropTypes.number,
};
