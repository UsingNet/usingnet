import React from 'react';
import { Card, Form, Input, Button, Alert, Message } from 'antd';
import Store from 'network/store';

const FormItem = Form.Item;

class SmsSignatureForm extends React.Component {
    state = {
        signature: '',
        failMessage: '',
        status: ''
    };

    componentDidMount() {
        Store.sms.signature.subscribe(this.onSmsSignatureLoaded, false);
        Store.sms.signature.load();
    }

    componentWillUnmount() {
        Store.sms.signature.unsubscribe(this.onSmsSignatureLoaded);
    }

    onSmsSignatureLoaded = (e) => {
        const data = e.data.data;
        this.setState({
            signature: data.signature,
            status: data.status,
            failMessage: data.fail_message || ''
        });
    }

    onResetButtonClick = (e) => {
        this.props.form.setFieldsValue(this.state);
    }

    onSubmitButtonClick = (e) => {

        this.props.form.validateFields((errors, values) => {
            if (!errors) {
                const data = this.props.form.getFieldsValue();
                if (data.signature === this.state.signature) {
                    Message.warning('您的短信签名没有修改。');
                    return;
                }
                Store.sms.signature.save(data)
                .then(resp => {
                    if (resp.success) {
                        Message.success('提交成功');
                    }
                });
            }
        });




    }

    render() {
        const { getFieldProps } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 }
        };

        let signatureStatus = '';
        switch (this.state.status) {
            case 'INIT':
                signatureStatus = <Alert message="设置短信签名并审核通过后才能在对话中发送短信。" type="warning" showIcon />;
                break;
            case 'CHECKING':
                signatureStatus = <Alert message="您设置的短信签名正在审核中，很快就可以向客户发送短信了！" type="info" showIcon />;
                break;
            case 'FAIL':
                signatureStatus = <Alert message={ `您设置的短信签名审核没有通过，暂时不能向客户发送短信。没通过原因是：${ this.state.failMessage }` } type="error" showIcon />;
                break;
            case 'SUCCESS':
                signatureStatus = <Alert message="您设置的短信签名审核通过，现在可以在对话中向保存了手机号码的客户发送短信了。" type="success" showIcon />;
                break;
        }

        return (
            <Form horizontal form={ this.props.form } className="sms-signature-form">
                <FormItem label="短信签名" { ...formItemLayout }>
                    <Input
                        { ...getFieldProps('signature', {
                            initialValue: this.state.signature,
                            rules: [
                                { required: true, whitespace: true, message: '短信签名不能为空' }
                            ]
                        }) }
                        type="string" />
                    { signatureStatus }
                </FormItem>
                <FormItem label="注"  { ...formItemLayout }>
                    <span>应工信部要求，所有106号段发送的短信都需要添加短信签名。此短信签名将会出现在发送回访短信的开头处。</span>
                </FormItem>
                <FormItem label=" ">
                    <div>
                        <Button size="default" onClick={ this.onResetButtonClick }>重置</Button>
                        <Button size="default" type="primary" onClick={ this.onSubmitButtonClick }>提交</Button>
                    </div>
                </FormItem>
            </Form>
        );
    }
}

SmsSignatureForm = Form.create({})(SmsSignatureForm);

export default class SmsSignature extends React.Component {

    render() {
        return (
            <Card title="短信签名" className="sms-signature-form-card">
                <SmsSignatureForm />
            </Card>
        );
    }
}
