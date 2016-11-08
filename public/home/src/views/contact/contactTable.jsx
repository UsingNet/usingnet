import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter } from 'react-router';
import reqwest from 'reqwest';
import apiConfig from 'config';
import config from 'network/store_config';
import { Table, Button, Popconfirm, Message, notification } from 'antd';
import Store from 'network/store';
import FormDialog from './formDialog';

class ContactTable extends React.Component {
    state = {
        total: 0,
        scrollHeight: 0,
        tags: [],
        currentPage: 1,
    };

    onWindowResize = (e) => {
        const height = document.querySelector('.content-wapper').offsetHeight - 178;
        this.setState({ scrollHeight: height });
    };

    storeLoadCallback = (e) => {
        this.setState({
            dataSource: e.data.data,
            total: e.data.total,
            currentPage: e.data.currentPage,
            loading: false,
        });
    }

    beforeLoadCallback = () => {
        this.setState({
            loading: true,
        });
    }

    afterLoad = () => {
        this.setState({ loading: false });
    }

    tagLoadedCallback = (e) => {
        this.setState({ tags: e.data.data });
    }

    componentDidMount() {
        this.onWindowResize(null);
        Store.contact.addEventListener('beforeload', this.beforeLoadCallback);
        Store.contact.addEventListener('afterload', this.afterLoad);
        Store.contact.subscribe(this.storeLoadCallback);
        Store.tag.subscribe(this.tagLoadedCallback);
        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
        Store.contact.unsubscribe(this.storeLoadCallback);
        Store.tag.unsubscribe(this.tagLoadedCallback);
        Store.contact.removeEventListener('beforeload', this.beforeLoadCallback);
        Store.contact.removeEventListener('afterload', this.afterLoad);
    }

    onEditButtonClick = (record) => {
        const container = document.createElement('div');
        const propsConfig = {
            title: '编辑联系人',
            src: record.img && record.img.indexOf('qnssl') !== -1 ? `${record.img}-avatar` : record.img,
            formData: record,
        };
        document.body.appendChild(container);
        const destroyContainer = function () {
            setTimeout(() => {
                document.body.removeChild(container.nextElementSibling);
                document.body.removeChild(container);
            }, 1000);
        };
        ReactDOM.render(<FormDialog { ...propsConfig } onDestroy={ destroyContainer } />, container);
    }

    onConfirmDelete = (record) => {
        Store.contact.remove(record.id)
        .then(resp => {
            if (resp.success) {
                Message.success('删除成功');
            }
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        this.queryParams.tags = JSON.stringify([]);
        if (Object.getOwnPropertyNames(filters).length > 0) {
            const filter = [];

            if (filters.hasOwnProperty('email') && filters.email.length > 0) {
                filter.push('email');
            }
            if (filters.hasOwnProperty('phone') && filters.phone.length > 0) {
                filter.push('phone');
            }
            if (filters.hasOwnProperty('tags') && filters.tags.length > 0) {
                this.queryParams.tags = filters.tags;
            }
            this.queryParams.filter = filter;
        } else {
            delete this.queryParams.filter;
        }
        this.props.requestData(this.queryParams);
    }

    launchChat = (id) => {
        const launchUrl = config.order.launch.url;

        reqwest({
            url: apiConfig.api + launchUrl,
            method: 'POST',
            data: {
                contact_id: id,
            },
        }).then(resp => {
            if (resp.success) {
                Store.order.all.reload({order_id: resp.data.id});
                /*
                reqwest({
                    url: apiConfig.api + '/order',
                }).then(resp => {
                    if (resp.success) {
                        this.props.router.push(`/chat/${id}`);
                    }
                });
                */
            } else {
                Message.error(resp.msg);
            }
        });
    }

    render() {
        const tagFilter = this.state.tags.map((item, index) => {
            return { text: item.name, value: item.name };
        });

        const columns = [
            { title: '姓名', dataIndex: 'name', width: '10%', render: (text, record) => (
                <span><img src={ record.img && record.img.indexOf('qnssl') !== -1 ? `${record.img}-avatar` : record.img }  style={{ width: 26, height: 26, verticalAlign: 'middle', marginRight: 5, borderRadius: '50%' }} />{ record.name }</span>
            ) },
            { title: '微信昵称', dataIndex: 'nickname', width: '%5'},
            { title: '备注', dataIndex: 'remark', width: '10%' },
            { title: '邮箱', dataIndex: 'email', width: '15%', filterMultiple: false, filters: [
                { text: '有邮箱', value: 1 },
            ] },
            { title: '电话', dataIndex: 'phone', width: '15%', filterMultiple: false, filters: [
                { text: '有电话', value: 1 },
            ] },
            { title: '标签', dataIndex: 'tags', render: (text, record) => (
                <span>
                    {
                        record.source_tags.map((item, index) => {
                            return <span key={ index } style={{ background: `#${item.color}`, color: '#fff', padding: '4px 8px', borderRadius: 4, marginRight: 4 }}>{ item.name }</span>;
                        })
                    }
                </span>
            ), filters: tagFilter },
            { title: '操作', width: 155, render: (text, record) => (
                <span className="tableAction">
                    <Button type="ghost" icon="edit" onClick={ () => this.onEditButtonClick(record) } />
                    <span className="ant-divider"></span>
                    <Button type="ghost" icon="message" onClick={() => this.launchChat(record.id)} />
                    <span className="ant-divider"></span>
                    <Popconfirm title="确定要删除这个联系人吗？" onConfirm={ () => this.onConfirmDelete(record) }>
                        <Button type="ghost" icon="delete" />
                    </Popconfirm>
                </span>
            ) },
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
                    rowKey={ record => record.id }
                    columns={ columns }
                    pagination={ pagination }
                    dataSource={ this.state.dataSource }
                    loading={ this.state.loading }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.handleTableChange }
        />
            </div>
        );
    }
}

export default withRouter(ContactTable);
