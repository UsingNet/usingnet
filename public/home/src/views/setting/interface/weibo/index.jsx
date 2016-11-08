import React from 'react';
import reqwest from 'reqwest';
import { Card, Icon, Message, Popconfirm, Modal, Input, Row, Col } from 'antd';
import store from 'network/store';
import apiConfig from 'config';
import config from 'network/store_config';
import Editor from './editor';
import GeneralEdit from './generalEdit';

const confirm = Modal.confirm;

export default class Weibo extends React.Component {

    state = {
        weibos: [],
        visible: false,
        weibo: {},
        appkey: null,
        generalEditvisible: false,
    };

    componentDidMount() {
        store.setting.weibo.subscribe(this.weibo);

        const settingUrl = config.setting.base.url;

        reqwest({
            url: apiConfig.api + settingUrl,
        }).then(resp => {
            if (resp.code === 408 || resp.code === 409) {
                location.href = apiConfig.login;
            }

            if (resp.success) {
                this.setting(resp);
            }
        });
        // store.setting.base.subscribe(this.setting);
    }

    componentWillUnmount() {
        store.setting.weibo.unsubscribe(this.weibo);
        // store.setting.base.unsubscribe(this.setting);
    }

    onWeiboAuthComplete = (data) => {
        const self = this;
        const content = (
            <div>
                <p>复制输入框内的值</p>

                <Row gutter={8} style={{ margin: '7px 0', lineHeight: '28px' }}>
                    <Col span={5} style={{ textAlign: 'right' }}>URL：</Col>
                    <Col span={19}>
                        <Input defaultValue={data.url} />
                    </Col>
                </Row>
                <Row gutter={8} style={{ lineHeight: '28px' }}>
                    <Col span={5} style={{ textAlign: 'right' }}>APPKEY：</Col>
                    <Col span={19}>
                        <Input defaultValue="3702513602" />
                    </Col>
                </Row>
                <p style={{ margin: '12px 0 7px' }}><a target="_blank" href={data.redirect_uri}>点击链接</a> 打开微博页面，对上面的值进行填写</p>
            </div>
        );

        confirm({
            title: '授权已完成',
            content,
            onOk() {
                if (self.getParameterByName('id')) {
                    self.props.router.push('/setting/weibo');
                }
            },
        });
    }

    onRemove = (id) => {
        store.setting.weibo.remove(id);
    };

    onClose = () => {
        this.setState({
            visible: false,
            generalEditvisible: false,
            weibo: {},
        });
    };

    onSubmit = (data, type) => {
        store.setting.weibo.save(data, { type })
            .then((resp) => {
                if (resp.success) {
                    Message.success('保存成功');
                    store.setting.weibo.reload();
                } else {
                    Message.error(resp.msg);
                }
            });
    };

    onGeneralEdit = (index) => {
        const data = typeof index === 'number' ? this.state.weibos[index] : {};
        this.setState({
            generalEditvisible: true,
            weibo: data,
        });
    }

    onAdvanceEdit = (index) => {
        const data = typeof index === 'number' ? this.state.weibos[index] : {};
        this.onWeiboAuthComplete(data);
        // this.setState({
        //     visible: true,
        //     weibo: data,
        // });
    };

    getParameterByName = (name, url) => {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    setting = (resp) => {
        this.setState({
            appkey: resp.data.weibo.appkey,
        });
    };

    weibo = (e) => {
        this.setState({
            weibos: e.data.data,
            visible: false,
            generalEditvisible: false,
        });

        const weiboId = this.getParameterByName('id');
        if (weiboId) {
            const authWeibo = e.data.data.find(weibo => weibo.id === Number(weiboId));
            this.onWeiboAuthComplete(authWeibo);
        }
    };

    render() {
        return (
            <div className="weibos">
                <div className="header">
                    <h4>微博接入</h4>
                </div>
                <div className="lists">
                    {
                        this.state.weibos.map((weibo, index) => {
                            return (<Card key={weibo.id}>
                                <div className="body">
                                    <div className="hd">
                                        <h4>{weibo.name}</h4>
                                    </div>
                                    <div className="img">
                                        <img role="presentation" src={ weibo.img && weibo.img.indexOf('qnssl') !== -1 ? `${weibo.img}-avatar` : weibo.img } />
                                    </div>
                                    <div className="info">
                                        <div className="action">
                                            <span
                                                style={{ cursor: 'pointer' }}
                                                onClick={this.onGeneralEdit.bind(this, index)}
                                            >
                                                <Icon
                                                    style={{ paddingRight: 3 }}
                                                    type="message"
                                                />
                                            </span>

                                            <span
                                                style={{ cursor: 'pointer' }}
                                                onClick={this.onAdvanceEdit.bind(this, index)}
                                            >
                                                <Icon
                                                    style={{ paddingRight: 3 }}
                                                    type="setting"
                                                />
                                            </span>
                                            <Popconfirm
                                                title="确认取消授权?"
                                                onConfirm={this.onRemove.bind(this, weibo.id)}
                                            >
                                                <Icon type="delete" />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                </div>
                            </Card>);
                        })
                    }
                    <Card className="add">
                        <a target="_blank" href="/api/weibo/auth">
                            <Icon type="plus-circle" />
                        </a>
                    </Card>
                </div>

                <Editor
                    visible={this.state.visible}
                    data={this.state.weibo}
                    submit={this.onSubmit}
                    close={this.onClose}
                    appkey={this.state.appkey}
                />

                <GeneralEdit
                    visible={this.state.generalEditvisible}
                    data={this.state.weibo}
                    submit={this.onSubmit}
                    close={this.onClose}
                />
            </div>
        );
    }
}
