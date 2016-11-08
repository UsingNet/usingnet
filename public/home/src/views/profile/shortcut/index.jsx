import React from 'react';
import { Button, Tabs, Modal, Input, Message, Icon, Popconfirm } from 'antd';
const TabPane = Tabs.TabPane;
import store from 'network/store';

export default class Shortcut extends React.Component {
    state = {
        personals: [],
        commons: [],
        visible: false,
        inputValue: '',
        type: 'PERSONAL',
        currentId: null,
        me: {},
        addBtnClass: '',
    };

    reply = (e) => {
        const data = e.data.data;
        if (data.length) {
            if (data[0].type === 'COMMON') {
                this.setState({
                    commons: e.data.data,
                });
            } else {
                this.setState({
                    personals: e.data.data,
                });
            }
        } else {
            this.setState({
                commons: [],
                personals: [],
            });
        }
    };

    me = (e) => {
        this.setState({
            me: e.data.data,
        });
    };

    componentDidMount() {
        store.setting.quickReply.subscribe(this.reply, false);
        store.setting.quickReply.load({ type: 'PERSONAL' });
        store.me.subscribe(this.me);
    }

    componentWillUnmount()
    {
        store.setting.quickReply.unsubscribe(this.reply);
        store.me.unsubscribe(this.me);
    }

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    onSubmit = () => {
        const data = {
            content: this.state.inputValue,
            type: this.state.type,
        };

        if (this.state.currentId) {
            data['id'] = this.state.currentId;
        }

        store.setting.quickReply.save(data)
            .then((resp) => {
                if (resp.success) {
                    this.setState({
                        visible: false,
                    });
                    Message.success('保存成功');
                } else {
                    Message.error(resp.msg);
                }
            });
    };

    onChange = (e) => {
        this.setState({
            inputValue: e.target.value,
        });
    };

    onSwitch = (type) => {
        store.setting.quickReply.load({ type: type });
        let className = '';
        if (type === 'COMMON' && this.state.me.role === 'MEMBER') {
            className = 'hide';
        }
        this.setState({
            type: type,
            addBtnClass: className,
        });
    };

    onDelete = (id) => {
        store.setting.quickReply.remove(id);
    };

    onEdit = (id) => {
        let inputValue = '';
        if (typeof id === 'number') {
            const type = this.state.type.toLowerCase() + 's';
            this.state[type].forEach((reply) => {
                if (reply.id == id) {
                    inputValue = reply.content;
                }
            });
        } else {
            id = null;
        }

        this.setState({
            visible: true,
            inputValue: inputValue,
            currentId: id,
        });
    };

    render() {
        let add = <Button onClick={this.onEdit} className={this.state.addBtnClass}>添加</Button>;
        return (
            <div className="shortcut">
                <h4>快捷回复</h4>
                <div className="main">
                    <Tabs defaultActiveKey={this.state.type} tabBarExtraContent={ add } onChange={this.onSwitch}>
                        <TabPane tab="自定义" key="PERSONAL">
                            <ul className="replies">
                                {
                                    this.state.personals.map((reply) => {
                                        return (<li key={reply.id}>
                                            {reply.content}
                                                <div className="action">
                                                    <Icon type="edit" onClick={this.onEdit.bind(this, reply.id)} />
                                                    <Popconfirm title="确认删除" onConfirm={this.onDelete.bind(this, reply.id)}>
                                                        <Icon type="delete" />
                                                    </Popconfirm>
                                                </div>
                                            </li>);
                                    })
                                }
                            </ul>
                        </TabPane>
                        <TabPane tab="通用" key="COMMON">
                            <ul className="replies">
                                {
                                    this.state.commons.map((reply) => {
                                        return (<li key={reply.id}>
                                            {reply.content}
                                            <div className="action">
                                                <Icon type="edit" onClick={this.onEdit.bind(this, reply.id)} />
                                                <Popconfirm title="确认删除" onConfirm={this.onDelete.bind(this, reply.id)}>
                                                    <Icon type="delete" />
                                                </Popconfirm>
                                            </div>
                                        </li>);
                                    })
                                }
                            </ul>
                        </TabPane>
                    </Tabs>
                </div>

                <Modal title="快捷回复" visible={ this.state.visible } okText="提交" onCancel={this.onClose} onOk={this.onSubmit}>
                    <Input type="textarea" placeholder="回复内容..." style={{ height: 90 }} value={this.state.inputValue} onChange={this.onChange} />
                </Modal>
            </div>
        );
    }
}
