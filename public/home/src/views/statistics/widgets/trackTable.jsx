import React from 'react';
import { Table } from 'antd';
import Store from 'network/store';

export default class TrackTable extends React.Component {
    state = {
        dataSource: [],
        total: 0,
        loading: false,
        scrollHeight: 0,
    };

    storeLoaded = (e) => {
        const resp = e.data;
        if (resp.data.length && resp.data[0].track_id === this.trackId) {
            this.setState({
                dataSource: resp.data,
                total: resp.total,
                currentPage: resp.currentPage,
                scrollHeight: resp.data.length * 31 + 1
            });
        }
    }

    beforeLoad = () => {
        this.setState({ loading: true });
    }

    afterLoad = () => {
        this.setState({ loading: false });
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams.page = pagination.current;
        this.load();
    }

    load = () => {
        Store.track.load(this.queryParams);
    }

    componentDidMount() {
        const track_id = this.props.track_id;
        this.trackId = track_id;
        this.queryParams = {};
        this.queryParams._id = track_id;
        this.queryParams.date = this.props.date;

        Store.track.addEventListener('beforeload', this.beforeLoad);
        Store.track.addEventListener('afterload', this.afterLoad);
        Store.track.subscribe(this.storeLoaded);
        this.load();
    }

    componentWillUnmount() {
        Store.track.removeEventListener('beforeload', this.beforeLoad);
        Store.track.removeEventListener('afterload', this.afterLoad);
        Store.track.unsubscribe(this.storeLoaded);
    }

    render() {
        const columns = [
            { title: '访问页面', dataIndex: 'url', width: '30%', render: (value, record) => {
                return <a target="_blank" title={ record.title } style={{ textDecoration: 'none', color: '#666' }} href={ value }>{ record.title.substr(0, 30) + '...' }</a>;
            } },
            { title: '来源', dataIndex: 'referrer', width: '30%', render: (value, record) => {
                if (value && value.match('http')) {
                    return <a target="_blank" style={{ textDecoration: 'none', color: '#666' }} href={ value }>{ value.substr(0, 40) + '...' }</a>;
                } else {
                    return value;
                }
            } },
            { title: '访问时间', dataIndex: 'created_at', width: '20%' },
            { title: '离开时间', dataIndex: 'updated_at', width: '20%' },
        ];
        const pagination = {
            total: this.state.total,
            size: 'small',
            pageSize: 20,
            showTotal: (total) => { return `共${total}条`; },
            current: this.state.currentPage
        };

        return (
            <div>
                <Table
                    size="small"
                    className="visitor-statis-track-table"
                    rowKey={ record => record._id }
                    columns={ columns }
                    pagination={ pagination }
                    dataSource={ this.state.dataSource }
                    loading={ this.state.loading }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.handleTableChange }
                    bordered={ true }
                    />
            </div>
        );
    }
}
