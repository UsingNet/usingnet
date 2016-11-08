import React from 'react';
import { Table, Button } from 'antd';
import Store from 'network/store';
import QueryToolsGroup from '../widgets/queryToolsGroup';
import TrackTable from '../widgets/trackTable';
import SourceDevices from 'views/components/SourceDevices';

export default class StatisticsOfVisitor extends React.Component {
    state = {
        dataSource: [],
        total: 0,
        loading: false,
        scrollHeight: 0,
    };

    storeLoaded = (e) => {
        this.setState({
            dataSource: e.data.data,
            total: e.data.total,
            currentPage: e.data.currentPage
        });
        this.onWindowResize();
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

        const table = document.querySelector('.statistics-of-visitor .ant-table-body');
        const cells = document.querySelectorAll('.statistics-of-visitor tr td .td-source');
        if (table && table.offsetWidth) {
            for (let i = 0; i < cells.length; i++) {
                cells[i].style.width = (table.offsetWidth * 0.25 - 20) + 'px';
            }
        }
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        this.load();
    }

    onQueryParamsChange = (dateRange) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.begin = dateRange[0];
        this.queryParams.end = dateRange[1];
        this.load();
    }

    load = () => {
        Store.statistics.visitor.load(this.queryParams);
    }

    componentDidMount() {
        Store.statistics.visitor.addEventListener('beforeload', this.beforeLoad);
        Store.statistics.visitor.addEventListener('afterload', this.afterLoad);
        Store.statistics.visitor.subscribe(this.storeLoaded);
        Store.statistics.visitor.load();
        window.addEventListener('resize', this.onWindowResize);

    }

    componentDidUpdate() {
        const track_header = document.querySelector('.statistics-of-visitor .ant-table-expand-icon-th');
        track_header.innerText = '访问轨迹';
    }

    componentWillUnmount() {
        Store.statistics.visitor.removeEventListener('beforeload', this.beforeLoad);
        Store.statistics.visitor.removeEventListener('afterload', this.afterLoad);
        Store.statistics.visitor.unsubscribe(this.storeLoaded);
        window.removeEventListener('resize', this.onWindowResize);
    }

    render() {
        const columns = [
            { title: '访客', dataIndex: 'contact', width: '15%', render: (value, record) => {
                return value && value.name ? value.name : `来自${ record.location }的访客`;
            } },
            { title: '来源', dataIndex: 'source', width: '25%', render: (value, record) => {
                if (value) {
                    return (
                        <span className="td-source">
                            <a target="_blank" style={{ textDecoration: 'none', cursor: 'pointer', marginRight: 20 }} href={ value.href } title={ value.name }>{ value.name }</a>
                            <span style={{ display: value.keyword ? 'inline' : 'none' }}>{ `关键词：${ value.keyword }` }</span>
                        </span>
                    );
                } else {
                    return '';
                }

            } },
            { title: '设备', width: '15%', render: (value, record) => {
                const user_agent = (record.contact && record.contact['package'] && record.contact['package']['user_agent'] ) || record.user_agent;
                if (user_agent) {
                    return <SourceDevices userAgent={ user_agent } />
                }
            } },
            { title: '停留时间', dataIndex: 'second', width: '15%' },
            { title: '访问页数', dataIndex: 'times', width: '10%' },
            { title: '时间', dataIndex: 'created_at', width: '15%' }
        ];
        const pagination = {
            total: this.state.total,
            size: 'default',
            pageSize: 20,
            showTotal: (total) => { return `共${total}条`; },
            current: this.state.currentPage
        };

        return (
            <div className="statistics-of-visitor">
                <QueryToolsGroup reload={this.load} onQueryParamsChange={ (dateRange) => this.onQueryParamsChange(dateRange) } />
                <Table
                    size="middle"
                    rowKey={ record => record._id }
                    columns={ columns }
                    pagination={ pagination }
                    dataSource={ this.state.dataSource }
                    loading={ this.state.loading }
                    expandedRowRender={ (record) => {
                        return (
                            <TrackTable track_id={ record.track_id } date={ record.date } />
                        );
                    } }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.handleTableChange }
                    />
            </div>
        );
    }
}
