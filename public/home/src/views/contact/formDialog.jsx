import React from 'react';
import { Modal, Button, Form, Select, Input, Message } from 'antd';
import Store from 'network/store';
const createFrom = Form.create;
const FormItem = Form.Item;
const Option = Select.Option;

class ContactForm extends React.Component {
    state = {
        src: this.props.src
    };

    componentDidMount() {
        this.props.form.setFieldsValue(this.props.formData);
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };
        return (
            <div>
                <img src={ this.props.src } alt="获取头像失败" style={{ width: 100, height: 100, margin: '0 auto', display: 'block', marginBottom: 15, borderRadius: '50%' }} />
                <Form horizontal form={ this.props.form }>

                    <FormItem
                        { ...formItemLayout }
                        label="姓名："
                        hasFeedback>
                        <Input
                            { ...getFieldProps('name', {
                                rules: [
                                    { required: true, min: 2, max: 15, message: '姓名为2-15个字符' }
                                ]
                            }) }
                            type="text"
                            autoComplete="off" />
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label="备注：">
                        <Input
                            { ...getFieldProps('remark', {}) }
                            type="text"
                            autoComplete="off" />
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label="邮箱：">
                        <Input
                            { ...getFieldProps('email', {}) }
                            type="email"
                            autoComplete="off" />
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label="电话：">
                        <Input
                            { ...getFieldProps('phone', {}) }
                            type="phone"
                            autoComplete="off" />
                    </FormItem>

                    <FormItem
                        { ...formItemLayout }
                        label="标签：">
                        <Select
                            tags
                            searchPlaceholder="输入添加"
                            { ...getFieldProps('tags') }>
                            {
                                this.props.tags.map((item, index) => {
                                    return <Option key={ item.name }>{ item.name }</Option>
                                })
                            }
                        </Select>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

ContactForm = createFrom({})(ContactForm);

export default class FormDialog extends React.Component {
    state = {
        modalVisible: true,
        loading: false,
        tags: []
    };

    onOkButtonClick = (e) => {
        e.preventDefault();
        this.refs.contactForm.getForm().validateFields((errors, values) => {
            if (!errors) {
                this.setState({ loading: true });
                const values = this.refs.contactForm.getForm().getFieldsValue();
                for (var i in values) {
                    this.props.formData[i] = values[i]
                }
                Store.contact.save(this.props.formData)
                .then((resp) => {
                    if (resp.success) {
                        Message.success(this.props.formData.id ? '修改成功!' : '添加成功!');
                        this.setState({ modalVisible: false });
                        Store.tag.reload();
                    }
                })
                .always(resp => {
                    this.setState({ loading: false });
                });
            }
        });
    }

    onCancelButtonClick = () => {
        this.setState({ modalVisible: false });
        this.destroyModal();
    }

    tagStoreLoadCallback = (e) => {
        this.setState({
            tags: e.data.data
        });
    }

    destroyModal = () => {
        Store.tag.unsubscribe(this.tagStoreLoadCallback);
        if (this.props.onDestroy) {
            this.props.onDestroy();
        }
    }

    componentDidMount = () => {
        Store.tag.subscribe(this.tagStoreLoadCallback);
    }


    render() {
        return (
            <Modal
                title={ this.props.title }
                okText="提交"
                maskClosable={ false }
                visible={ this.state.modalVisible }
                onCancel={ this.onCancelButtonClick }
                footer={ [
                    <Button key="cancel" type="ghost" size="large" onClick={ this.onCancelButtonClick }>取消</Button>,
                    <Button key="ok" type="primary" size="large" loading={ this.state.loading } onClick={ this.onOkButtonClick }>提交</Button>
                ] }
            >
                <ContactForm formData={ this.props.formData } src={ this.props.src } tags={ this.state.tags } ref="contactForm" />
            </Modal>
        );
    }
}
