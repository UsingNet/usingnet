import React from 'react';
import { Card, Tag, Icon, Popconfirm, Message, Modal, Button } from 'antd';
import Editor from './editor';
import GeneralEdit from './generalEdit';
import store from 'network/store';

const confirm = Modal.confirm;

export default class Wechat extends React.Component {
    state = {
        wechats: [],
        data: {},
        visible: false,
        generalEditvisible: false,
    }

    componentDidMount() {
        store.setting.wechat.subscribe(this.wechat);
    }

    componentWillUnmount() {
        store.setting.wechat.unsubscribe(this.wechat);
    }

    onRemove = (id) => {
        store.setting.wechat.remove(id);
    };

    onClose = () => {
        this.setState({
            visible: false,
            generalEditvisible: false,
            data: {},
        });
    };

    onSubmit = (data, type) => {
        store.setting.wechat.save(data, { type })
            .then((resp) => {
                if (resp.success) {
                    this.setState({
                        visible: false,
                        generalEditvisible: false,
                    });
                    Message.success('保存成功');
                    store.setting.wechat.reload();
                } else {
                    Message.error(resp.msg);
                }
            });
    };

    onGeneralEdit = (index) => {
        const data = this.state.wechats[index];
        this.setState({
            generalEditvisible: true,
            data,
        });
    }

    onAdvanceEdit = (index) => {
        const data = this.state.wechats[index];
        this.setState({
            visible: true,
            data,
        });
    };

    onAuth = () => {
        confirm({
            title: '认证完成？',
            okText: '已完成',
            onOk() {
                store.setting.wechat.reload();
            },
        });
    }

    updateData = (newData) => {
        this.setState({
            data: newData,
        });
    }

    wechat = (e) => {
        this.setState({
            wechats: e.data.data,
        });
    };

    render() {
        return (
            <div className="wechats">
                <div className="header">
                    <h4>微信接入</h4>
                </div>
                <div className="lists">
                    {
                        this.state.wechats.map((wechat, index) => {
                            return (<Card key={wechat.id}>
                                <div className="body">
                                    <div className="hd">
                                        <h4>{wechat.nick_name}</h4>
                                    </div>
                                    <div className="img">
                                        <img src={ wechat.head_img && wechat.head_img.indexOf('qnssl') !== -1 ? `${wechat.head_img}-avatar` : wechat.head_img } />
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
                                                onConfirm={this.onRemove.bind(this, wechat.id)}
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
                        <a
                            onClick={this.onAuth}
                            href="http://wx.usingnet.com/api/wechat/auth"
                            target="_blank"
                        >
                            <Icon type="plus-circle" />
                        </a>
                    </Card>
                </div>
                <div className="desc">
                    <ul>
                        <li>你的公众号必须是认证过的微信订阅号或服务号，否则无法正常回复顾客对话</li>
                        <li>公众号授权后, 之前的功能将失效, 如需恢复请<a target="_blank" href="https://www.usingnet.com/docs/wechat">参考文档</a></li>
                    </ul>
                </div>
                <Editor
                    visible={this.state.visible}
                    data={this.state.data}
                    submit={this.onSubmit}
                    close={this.onClose}
                    updateData={this.updateData}
                />

                <GeneralEdit
                    visible={this.state.generalEditvisible}
                    data={this.state.data}
                    submit={this.onSubmit}
                    close={this.onClose}
                />
            </div>
        );
    }
}
