/**
 * Created by henry on 16-5-25.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Card, Popconfirm, Col, Row, Tag, Icon, Button, message } from 'antd';
import Store from 'network/store';
import './layout.less';
import Editor from './editor';

export default class Member extends React.Component {
    state = {
        members: [],
        me: {},
        currentMember: {},
        editorVisible: false,
    };

    onMembersUpdate = (e) => {
        this.setState({
            members: e.data.data.sort(function (a, b) {
                if (a.role == b.role) {
                    return a.id > b.id ? 1 : -1;
                }
                return a.role == 'MASTER' || b.role == 'MEMBER' ? -1 : 1;
            }),
        });
    };

    onMeUpdate = (e) => {
        this.setState({ me: e.data.data });
    };

    componentDidMount() {
        Store.member.subscribe(this.onMembersUpdate);
        Store.me.subscribe(this.onMeUpdate);
    }

    componentWillUnmount() {
        Store.member.unsubscribe(this.onMembersUpdate);
        Store.me.unsubscribe(this.onMeUpdate);
    }

    addMember = (e) => {
        // var container = document.createElement('div');
        // document.body.appendChild(container);
        // var destroyContainer = function () {
        //     document.body.removeChild(container.nextElementSibling);
        //     document.body.removeChild(container);
        // };
        // ReactDOM.render(<Editor me={this.state.me} data={{ id: null }} onDestory={destroyContainer} />, container);

        this.setState({
            editorVisible: true,
        });
    };

    editMember = (member) => {
        this.setState({
            currentMember: member,
            editorVisible: true,
        });
    }

    deleteMember = (member) => {
        message.info('正在删除...');
        Store.member.remove(member.id).then((resp) => {
            if (resp.success) {
                message.success('删除成功!');
            } else {
                message.error(resp.msg);
            }
        });
    }

    toggleVisible = (visible) => {
        this.setState({
            editorVisible: visible,
        });
    }

    render() {
        const memberNodes = this.state.members.map(m => {
            const roleColors = {
                MASTER: 'red',
                MANAGE: 'yellow',
                MEMBER: 'blue',
            };

            let tagsNode = '';
            let actionNode = '';

            if (m.tags && m.tags.length) {
                tagsNode = m.tags.map((t, i) => (
                    <Tag key={i}>{t.name}</Tag>
                ));
            } else {
                tagsNode = '暂无标签';
            }

            if (m.id !== this.state.me.id) {
                const action = (
                    <div className="action">
                        <Button
                            type="ghost"
                            icon="edit"
                            onClick={() => this.editMember(m)}
                        />

                        <Popconfirm
                            title="确定要删除这个成员吗？"
                            onConfirm={() => this.deleteMember(m)}
                        >
                            <Button type="ghost" icon="delete" />
                        </Popconfirm>
                    </div>
                );

                switch (this.state.me.role) {
                case 'MASTER':
                    if (m.role === 'MASTER') {
                        actionNode = '';
                    } else {
                        actionNode = action;
                    }
                    break;
                case 'MANAGE':
                    if (m.role === 'MASTER' || m.role === 'MANAGE') {
                        actionNode = '';
                    } else {
                        actionNode = action;
                    }
                    break;
                default:
                    break;
                }
            }

            return (
                <Card
                    key={m.id}
                >
                    <h2>
                        {m.name ? m.name : '请填写昵称'}
                        <Tag
                            className="pull-right"
                            color={roleColors[m.role]}
                        >
                            {m.role_name}
                        </Tag>
                    </h2>

                    <div className="info">
                        <img
                            alt={m.name}
                            className="avatar pull-left"
                            src={`${m.img}-avatar`}
                        />

                        <ul className="profile pull-left">
                            <li>
                                <Icon type="phone" />{m.phone || '暂无电话'}
                            </li>
                            <li>
                                <Icon type="mail" />{m.email || '暂无邮箱'}
                            </li>
                            <li>
                                <Icon type="tags" />
                                {tagsNode}
                            </li>
                        </ul>
                    </div>
                    {actionNode}
                </Card>
            );
        });

        return (
            <div className="user-cards">
                {memberNodes}
                <Card key="new">
                    <Button
                        className="new-member"
                        type="ghost"
                        icon="plus-circle"
                        onClick={this.addMember}
                    />
                </Card>
                <Editor
                    visible={this.state.editorVisible}
                    me={this.state.me}
                    data={this.state.currentMember}
                    toggleVisible={this.toggleVisible}
                />
            </div>
        );
    }
}
