import React, { PropTypes } from 'react';
import { Form, Input, Button, message } from 'antd';
import Store from 'network/store';
import apiConfig from 'config';
import config from 'network/store_config';
import reqwest from 'reqwest';
import './plugin.less';

const FormItem = Form.Item;

class PluginForm extends React.Component {

    state = {
        pluginData: {},
    }

    componentDidMount() {
        const pluginSettingUrl = config.setting.plugin.url;
        reqwest({
            url: apiConfig.api + pluginSettingUrl,
        }).then(resp => {
            if (resp.code === 408 || resp.code === 409) {
                location.href = apiConfig.login;
            }

            if (resp.success) {
                this.pluginDataLoaded(resp);
            }
        });
    }

    pluginDataLoaded = (resp) => {
        this.setState({
            pluginData: resp.data,
        });

        this.props.form.setFieldsValue(this.state.pluginData);
    }

    handleSubmit = (e) => {
        e.preventDefault();

        // eslint-disable-next-line no-unused-vars, consistent-return
        const data = this.props.form.getFieldsValue();
        Store.setting.plugin.save(data).then(resp => {
            if (resp.success) {
                message.success('保存成功');
            }
        });
    }

    render() {
        const { getFieldProps } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 1 },
            wrapperCol: { span: 18 },
        };

        const callbackInputProps = getFieldProps('callback', {
            validate: [{
                rules: [
                    { required: true, message: '回调地址不能为空' },
                    { type: 'url', message: '请输入正确的 URL' },
                ],
                trigger: 'onBlur',
            }],
        });

        const pluginInputProps = getFieldProps('plugin', {
            validate: [{
                rules: [
                    { required: true, message: '插件地址不能为空' },
                    { type: 'url', message: '请输入正确的 URL' },
                ],
                trigger: 'onBlur',
            }],
        });

        const secretInputProps = getFieldProps('secret', {
            validate: [{
                rules: [
                    { required: true, message: '密匙不能为空' },
                ],
                trigger: 'onBlur',
            }],
        });

        return (
            <div className="plugin">
                <h3>插件</h3>
                <Form horizontal form={this.props.form}>
                    <FormItem
                        {...formItemLayout}
                        label="回调地址"
                        hasFeedback
                    >
                        <Input
                            {...callbackInputProps}
                            type="text"
                            id="callback"
                            placeholder="推荐使用https"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="插件地址"
                        hasFeedback
                    >
                        <Input
                            {...pluginInputProps}
                            type="text"
                            id="plugin"
                        />
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="请求密钥"
                        hasFeedback
                    >
                        <Input
                            {...secretInputProps}
                            type="text"
                            id="secret"
                        />
                    </FormItem>

                    <Button type="primary" onClick={this.handleSubmit}>保存</Button>
                </Form>

                <div className="helper">
                    <h3>帮助</h3>
                    <a target="_blank" href="http://www.usingnet.com/developer/%E5%AE%A2%E6%9C%8D%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91/%E5%AE%A2%E6%9C%8D%E6%8F%92%E4%BB%B6%E5%BC%80%E5%8F%91.html">
                    开发文档
                    </a>
                </div>
            </div>
        );
    }
}

PluginForm.propTypes = {
    form: PropTypes.object,
};

const Plugin = Form.create()(PluginForm);

export default Plugin;
