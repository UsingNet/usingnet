import React from 'react';
import { Table } from 'antd';
import Store from 'network/store';
import QueryToolsGroup from '../widgets/queryToolsGroup';
import ServiceOverView from '../widgets/serviceOverview';

export default class StatisticsOfService extends React.Component {
    state = {
        dataSource: [],
        total: 0,
        loading: false,
        scrollHeight: 0,
        expandedRowKeys: []
    };

    storeLoaded = (e) => {
        this.setState({
            dataSource: e.data.data,
            total: e.data.total,
            currentPage: e.data.currentPage
        });
    }

    beforeLoad = () => {
        this.setState({ loading: true });
    }

    afterLoad = () => {
        this.setState({ loading: false });
    }

    onWindowResize = () => {
        const height = document.querySelector('.content-wapper').offsetHeight - 218;
        this.setState({ scrollHeight: height });
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        const sortMap = {
            ascend: 'ASC',
            descend: 'DESC'
        };
        if (sorter.hasOwnProperty('field')) {
            this.queryParams.sort = JSON.stringify([{ 'property': sorter.field, 'direction': sortMap[sorter.order] }]);
        } else {
            this.queryParams.sort = JSON.stringify([]);
        }
        this.load();
    }

    onQueryParamsChange = (dateRange) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.begin = dateRange[0];
        this.queryParams.end = dateRange[1];
        this.load();
        this.setState({
            dateRange: dateRange,
            dateRangeChangeTimes: ++this.dateRangeChangeTimes
        });
    }

    load = () => {
        Store.statistics.agent.load(this.queryParams);
    }

    componentDidMount() {
        Store.statistics.agent.addEventListener('beforeload', this.beforeLoad);
        Store.statistics.agent.addEventListener('afterload', this.afterLoad);
        Store.statistics.agent.subscribe(this.storeLoaded);
        Store.statistics.agent.load();
        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
        this.dateRangeChangeTimes = 0;
    }

    componentWillUnmount() {
        Store.statistics.agent.removeEventListener('beforeload', this.beforeLoad);
        Store.statistics.agent.removeEventListener('afterload', this.afterLoad);
        Store.statistics.agent.unsubscribe(this.storeLoaded);
        window.removeEventListener('resize', this.onWindowResize);
    }

    render() {
        const columns = [
            { title: '客服', dataIndex: 'name', width: '15%' },
            { title: '工单数', dataIndex: 'order_count', width: '20%', sorter: true },
            { title: '消息数', dataIndex: 'message_count', width: '20%', sorter: true },
            { title: '对话时长', dataIndex: 'time', width: '40%', sorter: true },
        ];
        const pagination = {
            total: this.state.total,
            size: 'default',
            pageSize: 20,
            showTotal: (total) => { return `共${total}条`; },
            current: this.state.currentPage
        };

        return (
            <div>
                <QueryToolsGroup reload={this.load} onQueryParamsChange={ (dateRange) => this.onQueryParamsChange(dateRange) } />
                <Table
                    size="middle"
                    rowKey={ record => record.id }
                    columns={ columns }
                    pagination={ pagination }
                    dataSource={ this.state.dataSource }
                    loading={ this.state.loading }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.handleTableChange }
                    onExpand={ (expanded, record) => {
                        if (expanded) {
                            this.setState({
                                expandedRowKeys: [record.id]
                            });
                        } else {
                            this.setState({
                                expandedRowKeys: []
                            });
                        }
                    } }
                    expandedRowKeys={ this.state.expandedRowKeys }
                    expandedRowRender={ (record, expandedRowKey) => {
                        return (
                            <ServiceOverView user_id={ record.id } dateRange={ this.state.dateRange } dateRangeChangeTimes={ this.state.dateRangeChangeTimes } />
                        );
                    } }
                    />
            </div>
        );
    }
}
