import React from 'react';
import { Table, Modal, Button } from 'antd';
import Store from 'network/store';
import QueryToolsGroup from '../widgets/queryToolsGroup';
import MemberFilter from '../../components/MemberFilter';

export default class StatisticsOfEvaluation extends React.Component {
    state = {
        dataSource: [],
        total: 0,
        loading: false,
        scrollHeight: 0,
        showNoticeDetail: false,
        noticeContent: '',
        members: []
    };

    storeLoaded = (e) => {
        this.setState({
            dataSource: e.data.data,
            total: e.data.total,
            currentPage: e.data.currentPage
        });
        this.countTdWidth();
    }

    onMemberLoaded = (e) => {
        this.setState({
            members: e.data.data,
        });
    }

    beforeLoad = () => {
        this.setState({ loading: true });
    }

    afterLoad = () => {
        this.setState({ loading: false });
    }

    onWindowResize = () => {
        const height = document.querySelector('.content-wapper').offsetHeight - 248;
        this.setState({ scrollHeight: height });
        this.countTdWidth();
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        if (Object.getOwnPropertyNames(filters).length > 0) {
            const filter = [];
            if (filters.hasOwnProperty('level_text') && filters.level_text.length > 0) {
                this.queryParams.level = filters.level_text;
            } else {
                delete this.queryParams.level;
            }
            if (filters.hasOwnProperty('content') && filters.content.length > 0) {
                filter.push('content');
            }
            this.queryParams.filter = filter;
        } else {
            delete this.queryParams.filter;
            delete this.queryParams.level;
        }
        this.load();
    }

    onQueryParamsChange = (dateRange) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.begin = dateRange[0];
        this.queryParams.end = dateRange[1];
        this.load();
    }

    load = () => {
        Store.statistics.evaluation.load(this.queryParams);
    }

    componentDidMount() {
        Store.statistics.evaluation.addEventListener('beforeload', this.beforeLoad);
        Store.statistics.evaluation.addEventListener('afterload', this.afterLoad);
        Store.member.subscribe(this.onMemberLoaded);
        Store.statistics.evaluation.subscribe(this.storeLoaded);
        Store.statistics.evaluation.load();
        window.addEventListener('resize', this.onWindowResize);
        this.onWindowResize();
    }

    componentWillUnmount() {
        Store.statistics.evaluation.removeEventListener('beforeload', this.beforeLoad);
        Store.statistics.evaluation.removeEventListener('afterload', this.afterLoad);
        Store.member.unsubscribe(this.onMemberLoaded);
        Store.statistics.evaluation.unsubscribe(this.storeLoaded);
        window.removeEventListener('resize', this.onWindowResize);
    }

    onMemberChange = (value) => {
        if (!this.queryParams) {
            this.queryParams = {};
        }
        const v = Number(value);
        if (v !== 0) {
            this.queryParams.user_id = v;
        } else if (v === 0) {
            if (this.queryParams.user_id) {
                delete this.queryParams.user_id;
            }
        }
        this.load();
    }

    countTdWidth = () => {
         const table = document.querySelector('.evaluation-table .ant-table-body');
         const cells = document.querySelectorAll('.evaluation-table tr td p');
         if (table && table.offsetWidth) {
             for (let i = 0; i < cells.length; i++) {
                 cells[i].style.width = (table.offsetWidth * 0.2 - 20) + 'px';
             }
         }
     }

     hideNoticeDetail = () => {
         this.setState({
             showNoticeDetail: false
         });
     }

     onRowClick = (record, index) => {
         this.setState({
             noticeContent: record.content ? record.content : '没有填写评价内容',
             showNoticeDetail: true,
         });
     }

    render() {
        const columns = [
            { title: '客服', dataIndex: 'user.name', width: '20%' },
            { title: '客户', dataIndex: 'contact.name', width: '20%' },
            { title: '评价', dataIndex: 'level_text', width: '20%', filters: [
                { text: '好评', value: 'GOOD' },
                { text: '中评', value: "GENERAL" },
                { text: '差评', value: "BAD" },
            ] },
            { title: '评价内容', dataIndex: 'content', width: '20%', render: (value) => {
                return <p>{ value }</p>;
            }, filters: [ { text: '有内容的评价', value: 'content' } ] },
            { title: '时间', dataIndex: 'created_at', width: '20%' },
        ];
        const pagination = {
            total: this.state.total,
            size: 'default',
            pageSize: 20,
            showTotal: (total) => { return `共${total}条`; },
            current: this.state.currentPage
        };

        let memberNode = '';
        if (this.state.members) {
            memberNode = (
                <MemberFilter
                    members={ this.state.members }
                    onMemberChange={ this.onMemberChange }
                />
            );
        }

        return (
            <div className="evaluation-table">
                { memberNode }
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
                    onRowClick={ this.onRowClick }
                    />
                    <Modal
                        visible={ this.state.showNoticeDetail }
                        onCancel={ this.hideNoticeDetail }
                        footer={ <Button type="primary" size="large" onClick={ this.hideNoticeDetail }>关闭</Button> }
                        closable={ false }
                        wrapClassName="notice-content-modal"
                        >
                        <div className="notice-content-title">
                            <i></i>
                            <span>评价内容</span>
                        </div>
                        <div className="notice-content-body" dangerouslySetInnerHTML={{ __html: this.state.noticeContent }}></div>
                    </Modal>
            </div>
        );
    }
}
