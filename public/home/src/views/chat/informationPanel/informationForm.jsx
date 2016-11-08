import React, { PropTypes } from 'react';
import { Form, Input, message } from 'antd';

const FormItem = Form.Item;

class InformationForm extends React.Component {

    onKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.props.onBlur(e);
        }
    }

    render() {
        const { onBlur, formItemLayout } = this.props;
        const { getFieldProps } = this.props.form;
        const nameProps = getFieldProps('name');
        const remarkProps = getFieldProps('remark');
        const phoneProps = getFieldProps('phone');
        const emailProps = getFieldProps('email');

        let nickname = '';
        if (this.props.contact.nickname) {
            nickname = <FormItem
                {...formItemLayout}
                label="微信昵称："
            >
                <span>{this.props.contact.nickname}</span>
            </FormItem>;
        }

        return (
            <Form horizontal form={this.props.form}>
                <FormItem
                    {...formItemLayout}
                    label="姓名："
                >
                    <Input
                        {...nameProps}
                        className="default"
                        placeholder="姓名"
                        name="name"
                        onKeyDown={this.onKeyDown}
                        onBlur={onBlur}
                    />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="备注："
                >
                    <Input
                        {...remarkProps}
                        className="default"
                        placeholder="备注"
                        name="remark"
                        onKeyDown={this.onKeyDown}
                        onBlur={onBlur}
                    />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="手机："
                >
                    <Input
                        {...phoneProps}
                        className="default"
                        placeholder="手机"
                        name="phone"
                        onKeyDown={this.onKeyDown}
                        onBlur={onBlur}
                    />
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="邮箱："
                >
                    <Input
                        {...emailProps}
                        className="default"
                        placeholder="邮箱"
                        name="email"
                        onKeyDown={this.onKeyDown}
                        onBlur={onBlur}
                    />
                </FormItem>
                {nickname}
            </Form>
        );
    }
}

function mapPropsToFields(props) {
    return {
        name: {
            value: props.contact.name,
        },
        remark: {
            value: props.contact.remark,
        },
        phone: {
            value: props.contact.phone,
        },
        email: {
            value: props.contact.email,
        },
    };
}

InformationForm.propTypes = {
    contact: PropTypes.object.isRequired,
    onBlur: PropTypes.func.isRequired,
    formItemLayout: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
};

const informationForm = Form.create({
    mapPropsToFields,
})(InformationForm);

export default informationForm;
