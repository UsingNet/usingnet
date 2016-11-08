import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Card, Button, message, Tag } from 'antd';
import Store from 'network/store';
import reqwest from 'reqwest';

import './appstore.less';

class AppStore extends React.Component {
    state = {
        apps: [],
        allApps: [],
        addModalVisible: false,
    }

    componentDidMount() {
        Store.appstore.current.subscribe(this.onAppsGet);
    }

    componentWillUnmount() {
        Store.appstore.current.unsubscribe(this.onAppsGet);
    }

    onAppsGet = (e) => {
        this.setState({
            apps: e.data.data,
        });
    }

    onRemoveApp = (e, id) => {
        e.preventDefault();
        Store.appstore.current.remove(id);
    }

    onAppSelected = (value) => {
        this.saveId = value;
    }

    confirmAdd = (e, id) => {
        e.preventDefault();
        if (id) {
            const url = '/api/appstore';
            reqwest({
                url,
                data: {
                    id,
                },
                method: 'POST',
            }).then(resp => {
                if (!resp.success || resp.code === 403) {
                    message.error(resp.msg);
                } else {
                    Store.appstore.current.reload();
                }
            });
        }

        this.setState({
            addModalVisible: false,
        });
    }

    cancelAdd = () => {
        this.setState({
            addModalVisible: false,
        });
    }

    render() {
        const appCards = this.state.apps.map(app => {
            if (!app.used) {
                return (
                    <a className="item" href="javascript:;">
                        <Card
                            key={app.id}
                            title={app.name}
                            extra={app.used ? <Tag color="green">已启用</Tag> : <Tag>未启用</Tag>}
                        >
                            <div className="info clearfix">
                                <div className="img" style={{ float: 'left' }}>
                                    <img style={{ width: 80 }} alt="" src={app.img} />
                                </div>

                                <p style={{ margin: '12px 7px', float: 'left' }} >
                                   {app.desc}
                                </p>
                            </div>
                                {
                                    app.used ? (
                                        <div className="action clearfix">
                                            <Button
                                                type="ghost"
                                                size="small"
                                                onClick={(e) => this.onRemoveApp(e, app.id)}
                                            >
                                                停用
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="action clearfix">
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={(e) => this.confirmAdd(e, app.id)}
                                            >
                                                启用
                                            </Button>
                                        </div>
                                    )
                                }
                        </Card>
                    </a>
                );
            }

            return (
                <Link className="item" key={app.id} to={{ pathname: `/appstore/${app.id}`, state: { url: app.url } }}>
                    <Card
                        title={app.name}
                        extra={app.used ? <Tag color="green">已启用</Tag> : <Tag>未启用</Tag>}
                    >
                        <div className="info clearfix">
                            <div className="img" style={{ float: 'left' }}>
                                <img style={{ width: 80 }} alt="" src={app.img} />
                            </div>

                            <p style={{ margin: '12px 7px', float: 'left' }} >
                               {app.desc}
                            </p>
                        </div>
                            {
                                app.used ? (
                                    <div className="action clearfix">
                                        <Button
                                            type="ghost"
                                            size="small"
                                            onClick={(e) => this.onRemoveApp(e, app.id)}
                                        >
                                            停用
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="action clearfix">
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={(e) => this.confirmAdd(e, app.id)}
                                        >
                                            启用
                                        </Button>
                                    </div>
                                )
                            }
                    </Card>
                </Link>
            );
        });

        if (this.props.children) {
            return (
                <div className="view-app">
                    {this.props.children}
                </div>
            );
        }

        return (
            <div className="appstore">
                {appCards}
            </div>
        );
    }
}

AppStore.propTypes = {
    children: PropTypes.any,
};

export default AppStore;
