import React, { PropTypes } from 'react';
import { Button, Form, Upload, Radio } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class AccessCheckingForm extends React.Component {
    onPicPreview = (file) => {
        window.open(file.url);
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
        };
        const voip = this.props.voip;
        const uploadProps = {
            listType: 'picture',
            onPreview: this.onPicPreview,
            fileList: voip.display_number_files.map((e, i) => {
                e.uid = i;
                return e;
            }),
        };
        return (
            <Form horizontal>
                <FormItem {...formItemLayout} label="虚拟号码：">
                    <span className="phone-number">{voip.number}</span>
                </FormItem>
                <FormItem {...formItemLayout} label="绑定的固话号码：">
                    <span className="phone-number">{voip.display_number}</span>
                </FormItem>
                <FormItem { ...formItemLayout } label="开启评价：">
                    <RadioGroup
                        defaultValue={voip.evaluation}
                    >
                        <Radio key="1" value={1}>是</Radio>
                        <Radio key="0" value={0}>否</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem {...formItemLayout} label="协议文件：">
                    <Upload {...uploadProps} className="upload-list-inline phone-access-checking" />
                </FormItem>
                <FormItem { ...formItemLayout } label=" " className="hide-form-colon">
                    <Button type="primary" loading>正在审核协议文件</Button>
                    <Button
                        type="primary"
                        style={{ marginLeft: 10 }}
                        onClick={this.props.jumpToTheLastStep}
                    >
                        跳过
                    </Button>
                    <a onClick={this.props.backToEdit} style={{ marginLeft: 10 }}>返回修改</a>
                </FormItem>
            </Form>
        );
    }
}

AccessCheckingForm.propTypes = {
    backToEdit: PropTypes.func.isRequired,
    jumpToTheLastStep: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
    voip: PropTypes.object.isRequired,
};

export default Form.create({})(AccessCheckingForm);
