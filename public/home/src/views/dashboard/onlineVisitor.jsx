import { Table, Card, Button, Message, Popover, Icon } from 'antd';
import { withRouter } from 'react-router'
import React from 'react';
import Store from 'network/store';
import Cookie from 'react-cookie';
import Reqwest from 'reqwest';
import SourceDevices from 'views/components/SourceDevices';
import Moment from 'moment';

class OnlineVisitor extends React.Component {
    state = {
        dataSource: [],
    };

    onWindowResize = () => {
        const table = document.querySelector('.online-visitor-table .ant-table-body');
        const cells = document.querySelectorAll('.online-visitor-table tr td .page-title');
        if (table && table.offsetWidth) {
            for (let i = 0; i < cells.length; i++) {
                cells[i].style.width = (table.offsetWidth * 0.45 - 20) + 'px';
            }
        }
    }

    onlineVisitorLoaded = (e) => {
        const data = e.data.data;


        this.setState({
            dataSource: data
        });
        this.onWindowResize();
    }

    beginChatting = (record) => {
        const me = this;
        if ('online' === Cookie.load('agent_status')) {
            const trackId = record.track_id;
            if (trackId) {
                Reqwest({
                    url: '/api/order/launch',
                    method: 'POST',
                    data: {
                        type: 'IM',
                        track_id: trackId
                    }
                })
                .then((resp) => {
                    if (resp.success) {
                        Store.order.all.reload({order_id: resp.data.id});
                        Store.onlineVisitor.reload();
                    } else {
                        Message.error(resp.msg);
                    }
                })
            } else {
                Message.error('无法获取该访客的联系人ID，我们正在解决这一问题。');
            }
        } else {
            Message.info('离线状态下不能发起对话。');
        }

    }

    componentDidMount() {
        Store.onlineVisitor.subscribe(this.onlineVisitorLoaded);
        window.addEventListener('resize', this.onWindowResize);
        this.onlineVisitorReloadIntervalId = setInterval(() => {
            if ('offline' === Cookie.load('agent_status')) {
                Store.onlineVisitor.reload();
            }
        }, 60000);
    }

    componentWillUnmount() {
        Store.onlineVisitor.unsubscribe(this.onlineVisitorLoaded);
        window.removeEventListener('resize', this.onWindowResize);
        clearInterval(this.onlineReloadIntervalId);
        delete this.onlineReloadIntervalId;
    }

    render() {
        let columns = [
            { title: '客户名称', dataIndex: 'name', width: '15%' },
            { title: '访问页面', dataIndex: 'pages', width: '45%', render: (value, record) => {
                const pageColumns = [
                    { title: '页面', dataIndex: 'title', width: '70%', render: (v, r) => {
                        return (
                            <span className="page-title" style={{ width: 350 }}>
                                <a href={ r.url } target="_blank">{ v }</a>
                            </span>
                        );
                    } },
                    { title: '时间', dataIndex: 'created_at', width: '30%', render: (v, r) => {
                        return Moment(v * 1000).format("YYYY-MM-DD HH:mm:ss");
                    } }
                ];

                const pageContent = (
                    <Table
                        pagination={ false }
                        columns={ pageColumns }
                        dataSource={ value }
                        size="small"
                        scroll={{ y: value.length > 7 ? 216 : 31 * value.length - 1 }} />
                );

                return (
                    <span className="page-title">
                        <a href={ value[0].url } target="_blank">{ value[0].title }</a>
                        <Popover title="访问页面" content={ pageContent } trigger="click">
                            <Icon type="circle-o-up" title="更多" />
                        </Popover>
                    </span>
                );
            } },
            { title: '设备', dataIndex: 'user_agent', width: '15%', render: (value, record) => {
                if (value) {
                    return <SourceDevices userAgent={ value } />
                }
            } },
            // { title: '访问时间', dataIndex: 'created_at', width: '20%', render: (value, record) => {
            //     return Moment(value * 1000).format("YYYY-MM-DD HH:mm:ss");
            // } },
            { title: '状态', dataIndex: 'status', width: '15%', render: (value, record) => {
                const statusMap = {
                    DIALOG: '对话中',
                    UNDIALOG: '访问中'
                };

                const statusColorMap = {
                    DIALOG: '#D2D2D2',
                    UNDIALOG: 'green'
                };
                return <span style={{ color: statusColorMap[value] }}>{ statusMap[value] }</span>;
            } },
            { title: '操作', width: '15%', render: (value, record) => {
                const statusMap = {
                    DIALOG: true,
                    UNDIALOG: false
                };
                return (
                    <Button size="small" disabled={ statusMap[record.status] } onClick={ (e) => { this.beginChatting(record) } }>发起对话</Button>
                );
            } }
        ];

        return (
            <Card title="在线访客" style={{ marginTop: 20 }}>
                <Table
                    className="online-visitor-table"
                    pagination={false}
                    columns={columns}
                    dataSource={ this.state.dataSource }
                    size="middle"
                    rowKey={ record => record.track_id }
                />
            </Card>
        );
    }
}

export default withRouter(OnlineVisitor);
