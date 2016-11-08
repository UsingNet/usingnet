/**
 * Created by henry on 16-5-24.
 */
import React, { PropTypes } from 'react';
import { Row, Col, Popconfirm, message, Modal, Popover, Form, Select, InputNumber, Input,
        Switch, Radio, Button, Upload, Icon, Checkbox } from 'antd';
import QueueAnim from 'rc-queue-anim';
import store from 'network/store';
import CodePanel from './codePanel';
import OrderForm from './orderForm';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

const defaultInviteImg = '//o1hpnn7d6.qnssl.com/default-invite.png';

import './color-radio.less';
import './shape-radio.less';

class SiteFormClass extends React.Component {
    state = {
        customColor: '62a8ea',
        customColorVisible: false,
        customColorValidateStatus: '',
        customer_icon: null,
        logo: null,
        accessCodeVisible: false,
        showInviteForm: Boolean(this.props.data.invite),
        inviteFormPreviewText: this.props.data.invite_text.substr(0, 27),
        inviteImg: this.props.data.invite_img || defaultInviteImg,
        showCustomPosition: false
    };

    componentDidMount() {
        this.props.form.setFieldsValue(this.props.data);
        // const formData = this.props.data;
        // this.setState({
        //     customColor: formData['button_bg_color'] || '62a8ea',
        //     logo: formData['logo'],
        // });
        // if (formData['icon_shape'] == 'none') {
        //     this.setState({ customer_icon: formData.customer_icon });
        // }
        // this.props.form.setFieldsValue({ 'form_function': formData['type'] == 'ORDER' });
    }

    onColorChange = (e) => {
        this.setState({ customColor: e.target.value });
        this.props.form.setFieldsValue({ button_bg_color: e.target.value });
    };

    onSaveCustomColor = (e) => {
        e.preventDefault();
        const colorValue = e.target.querySelector('input').value;
        if (colorValue.match(/^([0-9a-fA-F]{3}){1,2}$/)) {
            this.setState({
                customColor: colorValue,
                customColorVisible: false,
                customColorValidateStatus: '',
            }, () => {
                this.props.form.setFieldsValue({ button_bg_color: colorValue });
            });
        } else {
            this.setState({ customColorValidateStatus: 'error' });
        }
    };

    onIconUpload = (e) => {
        if (e.fileList && e.fileList.length > 1) {
            e.fileList.shift();
        }
        if (e.file.status === 'done') {
            this.props.form.setFieldsValue({ icon_shape: 'custom' });
            if (e.file.response.code === 200) {
                this.props.form.setFieldsValue({ customer_icon: e.file.response.data });
                this.setState({ customer_icon: e.file.response.data });
            } else {
                message.error(e.file.response.msg);
            }
        }
    };

    onLogoUpload = (e) => {
        if (e.fileList && e.fileList.length > 1) {
            e.fileList.shift();
        }
        if (e.file.status === 'done') {
            // this.props.form.setFieldsValue({ icon_shape: 'none' });
            if (e.file.response.code === 200) {
                this.props.form.setFieldsValue({ logo: e.file.response.data });
                this.setState({ logo: e.file.response.data });
            } else {
                message.error(e.file.response.msg);
            }
        }
    }

    handleVisibleChange = (customColorVisible) => {
        this.setState({ customColorVisible });
    }

    showAccessCode = () => {
        this.setState({
            accessCodeVisible: true,
        });
    }

