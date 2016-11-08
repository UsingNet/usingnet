import React, { PropTypes } from 'react';
import { Form, Input, Modal, Select, Radio } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class WechatEditForm extends React.Component {

    state = {
        mode: 'EXPRESS',
        modeClassName: 'hide',
        id: 0,
    }

    // componentDidUpdate() {
    //     if (this.props.data.id !== this.state.id) {
    //         this.props.form.setFieldsValue(this.props.data);
    //         this.setState({
    //             id: this.props.data.id,
    //         });
    //     }
    // }

    // onModeChange = (val) => {
    //     if (val === 'ENCRYPTION') {
    //         this.setState({
    //             modeClassName: '',
    //             mode: val,
    //         });
    //     } else {
    //         this.setState({
    //             modeClassName: 'hide',
    //             mode: val,
    //         });
    //     }
    // }

    onOk = () => {
        this.props.form.validateFields((errors) => {
            if (!!errors) {
                return;
            }
        });
        const data = this.props.form.getFieldsValue();
        data.id = this.props.data.id;
        // data.mode = this.state.mode;
        this.props.submit(data, 'advance');
    }

    render() {
        const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        // const data = this.props.data;
        // let option = '';
        // if (data.id) {
        //     option = (
        //         <Select
        //             {...modeProps}
        //             defaultValue="ENCRYPTION"
        //             style={{ width: 100 }}
        //         >
        //             <Option value="EXPRESS">明文</Option>
        //             <Option value="ENCRYPTION">加密</Option>
        //         </Select>
        //     );
        // }

        // validator
        const urlProps = getFieldProps('url', {
            validate: [{
                rules: [
                    { required: true, message: '服务器地址不能为空' },
                    { type: 'url', message: '请输入正确的 URL' },
                ],
                trigger: 'onBlur',
            }],
        });

        const tokenProps = getFieldProps('token', {
            validate: [{
                rules: [
                    { required: true, message: 'token 不能为空' },
                ],
                trigger: 'onBlur',
            }],
        });

        const modeProps = getFieldProps('mode');

        const aesKeyProps = getFieldProps('encoding_aes_key', {
            validate: [{
                rules: [
                    { max: 43, message: 'EncodingAeskey 过长' },
                ],
            }],
        });

        return (
            <Modal
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.props.close}
                title="服务器设置"
            >
                <Form horizontal onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        hasFeedback
                        help={isFieldValidating('url') ? '校验中...' : (getFieldError('url') || []).join(', ')}
                        label="服务器地址："
                    >
                        <Input {...urlProps} type="text" placeholder="请输入服务器地址" />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="Token："
                        hasFeedback
                    >
                        <Input
                            {...tokenProps}
                            type="text"
                            placeholder="请输入 Token"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="传输方式："
                    >
                        <Select
                            {...modeProps}
                            defaultValue="ENCRYPTION"
                            style={{ width: 100 }}
                        >
                            <Option value="ENCRYPTION">加密</Option>
                            <Option value="EXPRESS">明文</Option>
                        </Select>
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        help="长度固定为43个字符，从a-z,A-Z,0-9共62个字符中选取"
                        label="EncodingAeskey："
                    >
                        <Input
                            {...aesKeyProps}
                            type="encoding_aes_key"
                            placeholder="请输入 43 位字符"
                        />
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

WechatEditForm.propTypes = {
    visible: PropTypes.bool,
    close: PropTypes.func,
    submit: PropTypes.func,
    data: PropTypes.object,
    form: PropTypes.object,
};

function onFieldsChange(props, fields) {
    if (fields.mode) {
        const modeValue = fields.mode.value;
        const data = { ...props.data, ...{ mode: modeValue } };

        props.updateData(data);
    }
}

function mapPropsToFields(props) {
    const wechatData = props.data;
    return {
        url: {
            value: wechatData.url,
        },
        token: {
            value: wechatData.token,
        },
        mode: {
            value: wechatData.mode,
        },
        encoding_aes_key: {
            value: wechatData.encoding_aes_key,
        },
    };
}

const Editor = Form.create({
    onFieldsChange,
    mapPropsToFields,
})(WechatEditForm);

export default Editor;
