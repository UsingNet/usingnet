import React, { PropTypes } from 'react';
import { Form, Input, Modal } from 'antd';
const FormItem = Form.Item;

class WeiboGeneralEditorForm extends React.Component {

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
                this.props.submit(data, 'general');
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

        const defaultReplyProps = getFieldProps('default_reply');
        const notOnlineReplyProps = getFieldProps('not_online_agent_reply');

        return (
            <Modal
                visible={this.props.visible}
                onOk={this.onOk}
                onCancel={this.props.close}
                title="自动回复"
            >
                <Form horizontal form={this.props.form}>
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
                </Form>
            </Modal>
        );
    }
}

WeiboGeneralEditorForm.propTypes = {
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
        default_reply: {
            value: weiboData.default_reply,
        },
        not_online_agent_reply: {
            value: weiboData.not_online_agent_reply,
        },
    };
}

const Editor = Form.create({
    mapPropsToFields,
})(WeiboGeneralEditorForm);

export default Editor;
