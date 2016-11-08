/**
 * Created by henry on 16-6-8.
 */
import React from 'react';
import { Popconfirm, Card, Select, Button, Message } from 'antd';
const Option = Select.Option;
import Store from 'network/store';
import { Input } from 'antd';
import './group.less';

export default class Group extends React.Component {
    state = { groups: [], members: [] };

    members = [];

    onGroupsUpdate = (e) => {
        this.setState({ groups: e.data.data });
    };

    onMembersUpdate = (e) => {
        this.members = [];
        var memberList = e.data.data;
        for (var i in memberList) {
            this.members.push(<Option key={memberList[i].id}>{memberList[i].name}</Option>);
        }
        this.setState({ members: memberList });
    };

    componentDidMount() {
        Store.user.group.subscribe(this.onGroupsUpdate);
        Store.member.subscribe(this.onMembersUpdate);
    }

    componentWillUnmount() {
        Store.user.group.unsubscribe(this.onGroupsUpdate);
        Store.member.unsubscribe(this.onMembersUpdate);
    }

    addNewGroup = (e) => {
        var new_groups = this.state.groups;
        new_groups.push({ users: [], name: '', id: 'random-' + Math.random() });
        this.setState({ groups: new_groups });
    };

    removeGroup = (group) => {
        if (Number.isInteger(group.id) || group.id.match(/^\d+$/)) {
            Store.user.group.remove(group.id);
        } else {
            var new_groups = this.state.groups;
            for (var i in new_groups) {
                if (new_groups[i].id == group.id) {
                    new_groups.splice(i, 1);
                    break;
                }
            }
            this.setState({ groups: new_groups });
        }
    };

    saveGroup = (const_group) => {
        var group = JSON.parse(JSON.stringify(const_group));
        if (!Number.isInteger(group.id) && !group.id.match(/^\d+$/)) {
            group.id = null;
        }
        for (var i in group.users) {
            if (typeof(group.users[i]) == 'object') {
                group.users[i] = group.users[i].id;
            }
        }
        Store.user.group.save(group).then((reps) => {
            if (reps.success) {
                Message.success('保存成功');
            }
        });
    };

    render() {
        return (<div className="group-cards">
            {this.state.groups.map((group) => {
                var default_users = [];
                for (var i in group.users) {
                    default_users.push((group.users[i].id).toString());
                }

                var updateGroupUsers = (e) => {
                    var users = [];
                    for (var j in e) {
                        for (var k in this.state.members) {
                            if (this.state.members[k].id == e[j]) {
                                users.push(this.state.members[k]);
                            }
                        }
                    }
                    var new_groups = this.state.groups;
                    for (var i in new_groups) {
                        if (new_groups[i].id == group.id) {
                            new_groups[i]['users'] = users;
                            break;
                        }
                    }
                    this.setState({ groups: new_groups });
                };

                var updateGroupName = (e) => {
                    var new_groups = this.state.groups;
                    for (var i in new_groups) {
                        if (new_groups[i].id == group.id) {
                            new_groups[i]['name'] = e.target.value;
                            break;
                        }
                    }
                    this.setState({ groups: new_groups });
                };

                return (<Card key={group.id}>
                    <Input className="title" placeholder="分组名称" defaultValue={group.name} onChange={updateGroupName} />
                    <Popconfirm title="确定要删除这个分组吗？" onConfirm={(e) => {this.removeGroup(group);}}>
                        <Button className="handle pull-right" shape="circle" icon="delete" />
                    </Popconfirm>
                    <Button className="handle pull-right" shape="circle" icon="save"
                        onClick={(e) => {this.saveGroup(group);}}
                />
                    <Select value={default_users} className="members" placeholder="请选择客服" multiple
                        onChange={updateGroupUsers}
                >{this.members}</Select>
                </Card>);
            })}
            <div className="add-group">
                <Button shape="circle" icon="plus" size="large" onClick={this.addNewGroup} />
            </div>
        </div>);
    }
}
