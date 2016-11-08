import React from 'react';
import { Table, Modal, Button } from 'antd';
import Moment from 'moment';
import Store from 'network/store';
import Socket from 'network/socket';
import './notice.less';

export default class Notice extends React.Component {
    state = {
        dataSource: [],
        showNoticeDetail: false,
        noticeContent: '',
    };


    componentDidMount() {

        Socket.addEventListener('noticeOnClick', this.noticeOnClick);
        window.addEventListener('resize', this.countTdWidth);

        Store.notice.subscribe(this.afterNoticeLoaded);
        this.onNoticeNotificationClick();
        this.countTdWidth();
    }

    componentWillUnmount() {
        Store.notice.unsubscribe(this.afterNoticeLoaded);
        Socket.removeEventListener('noticeOnClick', this.noticeOnClick);
        window.removeEventListener('resize', this.countTdWidth);
    }

    onNoticeNotificationClick = () => {
        const record = this.props.location.state;
        const pathname = this.props.location.pathname;
        if (record && '/notice' === pathname) {
            this.onRowClick(record);
            this.props.router.push('/notice');
        }
    }

    afterNoticeLoaded = (e) => {
        const data = e.data;
        this.setState({
            dataSource: data.data,
            currentPage: data.currentPage,
            total: data.total
        });

    }

    noticeOnClick = (e) => {
        this.onRowClick(e.notice);
    }

    countTdWidth = () => {
        const table = document.querySelector('.notice-table .ant-table-body');
        const cells = document.querySelectorAll('.notice-table tr td p');
        if (table && table.offsetWidth) {
            for (let i = 0; i < cells.length; i++) {
                cells[i].style.width = (table.offsetWidth * 0.7 - 20) + 'px';
            }
        }

        const height = document.querySelector('.content-wapper').offsetHeight - 142;
        this.setState({ scrollHeight: height });
    }


    readNotice = (id) => {
        Store.notice.save({
            id: id
        });
    }

    onRowClick = (record, index) => {
        this.setState({
            noticeContent: record.body,
            showNoticeDetail: true,
        });
        this.readNotice(record._id);
    }

    hideNoticeDetail = () => {
        this.setState({
            noticeContent: '',
            showNoticeDetail: false,
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        Store.notice.load(this.queryParams);
    }

    render() {
        const table = document.querySelector('.notice-table .ant-table-body');

        const width = table ? table.offsetWidth * 0.7 - 20 : '70%';

        const columns = [
            { title: '通知内容', dataIndex: 'body', render: (value, record) => {
                const reg = new RegExp('<[^<]*>', 'gi');
                return <p style={{ width: width }}>{ value.replace(reg, '') }</p>;
            } },
            { title: '时间', dataIndex: 'created_at', width: '20%', render: (value, record) => {
                return Moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
            } },
            { title: '状态', dataIndex: 'package', width: '10%', render: (value, record) => {
                return value.read ? '已读' : '未读';
            } },
        ];

        const pagination = {
            total: this.state.total,
            current: this.state.currentPage,
            pageSize: 20,
            size: 'default',
            showTotal: (total) => { return `共${total}条`; },
        };


        return (
            <div className="notice-table" style={{ padding: 20 }}>
                <Table
                    size="middle"
                    rowKey={ record => record._id }
                    columns={ columns }
                    dataSource={ this.state.dataSource }
                    pagination={ pagination }
                    onRowClick={ this.onRowClick }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.handleTableChange }
                    />
                <Modal
                    visible={ this.state.showNoticeDetail }
                    onCancel={ this.hideNoticeDetail }
                    footer={ <Button type="primary" size="large" onClick={ this.hideNoticeDetail }>知道了</Button> }
                    closable={ false }
                    wrapClassName="notice-content-modal"
                    >
                    <div className="notice-content-title">
                        <i></i>
                        <span>系统通知</span>
                    </div>
                    <div className="notice-content-body" dangerouslySetInnerHTML={{ __html: this.state.noticeContent }}></div>
                </Modal>
            </div>
        );
    }
}
