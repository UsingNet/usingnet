import React, { PropTypes } from 'react';
import { Button, Form, Input, Upload, Icon, Message, Radio } from 'antd';
import Store from 'network/store';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class AccessForm extends React.Component {
    state = {
        submitButtonLoading: false,
    };

    onPicUploaded = (info) => {
        if (info.file.status === 'done') {
            if (info.file.response.code !== 200) {
                info.fileList.pop();
                Message.error(info.file.response.msg);
                this.setState({
                    fileList: info.fileList,
                });
            } else if (info.file.response.code === 200) {
                info.fileList.unshift(info.fileList.pop());
                info.fileList = info.fileList.slice(0, 2);
                this.setState({
                    fileList: info.fileList,
                });
            }
        }
    }

    onPicPreview = (file) => {
        window.open(file.url);
    }

    onSubmitForm = () => {
        this.setState({
            submitButtonLoading: true,
        });

        const data = this.props.form.getFieldsValue();
        data.display_number_files = this.refs.uploadComponent.state.fileList.map((e) => ({
            name: e.name,
            url: e.url || e.response.data,
        }));

        Store.setting.voip.save(data).then((resp) => {
            if (resp.success) {
                Message.success('提交成功');
            } else {
                Message.error(resp.msg);
            }
        }).always(() => {
            setTimeout(() => {
                this.setState({
                    submitButtonLoading: false,
                });
            }, 1000);
        });
    }

    render() {
        const { getFieldProps } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 },
        };

        const voip = this.props.voip;
        const uploadProps = {
            name: 'file',
            action: '/api/upload',
            listType: 'picture',
            accept: 'image/*',
            onChange: this.onPicUploaded,
            onPreview: this.onPicPreview,
            fileList: (this.state.fileList || voip.display_number_files).map((e, i) => {
                e.uid = i;
                if (!e.url) {
                    e.url = e.response.data;
                }
                return e;
            }),
        };

        return (
            <Form horizontal form={this.props.form}>
                <FormItem {...formItemLayout} label="虚拟号码：">
                    <span className="phone-number">{voip.number}</span>
                </FormItem>
                <FormItem {...formItemLayout} label="绑定的固话号码" className="number-to-bind-input">
                    <Input
                        {...getFieldProps('display_number', {
                            initialValue: voip.display_number,
                        })}
                        type="number"
                    />
                </FormItem>

                <FormItem { ...formItemLayout } label="是否开启评价：">
                    <RadioGroup
                        {...getFieldProps('evaluation', {
                            initialValue: voip.evaluation,
                        })}
                    >
                        <Radio key="1" value={1}>是</Radio>
                        <Radio key="0" value={0}>否</Radio>
                    </RadioGroup>
                    <span style={{ color: '#E53935' }}>（此功能需要先开通短信接入）</span>
                </FormItem>

                <FormItem {...formItemLayout} label="协议文件：">
                    <span>请下载协议文件手工填写后上传扫描件或照片，点击下载：
                        <a href="http://7xouvh.com1.z0.glb.clouddn.com/号码透传证明.docx">号码透传证明</a>，
                        <a href="http://7xouvh.com1.z0.glb.clouddn.com/透传承诺函.docx">透传承诺函</a>
                    </span>
                </FormItem>
                <FormItem {...formItemLayout} label="上传协议文件：">
                    <Upload {...uploadProps} className="upload-list-inline" ref="uploadComponent">
                        <Button type="ghost">
                            <Icon type="upload" /> 点击上传
                        </Button>
                    </Upload>
                </FormItem>
                <FormItem {...formItemLayout} label=" " className="hide-form-colon">
                    <Button
                        type="primary"
                        onClick={this.onSubmitForm} loading={this.state.submitButtonLoading}
                    >
                        提交
                    </Button>
                    <Button
                        type="primary"
                        style={{ marginLeft: 10 }}
                        onClick={this.props.jumpToTheLastStep}
                    >
                        跳过
                    </Button>
                </FormItem>
            </Form>
        );
    }
}

AccessForm.propTypes = {
    form: PropTypes.object.isRequired,
    voip: PropTypes.object.isRequired,
    jumpToTheLastStep: PropTypes.func.isRequired,
};

export default Form.create({})(AccessForm);
