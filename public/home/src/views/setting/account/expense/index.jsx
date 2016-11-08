import React from 'react';
import { Table } from 'antd';
import Store from 'network/store';

export default class Expense extends React.Component {
    state = {
        dataSource: [],
        total: 0,
        currentPage: 1,
        scrollHeight: 0
    };

    componentDidMount() {
        Store.account.bill.subscribe(this.billLoadedCallback);
        this.onWindowResize(null);
        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        Store.account.bill.unsubscribe(this.billLoadedCallback);
    }

    billLoadedCallback = (e) => {
        const resp = e.data;
        this.setState({
            dataSource: resp.data,
            total: resp.total,
            currentPage: resp.currentPage
        });
    }

    onWindowResize = (e) => {
        const height = document.querySelector('.content-wapper').offsetHeight - 130;
        this.setState({ scrollHeight: height });
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        this.requestData();
    }

    requestData = () => {
        Store.account.bill.load(this.queryParams);
    }

    render() {
        const columns = [
            { title: '账单类型', dataIndex: 'type_text', width: '33.3%' },
            { title: '金额', dataIndex: 'money', render: (value, record) => {
                let color = '';

                if ('-' === value[0]) {
                    color = 'red';
                } else {
                    value = `+${ value }`;
                    color = 'green';
                }

                return (
                    <span style={{ color: color, fontWeight: 'bold', fontSize: 14 }}>{ `${ value } 元` }</span>
                );
            }, width: '33.3%' },
            { title: '时间', dataIndex: 'updated_at', width: '33.3%' },
        ];

        const pagination = {
            total: this.state.total,
            current: this.state.currentPage,
            pageSize: 20,
            size: 'default',
            showTotal: (total) => { return `共${total}条`; },
        };

        return (
            <div>
                <Table
                    size="middle"
                    columns={ columns }
                    scroll={{ y: this.state.scrollHeight }}
                    dataSource={ this.state.dataSource }
                    pagination={ pagination }
                    rowKey={ record => record.id }
                    onChange={ this.handleTableChange } />
            </div>
        );
    }
}
