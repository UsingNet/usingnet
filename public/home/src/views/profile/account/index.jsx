/**
 * Created by henry on 16-5-25.
 */
import React from 'react';
import { Form, Input, Button, Checkbox, Radio, Tooltip, Icon, Upload } from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import Store from 'network/store';
import { Message, Switch } from 'antd';

class Account extends React.Component {

    state = {
        change_password: false,
    };

    handleSubmit = (e) => {
        e.preventDefault();
        var values = this.props.form.getFieldsValue();
        values['img'] = this.state.img;
        Store.me.save(values).then((resp) => {
            if (resp.success) {
                Message.success('保存成功');
            } else {
                Message.error(resp.msg);
            }
        });
    };

    handleUpload = (e) => {
        if (e.fileList && e.fileList.length > 1) {
            e.fileList.shift();
        }
        if (e.file.status == 'done') {
            this.setState({ 'img': e.file.response.data });
        }
    };

    onDataChange = (e) => {
        this.setState(e.data.data);
        this.props.form.setFieldsValue(e.data.data);
    };

    componentDidMount() {
        Store.me.subscribe(this.onDataChange);
    }

    componentWillUnmount() {
        Store.me.unsubscribe(this.onDataChange);
    }


    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        return (
            <div className="account">
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="昵称："
        >
                    <p className="ant-form-text" id="userName" name="name">{this.state.name}</p>
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="邮箱："
        >
                    <p className="ant-form-text" id="userName" name="email">{this.state.email || '暂未填写'}</p>
                </FormItem>

                <FormItem
                    {...formItemLayout}
                    label="手机号码："
        >
                    <p className="ant-form-text" id="userName" name="phone">{this.state.phone || '暂未填写'}</p>
                </FormItem>

                <FormItem label="头像：" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                    <Upload name="file" action="/api/upload" listType="picture-card" onChange={this.handleUpload}
                        accept="image/*"
                        fileList={this.state.img ? [{
                            uid: -1,
                            name: 'img',
                            status: 'done',
                            url: this.state.img,
                            thumbUrl: `${this.state.img}-avatar`,
                        }] : []}
                    >
                        <Icon type="plus" />
                        <div className="ant-upload-text">点击上传</div>
                    </Upload>
                </FormItem>

                <FormItem label="修改密码：" labelCol={{ span: 4 }} wrapperCol={{ span: 6 }}>
                    <Switch defaultChecked={false} onChange={(e) => {this.setState({ 'change_password': e });}} />
                </FormItem>

                <div style={{ height: (this.state.change_password ? 160 : 0), overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)' }}>
                    <FormItem
                        {...formItemLayout}
                        label="旧密码："
        >
                        <Input type="password" {...getFieldProps('password')} placeholder="若不修改请留空" />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="新密码："
        >
                        <Input type="password" {...getFieldProps('newpassword')} placeholder="若不修改请留空" />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="确认新密码："
        >
                        <Input type="password" {...getFieldProps('newpassword_confirmation')} placeholder="若不修改请留空" />
                    </FormItem>
                </div>

                <FormItem wrapperCol={{ span: 16, offset: 4 }} style={{ marginTop: 24 }}>
                    <Button type="primary" htmlType="submit">确定</Button>
                </FormItem>
            </Form>
            </div>
        );
    }
}

Account = Form.create()(Account);

export default Account;

/*

export default class Account extends React.Component {
    state = {};

    render() {
        return <AccountForm />;
    }
}
*/
