/**
 * Created by henry on 16-5-25.
 */
import React from 'react';
import { Modal, Form, Button, Input, Checkbox, Radio, Tooltip, Icon, Select, Message } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const RadioButton = Radio.Button;
import Store from 'network/store';

class MemberFormClass extends React.Component {

    state = {
        tags: [],
    }

    handleSubmit = (e) => {
        e.preventDefault();
    };

    tags = [];

    onTagChange = (e) => {
        this.setState({
            tags: e.data.data,
        });
        // const tags = e.data.data;
        // if (this.tags.length === 0) {
        //     tags.forEach(tag => {
        //         this.tags.push(<Option key={tag.name}>{tag.name}</Option>);
        //     })
        // }
    };

    componentWillUnmount() {
        Store.tag.unsubscribe(this.onTagChange);
    }

    componentDidMount() {
        const data = this.props.data;
        // if (data.tags) {
        //     data.tags = data.tags.map(tag => tag.name)
        // }
        let currentTags = [];
        if (data.tags) {
            currentTags = data.tags.map(tag => tag.name);
        }

        const formData = Object.assign({}, data, { tags: currentTags });

        this.props.form.setFieldsValue(formData);
        Store.tag.subscribe(this.onTagChange);
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        const tagOptions = this.state.tags.map((t, i) => (
            <Option key={i} value={t.name}>{t.name}</Option>
        ));

        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="昵称："
                >
                    <Input type="text" {...getFieldProps('name')} placeholder="请输入昵称" />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="密码："
                >
                    <Input type="password" {...getFieldProps('password')} placeholder="不修改密码请留空" />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="邮箱："
                >
                    <Input type="text" {...getFieldProps('email')} placeholder="请输入邮箱地址" />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="手机号码："
                >
                    <Input type="text" {...getFieldProps('phone')} placeholder="请输入手机号码" />
                </FormItem>

                {(()=>{
                    if(this.props.me.id == this.props.data.id){
                        return <FormItem
                            {...formItemLayout}
                            label="角色：">
                            <RadioGroup {...getFieldProps('role')}>
                                <RadioButton value={this.props.me.role}>{this.props.me.role_name}</RadioButton>
                            </RadioGroup>
                        </FormItem>
                    }else{
                        return <FormItem
                            {...formItemLayout}
                            label="角色：">
                            <RadioGroup {...getFieldProps('role')}>
                                <RadioButton disabled={true}  value="MASTER">超级管理员</RadioButton>
                                <RadioButton disabled={this.props.me.role != 'MASTER'}  value="MANAGE">管理员</RadioButton>
                                <RadioButton value="MEMBER">客服</RadioButton>
                            </RadioGroup>
                        </FormItem>
                    }
                })()}

                <FormItem
                    {...formItemLayout}
                    label="标签："
                >
                    <Select
                        {...getFieldProps('tags')}
                        tags
                        multiple
                        style={{ width: '100%' }}
                        placeholder="请选择标签"
                    >
                        {tagOptions}
                    </Select>
                </FormItem>

            </Form>
        );
    }
}

let MemberForm = Form.create()(MemberFormClass);



export default class Editor extends React.Component {
    state = {
        loading: false,
        visible: true,
    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.setState({loading: true});
        var values = this.refs.memberForm.getForm().getFieldsValue();
        values['id'] = this.props.data ? this.props.data.id : null;

        Store.member.save(values).then((resp)=>{
            if(resp.success){
                this.props.toggleVisible(false);
                this.setState({ loading: false });
                Message.success('保存成功');
                if(this.props.onDestory){
                    this.props.onDestory();
                }
            }else{
                this.setState({loading: false});
                Message.error(resp.msg);
            }
        });
    };

    handleCancel = () => {
        this.props.toggleVisible(false);
        if(this.props.onDestory){
            this.props.onDestory();
        }
    };

    render() {
        return (
            <Modal
                ref="modal"
                visible={this.props.visible}
                title="客服成员"
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={[
                    <Button
                        key="back"
                        type="ghost"
                        size="large"
                        onClick={this.handleCancel}
                    >
                        返 回
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        size="large"
                        loading={this.state.loading}
                        onClick={this.handleOk}
                    >
                        提 交
                    </Button>,
                ]}
            >
                <MemberForm
                    me={this.props.me}
                    ref="memberForm"
                    data={this.props.data}
                />
            </Modal>
        );
    }
}
