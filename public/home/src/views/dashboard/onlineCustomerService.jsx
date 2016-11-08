import { Table, Card, Button, Message } from 'antd';
import React from 'react';
import Store from 'network/store';
import Reqwest from 'reqwest';
import Cookie from 'react-cookie';

export default class OnlineCustomerService extends React.Component {
    state = {
        dataSource: [],
    };

    updateMe = (e) => {
        this.setState({me:e.data.data});
    };

    componentDidMount() {
        Store.me.subscribe(this.updateMe, true);
        this.onlineReloadIntervalId = setInterval(() => {
            if ('offline' === Cookie.load('agent_status')) {
                Store.online.reload();
            }
        }, 60000);
    }

    componentWillUnmount() {
        Store.me.unsubscribe(this.updateMe);
        clearInterval(this.onlineReloadIntervalId);
        delete this.onlineReloadIntervalId;
    }

    render() {
        let columns = [
            { title: '姓名', dataIndex: 'name', width: '50%' },
            { title: '工单数', dataIndex: 'order_count', width: '50%' },
        ];

        if(this.state.me && this.state.me.role != 'MEMBER'){
            columns[1].width = '35%';
            columns.push({
                title: '操作',
                dataIndex: 'options',
                width: '15%'
            });
        }

        const data = this.props.agentOnlines;

        data.forEach((item, i) => {
            item.key = i;
            if(this.state.me && item.id !== this.state.me.id) {
                item.options = <Button size="small" onClick={()=>{
                     Reqwest({
                        method: 'POST',
                        contentType: 'application/json',
                        url: '/api/online',
                        data: JSON.stringify({action: 'offline', type:'manage', user_id: item.id})
                    })
                    .then((resp) => {
                        if (resp.success) {
                            Message.success('已通知对方下线');
                            setTimeout(()=>{
                                Store.online.reload();
                            },3000);
                        }else{
                            Message.error(resp.msg);
                        }
                    })
                    .fail((resp) => {})
                    .always((resp) => {});
                }}>离线</Button>
            }else{
                item.options = <Button size="small" disabled>离线</Button>
            }
        });


        return (
            <Card title="在线客服">
                <Table
                    pagination={false}
                    bordered={false}
                    columns={columns}
                    dataSource={data}
                    size="middle"
                    rowKey={ record => record.id }
                />
            </Card>
        );
    }
}
