import React, { PropTypes } from 'react';
import { Form, Input, Modal } from 'antd';
const FormItem = Form.Item;

class EditorForm extends React.Component {

    state = {
        data: {},
        tipsClassName: 'hide',
    }

    onShowTips = () => {
        if (this.props.form.getFieldsValue().weibo_id) {
            this.setState({
                tipsClassName: '',
            });
        }
    }

    onOk = () => {
        this.props.form.validateFields((errors) => {
            if (!errors) {
                const data = this.props.form.getFieldsValue();
                data.id = this.props.data.id;
                this.props.submit(data, 'advance');
            }
        });
    };

    render() {
        const { getFieldProps } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        // validator
        const nameProps = getFieldProps('name', {
            validate: [{
                rules: [
                    { required: true, message: '服务器地址不能为空' },
                ],
                trigger: 'onSubmit',
            }],
        });

        const idProps = getFieldProps('weibo_id', {
            validate: [{
                rules: [
                    { required: true, message: '微博ID不能为空' },
                ],
                trigger: 'onSubmit',
            }],
        });

        const tokenProps = getFieldProps('access_token', {
            validate: [{
                rules: [
                    { required: true, message: 'access_token 不能为空' },
                ],
                trigger: 'onSubmit',
            }],
        });

        return (
            <Modal
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.props.close}
                title="微博接入"
            >
                <Form horizontal onSubmit={this.handleSubmit} form={this.props.form}>
                    <FormItem
                        {...formItemLayout}
                        hasFeedback
                        label="微博名称："
                    >
                        <Input
                            {...nameProps}
                            type="text"
                            placeholder="请输入微博名称"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        hasFeedback
                        label="微博ID："
                    >
                        <Input
                            {...idProps}
                            type="text"
                            placeholder="请输入微博ID"
                            onBlur={this.onShowTips}
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        hasFeedback
                        label="access_token："
                    >
                        <Input
                            {...tokenProps}
                            type="text"
                            placeholder="请填写 access_token"
                        />
                    </FormItem>
                </Form>
                <div>
                    <div className="setting-weibo-tips">
                        <ul>
                            <li>「登录微博 -> 粉丝服务 -> 开发者中心」设置以下参数:<br />
                                &nbsp;&nbsp;URL: {this.props.data.url}<br />
                                &nbsp;&nbsp;APPKEY: {this.props.appkey}<br />
                            </li>
                            <li>请将设置成功后取得的 access_token 填入表单</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        );
    }
}

EditorForm.propTypes = {
    visible: PropTypes.bool.isRequired,
    submit: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    appkey: PropTypes.string,
    data: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
};

function mapPropsToFields(props) {
    const weiboData = props.data;
    return {
        name: {
            value: weiboData.name,
        },
        weibo_id: {
            value: weiboData.weibo_id,
        },
        access_token: {
            value: weiboData.access_token,
        },
    };
}

const Editor = Form.create({
    mapPropsToFields,
})(EditorForm);

export default Editor;