    hideAccessCode = () => {
        this.setState({
            accessCodeVisible: false,
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const formValues = this.props.form.getFieldsValue();
        const data = {
            ...formValues,
            ...{
                message_left_bg_color: 'fff',
                message_left_font_color: '000000',
                title_txt_color: 'ffffff',
                button_txt_color: 'ffffff',
                message_right_font_color: 'ffffff',
                message_right_bg_color: this.props.data.button_bg_color,
                title_bg_color: this.props.data.button_bg_color,
                order: this.props.data.order,
                logo: this.props.data.logo,
            },
        };
        // const state = this.state;
        // const props = this.props;

        // const apiValues = {
        //     button_bg_color: formValues['button_bg_color'],
        //     button_txt_color: 'ffffff',
        //     customer_icon: formValues['icon_shape'] == 'none' ? state['customer_icon'] : '',
        //     direction: formValues['direction'],
        //     icon_shape: formValues['icon_shape'],
        //     id: props.data.id,
        //     input_placeholder: formValues['input_placeholder'],
        //     logo: state['logo'],
        //     message_left_bg_color: 'fff',
        //     message_left_font_color: '000000',
        //     message_right_bg_color: formValues['button_bg_color'],
        //     message_right_font_color: 'ffffff',
        //     name: formValues['name'],
        //     page_bottom_distance: '0',
        //     page_distance: formValues['page_distance'],
        //     title_bg_color: formValues['button_bg_color'],
        //     title_txt_color: 'ffffff',
        //     type: formValues['form_function'] ? 'ORDER' : 'IM',
        //     welcome: formValues['welcome'],
        // };

        data.invite_img = this.state.inviteImg;
        data.customer_icon = (formValues['icon_shape'] == 'none' || formValues['icon_shape'] == 'custom') ? this.state['customer_icon'] : '';
        store.setting.web.save(data)
            .then((resp) => {
                if (resp.success) {
                    message.success('保存成功');
                } else {
                    message.error(resp.msg);
                }
            });
    };

    onShowInviteFormSwitchChange = (checked) => {
        this.setState({
            showInviteForm: checked
        });
    }

    onInviteTextChange = (event) => {
        this.setState({
            inviteFormPreviewText: event.target.value.substr(0, 27)
        });
    }

    render() {
        const { getFieldProps } = this.props.form;

        const self = this;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 18 },
        };

        const customColor = (
            <Form inline onSubmit={this.onSaveCustomColor}>
                <FormItem
                    style={{ width: 150 }}
                    validateStatus={ this.state.customColorValidateStatus }
                    help={ this.state.customColorValidateStatus === '' ? '' : '请输入16进制RGB颜色' }
                >
                    <Input
                        addonBefore="#"
                        placeholder="16进制RGB颜色"
                        defaultValue={this.props.data.button_bg_color}
                        style={{ width: 140 }}
                    />
                </FormItem>
                <FormItem style={{ marginLeft: 19, height: 45, verticalAlign: 'top', width: 54 }}>
                    <Button type="primary" htmlType="submit">确定</Button>
                </FormItem>
            </Form>
        );

        const typeProps = getFieldProps('type', {
            initialValue: 'IM',
        });

        const orderSelectProps = getFieldProps('order.title', {
            initialValue: this.props.data.order && this.props.data.order.length > 0 ? this.props.data.order[0].title : '',
            onChange(value) {
                self.props.onChangeOrderForm(value);
            },
        });

        let orderOptions = '';

        if (this.props.data.order) {
            orderOptions = this.props.data.order.map((item, index) => (
                <Option key={index} value={index}>{item.title}</Option>
            ));
        }

        let orderDiv = '';

        if (this.props.data.type === 'ORDER') {
            let orderList = '';
            if (!this.props.data.order) {
                this.props.data.order = [];
            }
            if (this.props.data.order.length > 0) {
                orderList = (
                    <FormItem
                        label="所有表单"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Select
                            {...orderSelectProps}
                        >
                            {orderOptions}
                        </Select>
                        <Button
                            type="ghost"
                            size="small"
                            onClick={this.props.onEditOrderForm}
                        >
                            修改
                        </Button>
                    </FormItem>
                );
            }
            orderDiv = (
                <div>
                    <h4>表单设置</h4>
                    {orderList}
                    <FormItem
                        label="表单操作"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Button
                            type="ghost"
                            size="small"
                            onClick={this.props.addOrderForm}
                        >
                            添加表单
                        </Button>
                    </FormItem>

                    <OrderForm
                        formEditVisible={this.props.formEditVisible}
                        orderFormData={this.props.orderFormData}
                        changeOrderItemType={this.props.changeOrderItemType}
                        addOrderFormItem={this.props.addOrderFormItem}
                        updateOrderForm={this.props.updateOrderForm}
                        updateOrderFormItemValue={this.props.updateOrderFormItemValue}
                        upOrderFormItem={this.props.upOrderFormItem}
                        downOrderFormItem={this.props.downOrderFormItem}
                        removeOrderFormItem={this.props.removeOrderFormItem}
                        completeEditOrderForm={this.props.completeEditOrderForm}
                        cancelEditOrderForm={this.props.cancelEditOrderForm}
                    />
                </div>
            );
        }

        const inviteImgUploadProps = {
            name: 'file',
            action: '/api/upload',
            fileList: [],
            onChange: (info) => {
                if (info.file.status === 'done') {
                    this.setState({
                        inviteImg: info.file.response.data
                    });
                } else if (info.file.status === 'error') {
                    Message.error('上传失败');
                }
            },
        };

        return (
            <div className="form-wapper">
                <Input
                    {...getFieldProps('id')}
                    type="hidden"
                />
                <Form horizontal onSubmit={this.handleSubmit}>
                    <h4>通用设置</h4>
                    <FormItem label="网站名称：" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <Input {...getFieldProps('name', { initialValue: '' })} />
                    </FormItem>

                    <FormItem
                        label="对话框的颜色："
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                        className="color-radio"
                    >
                        <RadioGroup
                            {...getFieldProps('button_bg_color', { initialValue: '62a8ea' })}
                            onChange={this.onColorChange}
                        >
                            <Radio key="f96868" value={'f96868'}>
                                <div style={{ background: '#f96868' }}></div>
                            </Radio>
                            <Radio key="f2a654" value={'f2a654'}>
                                <div style={{ background: '#f2a654' }}></div>
                            </Radio>
                            <Radio key="926dde" value={'926dde'}>
                                <div style={{ background: '#926dde' }}></div>
                            </Radio>
                            <Radio key="57c7d4" value={'57c7d4'}>
                                <div style={{ background: '#57c7d4' }}></div>
                            </Radio>
                            <Radio key="62a8ea" value={'62a8ea'}>
                                <div style={{ background: '#62a8ea' }}></div>
                            </Radio>
                            <Radio key="46be8a" value={'46be8a'}>
                                <div style={{ background: '#46be8a' }}></div>
                            </Radio>
                            <Radio key="526069" value={'526069'}>
                                <div style={{ background: '#526069' }}></div>
                            </Radio>
                            <Radio
                                className="custom"
                                key="custom"
                                value={this.props.data.button_bg_color}
                                ref="customColor"
                            >
                                <div>
                                    <Popover
                                        content={customColor}
                                        title="自定义颜色"
                                        trigger="click"
                                        visible={this.state.customColorVisible}
                                        onVisibleChange={this.handleVisibleChange}
                                    >
                                        <Button
                                            style={{ background: `#${this.props.data.button_bg_color}` }}
                                            type="primary"
                                        >
                                        自定义
                                        </Button>
                                    </Popover>
                                </div>
                            </Radio>
                        </RadioGroup>
                    </FormItem>

                    <FormItem label="网站Logo：" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
                        <Upload
                            onPreview={(file) => { window.open(file.url); }}
                            name="file"
                            accept="image/*"
                            action="/api/upload"
                            listType="picture-card"
                            onChange={this.onLogoUpload}
                            defaultFileList={this.props.data.logo ? [{
                                uid: -1,
                                name: 'logo',
                                status: 'done',
                                url: this.props.data.logo,
                                thumbUrl: this.props.data.logo,
                            }] : []}
                        >
                            <Icon type="plus" />
                            <div className="ant-upload-text">点击上传</div>
                        </Upload>
                    </FormItem>

                    <FormItem label="占位文字：" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <Input
                            placeholder=""
                            {...getFieldProps('input_placeholder', { initialValue: '' })}
                        />
                    </FormItem>

                    <FormItem label="欢迎语：" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <Input
                            {...getFieldProps('welcome', { initialValue: '' })}
                            type="textarea"
                            style={{ height: 100 }}
                        />
                    </FormItem>

                    <FormItem
                        label="入口样式："
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                        className="shape-radio"
                    >
                        <RadioGroup
                            {...getFieldProps('icon_shape', { initialValue: '62a8ea' })}
                        >
                            <Radio key="bar" value={'bar'}>
                                <div>
                                    <div
                                        style={{
                                            margin: '15px 0 0 0',
                                            background: `#${this.props.data.button_bg_color}`,
                                            width: 35,
                                            height: 123,
                                            borderRadius: 17,
                                            position: 'relative',
                                        }}
                                    >
                                        <img
                                            role="presentation"
                                            src="/resource/images/web-plugin-icon-bar.png"
                                        />
                                    </div>
                                </div>
                            </Radio>
                            <Radio key="square" value={'square'}>
                                <div>
                                    <div
                                        style={{
                                            margin: '15px 0 0 0',
                                            background: `#${this.props.data.button_bg_color}`,
                                            width: 72,
                                            height: 72,
                                            borderRadius: 0,
                                            position: 'relative',
                                        }}
                                    >
                                        <img
                                            role="presentation"
                                            style={{ position: 'absolute', left: 0 }}
                                            src="/resource/images/web-plugin-icon-square.png"
                                        />
                                    </div>
                                </div>
                            </Radio>

                            <Radio key="circle" value={'circular'}>
                                <div>
                                    <div
                                        style={{
                                            margin: '15px 0 0 0',
                                            background: `#${this.props.data.button_bg_color}`,
                                            width: 70,
                                            height: 70,
                                            borderRadius: 35,
                                            position: 'relative',
                                        }}
                                    >
                                        <img
                                            role="presentation"
                                            style={{ position: 'absolute', left: 0 }}
                                            src="/resource/images/web-plugin-icon-circle.png"
                                        />
                                    </div>
                                </div>
                            </Radio>
                            <Radio className="custom" key="none" value="none" ref="customShap">
                                <div>
                                    <Upload
                                        name="file"
                                        action="/api/upload"
                                        onChange={this.onIconUpload}
                                        accept="image/*"
                                    >
                                        <Button
                                            style={{
                                                backgroundColor: `${this.props.data.customer_icon ? '' : '#ddd'}`,
                                                border: 0, fontSize: 16, color: '#fff',
                                            }}
                                            type="ghost"
                                        >
                                            {this.props.data.customer_icon
                                                ? <img
                                                    role="presentation"
                                                    style={{ width: 70 }}
                                                    src={this.props.data.customer_icon}
                                                /> : '自定义'}
                                        </Button>
                                    </Upload>
                                </div>
                            </Radio>
                        </RadioGroup>
                    </FormItem>

                    <FormItem label="入口位置：" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <Select
                            {...getFieldProps('direction', { initialValue: 'bottom-right' })}
                            style={{ width: 70, marginRight: 12 }}
                        >
                            <Option value="bottom-right">右下</Option>
                            <Option value="bottom-left">左下</Option>
                            <Option value="middle-right">右中</Option>
                            <Option value="middle-left">左中</Option>
                        </Select>
                        <span>
                            <label>距页边：</label>
                            <InputNumber
                                {...getFieldProps('page_distance', { initialValue: 0 })}
                                min={0}
                                max={360}
                                placeholder="距页面边距"
                            />&nbsp;

                            <label>距页脚：</label>
                            <InputNumber
                                {...getFieldProps('page_bottom_distance', { initialValue: 0 })}
                                min={0}
                                max={360}
                                placeholder="距页脚边距"
                            />
                        </span>
                    </FormItem>

                    <FormItem label=""　labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>

                    </FormItem>

                    <FormItem label='分组设置' labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <span>让用户进入对话时选择分组&nbsp;</span>
                        <Switch
                            checkedChildren="开"
                            unCheckedChildren="关"
                            { ...getFieldProps('display_agent_group', {
                                valuePropName: 'checked',
                                 initialValue: Boolean(this.props.data.display_agent_group)
                            }) } />
                    </FormItem>

                    {/*<FormItem label="页面边距：" labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                        <InputNumber
                            placeholder="边距"
                            min={0}
                            max={360}
                        />px
                    </FormItem>*/}


                    <h4>邀请设置</h4>
                    <FormItem
                        label='自动邀请'
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}>
                        <span>客户访问你的网站时，系统可以自动向其发出对话邀请&nbsp;</span>
                        <Switch
                            checkedChildren="开"
                            unCheckedChildren="关"
                            { ...getFieldProps('invite', {
                                 valuePropName: 'checked',
                                 initialValue: Boolean(this.props.data.invite),
                                 onChange: this.onShowInviteFormSwitchChange
                            }) } />
                    </FormItem>
                    <QueueAnim type="bottom" leaveReverse>

                        { this.state.showInviteForm ? [

                            <FormItem
                                key='1'
                                label='邀请时间'
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 18 }}>
                                <span>在客户访问网站&nbsp;</span>
                                <InputNumber min={ 0 } max={ 1800 } style={{ width: 66, marginRight: 0 }} { ...getFieldProps('invite_wait_time', {
                                        initialValue: this.props.data.invite_wait_time
                                    }) }  />
                                <span>&nbsp;秒后发出对话邀请</span>
                            </FormItem>,

                            <FormItem
                                key='2'
                                label='关闭后不再弹出'
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 18 }}>
                                <Switch
                                    checkedChildren="开"
                                    unCheckedChildren="关"
                                    { ...getFieldProps('invite_closed', {
                                        valuePropName: 'checked',
                                        initialValue: Boolean(this.props.data.invite_closed)
                                    }) } />
                            </FormItem>,

                            <FormItem
                                key='3'
                                label='邀请文字'
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 18 }}
                                hasFeedback>
                                <Input
                                    { ...getFieldProps('invite_text', {
                                        onChange: this.onInviteTextChange
                                    }) }
                                    type='textarea'
                                    value={ this.state.inviteFormPreviewText }
                                    autoComplete="off"
                                    rows={ 4 }
                                    style={{ width: 300 }}  />

                                <div className="invite-preview">
                                    <span>预览</span>
                                    <div>
                                        <img src={ this.state.inviteImg } />
                                        <p>{ this.state.inviteFormPreviewText }</p>
                                        <i className="inviteClose"></i>
                                    </div>
                                </div>
                            </FormItem>,

                            <FormItem
                                key='4'
                                label='图片设置'
                                labelCol={{ span: 4 }}
                                wrapperCol={{ span: 18 }}>
                                <Input
                                    { ...getFieldProps('invite_img', {
                                        initialValue: this.state.inviteImg
                                    }) }
                                    value={ this.state.inviteImg }
                                    style={{ display: 'none' }} />
                                <Button size='default' onClick={ () => this.setState({ inviteImg: defaultInviteImg }) }>使用默认图片</Button>
                                <Upload { ...inviteImgUploadProps }>
                                    <Button style={{ marginLeft: 10 }}>
                                        <Icon type="upload" /> 上传自定义图片
                                    </Button>
                                </Upload>
                            </FormItem>

                        ] : null }

                    </QueueAnim>



                    <h4>模式设置</h4>
                    <FormItem
                        label="默认模式"
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <RadioGroup
                            {...typeProps}
                        >
                            <Radio key="im-lm" value="IM-LM">
                                对话和留言
                            </Radio>
                            <Radio key="im" value="IM">
                                对话
                            </Radio>
                            <Radio key="order" value="ORDER">
                                表单
                            </Radio>
                        </RadioGroup>
                    </FormItem>

                    {orderDiv}

                    {/*<FormItem
                        label="表单功能："
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                    >
                        <Switch {...getFieldProps('form_function', { valuePropName: 'checked' })} />
                    </FormItem>*/}

                    <FormItem
                        className="submit"
                        wrapperCol={{ span: 16, offset: 4 }}
                        style={{ marginTop: 24 }}
                    >
                        <Button type="primary" htmlType="submit">
                            确定
                        </Button>
                        <Popconfirm
                            title="确认删除当前对站点？"
                            placement="top"
                            onConfirm={this.props.onRemove}
                        >
                            <Button
                                size="large"
                                className={this.props.sites.length === 1 ? 'hide' : ''}
                            >
                                删除
                            </Button>
                        </Popconfirm>
                    </FormItem>

                </Form>
                <div className="preview">
                    <div
                        style={{
                            transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
                            background: `#${this.props.data.button_bg_color}`,
                            display: 'inline-block',
                            height: 244,
                            width: 230,
                            boxShadow: '0 0 8px #999',
                        }}
                    >
                        <img
                            role="presentation"
                            src="/resource/images/web-plugin-preview.png"
                        />
                    </div>

                    <div style={{ marginTop: 10 }}>
                        <Button
                            type="primary"
                            disabled={!this.props.data.id}
                            onClick={this.showAccessCode}
                        >
                            查看接入代码
                        </Button>
                        <Modal
                            title="接入代码"
                            width={700}
                            visible={this.state.accessCodeVisible}
                            onCancel={this.hideAccessCode}

                            footer={
                                <Button type="primary" onClick={this.hideAccessCode}>关闭</Button>
                            }
                        >
                            <CodePanel tid={this.props.data.id} />
                        </Modal>
                    </div>
                </div>
            </div>);
    }
}

SiteFormClass.propTypes = {
    changeOrderItemType: PropTypes.func,
    addOrderFormItem: PropTypes.func.isRequired,
    onEditOrderForm: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    sites: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    formEditVisible: PropTypes.bool,
    orderFormData: PropTypes.object,
    cancelEditOrderForm: PropTypes.func,
    updateOrderForm: PropTypes.func,
    upOrderFormItem: PropTypes.func,
    downOrderFormItem: PropTypes.func,
    removeOrderFormItem: PropTypes.func,
    updateOrderFormItemValue: PropTypes.func,
    completeEditOrderForm: PropTypes.func,
};

function onFieldsChange(props, fields) {
    props.updateSite(fields);
}

const SiteForm = Form.create({
    onFieldsChange,
})(SiteFormClass);
export default SiteForm;
