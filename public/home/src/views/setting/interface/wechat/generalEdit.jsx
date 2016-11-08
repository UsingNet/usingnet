import React, { PropTypes } from 'react';
import { Form, Input, Modal, Select, Radio } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class WechatGenernalEditForm extends React.Component {

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
        this.props.submit(data, 'general');
    }

    render() {
        const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };

        // validator
        const subscribeReplyProps = getFieldProps('subscribe_reply');
        const defaultReplyProps = getFieldProps('default_reply');
        const notOnlineReplyProps = getFieldProps('not_online_agent_reply');

        return (
            <Modal
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.props.close}
                title="自动回复"
            >
                <Form horizontal onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="关注回复"
                    >
                        <Input
                            {...subscribeReplyProps}
                            type="text"
                            placeholder="关注公众号时回复消息"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="默认回复"
                    >
                        <Input
                            {...defaultReplyProps}
                            type="text"
                            placeholder="默认回复"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="无客服自动回复"
                    >
                        <Input
                            {...notOnlineReplyProps}
                            type="text"
                            placeholder="无客服自动回复"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="是否开启评价"
                    >
                        <RadioGroup
                            {...getFieldProps('evaluation')}
                        >
                            <Radio key="1" value={1}>是</Radio>
                            <Radio key="0" value={0}>否</Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

WechatGenernalEditForm.propTypes = {
    visible: PropTypes.bool,
    close: PropTypes.func,
    submit: PropTypes.func,
    data: PropTypes.object,
    form: PropTypes.object,
};

// function onFieldsChange(props, fields) {
//     if (fields.mode) {
//         const modeValue = fields.mode.value;
//         const data = { ...props.data, ...{ mode: modeValue } };
//
//         props.updateData(data);
//     }
// }

function mapPropsToFields(props) {
    const wechatData = props.data;
    return {
        default_reply: {
            value: wechatData.default_reply,
        },
        not_online_agent_reply: {
            value: wechatData.not_online_agent_reply,
        },
        evaluation: {
            value: wechatData.evaluation,
        },
    };
}

const Editor = Form.create({
    mapPropsToFields,
})(WechatGenernalEditForm);

export default Editor;
