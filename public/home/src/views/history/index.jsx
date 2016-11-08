import React from 'react';
import { withRouter } from 'react-router';
import classNames from 'classnames';
import reqwest from 'reqwest';
import { message } from 'antd';
import apiConfig from 'config';
import config from 'network/store_config';
import Store from 'network/store';

import HistoryTable from './historyTable';
import HistoryContent from './historyContent';
import UserInfo from './userInfo';
import DateFilter from 'views/components/DateFilter';
import MemberFilter from 'views/components/MemberFilter';
import ReloadTable from 'views/components/ReloadTable';

import './history.less';

class History extends React.Component {

    state = {
        isHistoryOpen: false,
    }

    componentDidMount() {
        this.onWindowResize(null);
        this.loadOrders();
        Store.member.subscribe(this.onMemberLoaded);
        Store.message.list.subscribe(this.onMessageLoaded, false);
        window.addEventListener('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        this.statsOrderReq.abort();
        window.removeEventListener('resize', this.onWindowResize);
        Store.member.unsubscribe(this.onMemberLoaded);
        Store.message.list.unsubscribe(this.onMessageLoaded);
    }

    onWindowResize = () => {
        const height = document.querySelector('.content-wapper').offsetHeight - 178;
        this.setState({ scrollHeight: height });
    };

    onLoadMoreMessage = () => {
        const order = this.state.order;

        this.setState({
            action: 'more',
        });

        Store.message.list.load({
            order_id: order.id,
            // eslint-disable-next-line no-underscore-dangle
            last_message_id: this.state.messages.length ? this.state.messages[0]._id : 0,
        });
    }

    onQueryParamsChange = (dateRange) => {
        if (!this.queryParams) {
            this.queryParams = {};
        }

        this.queryParams.begin = dateRange[0];
        this.queryParams.end = dateRange[1];
        this.loadOrders();
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

        this.loadOrders();
    }

    onTableChange = (pagination, filters) => {
        if (!this.queryParams) {
            this.queryParams = {};
        }

        this.queryParams.page = pagination.current;

        if (filters.status && filters.status.length > 0) {
            this.queryParams.status = filters.status[0];
        } else if (this.queryParams.status) {
            delete this.queryParams.status;
        }

        this.loadOrders();
    }

    // eslint-disable-next-line consistent-return
    onTableRowClick = (record) => {
        if (this.state.isHistoryOpen && this.state.order && record.id === this.state.order.id) {
            return false;
        }

        this.setState({
            order: record,
            messages: [],
            action: 'row',
            isHistoryOpen: true,
        });

        Store.message.list.load({
            order_id: record.id,
        });
    }

    onContentClose = () => {
        this.setState({
            isHistoryOpen: false,
        });
    }

    onMemberLoaded = (e) => {
        this.setState({
            members: e.data.data,
        });
    }

    onMessageLoaded = (e) => {
        this.setState({
            messages: this.state.messages
                        ? e.data.data.concat(this.state.messages)
                        : e.data.data,
        });
    }

    loadOrders = () => {
        const orderListUrl = config.statistics.order.url;

        this.statsOrderReq = reqwest({
            url: apiConfig.api + orderListUrl,
            data: this.queryParams,
        }).then(resp => {
            if (resp.code === 408 || resp.code === 409) {
                location.href = apiConfig.login;
            }

            if (resp.success) {
                this.setState({
                    orders: resp,
                });
            } else {
                message.warning(resp.msg);
            }
        });
    }

    restoreChat = (event, id) => {
        event.stopPropagation();

        const restoreUrl = config.order.restore.url;

        reqwest({
            url: apiConfig.api + restoreUrl,
            method: 'POST',
            data: {
                id,
            },
        }).then(resp => {
            if (resp.success) {
                reqwest({
                    url: apiConfig.api + '/order',
                }).then(resp => {
                    if (resp.success) {
                        Store.order.all.reload({order_id: id});
                        /*
                        this.props.router.push({
                            pathname: `/chat/${id}`,
                            state: {
                                override: true,
                            },
                        });
                        */
                    }
                });
            } else {
                message.error(resp.msg);
            }
        });
    }

    render() {
        const divClasses = classNames({
            'conversation-history': true,
            open: this.state.isHistoryOpen,
        });

        let messageContainer = '';

        let userInfo = '';

        if (this.state.order) {
            userInfo = (
                <UserInfo contact={this.state.order.contact} />
            );
        }

        messageContainer = (
            <div className={divClasses}>
                <HistoryContent
                    onCloseClick={this.onContentClose}
                    onLoadMoreMessage={this.onLoadMoreMessage}
                    {...this.state}
                />

                {userInfo}
            </div>
        );

        let memberNode = '';
        if (this.state.members) {
            memberNode = (
                <MemberFilter
                    members={this.state.members}
                    onMemberChange={this.onMemberChange}
                />
            );
        }

        return (
            <div className="history-container">
                <div className="table-operation-region">
                    {memberNode}
                    <DateFilter
                        onQueryParamsChange={(dateRange) => this.onQueryParamsChange(dateRange)}
                    />
                    <ReloadTable reload={this.loadOrders} />
                </div>

                <HistoryTable
                    onTableChange={this.onTableChange}
                    onRowClick={this.onTableRowClick}
                    restoreChat={this.restoreChat}
                    {...this.state}
                />

                {messageContainer}
            </div>
        );
    }
}

export default withRouter(History);
