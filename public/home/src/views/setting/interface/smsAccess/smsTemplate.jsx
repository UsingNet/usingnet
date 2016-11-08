import React from 'react';
import { Card, Table, Button, Popconfirm, Message, Form, Modal, Input, Alert } from 'antd';
import Store from 'network/store';

const FormItem = Form.Item;

class SmsTemplateForm extends React.Component {

    componentDidMount() {
        this.props.form.setFieldsValue(this.props.data);
    }

    render() {
        const { getFieldProps } = this.props.form;

        const formItemLayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 18 }
        };

        return (
            <Form horizontal form={ this.props.form }>
                <FormItem { ...formItemLayout } style={{ display: 'none' }}>
                    <Input { ...getFieldProps('id', {}) } type="text" autoComplete="off" />
                </FormItem>

                <FormItem { ...formItemLayout } label="模板标题">
                    <Input
                        { ...getFieldProps('title', {
                            rules: [
                                { required: true, whitespace: true, message: '模板标题不能为空' }
                            ]
                        }) }
                        type="text"
                        autoComplete="off" />
                </FormItem>

                <FormItem { ...formItemLayout } label="模板正文">
                    <Input
                        { ...getFieldProps('content', {
                            rules: [
                                { required: true, whitespace: true, message: '模板正文不能为空' }
                            ]
                        }) }
                        type="textarea"
                        maxLength={500}
                        autoComplete="off"
                        rows={ 4 }
                        placeholder="例：尊敬的#name#：您的电话#phone#已经绑定成功。" />
                </FormItem>

                <FormItem { ...formItemLayout } label=" ">
                    <section>
                        <Alert message="模板样例：尊敬的#name#：您的电话#phone#已经绑定成功。（变量使用##包裹）" type="info" showIcon />
                        <h5>添加模板时请注意，以下类型的模板不能通过审核：</h5>
                        <ol>
                            <li>涉及房产、贷款、移民、成人用品、政治、色情、暴力、赌博以及其他违法信息不能发送。</li>
                            <li>含有病毒、恶意代码、色情、反动等不良信息或有害信息。</li>
                            <li>冒充任何人或机构，或以虚伪不实的的方式谎称或使人误认为与任何人或任何机构有关。</li>
                            <li>侵犯他人著作权或其他知识产权、或违反保密、雇佣或不披露协议披露他人商业秘密或保密信息。</li>
                            <li>粗话、脏话等不文明的内容; 让短信接收者难以理解的内容。</li>
                            <li>主题不明确的模板，如：您好#content#,亲爱的用户#content#。</li>
                            <li>营销、广告类的短信不能发送-这类短信为：通过一些方式（打折，促销等）吸引客户过来参与一些活动，或购买一些产品或服务。</li>
                        </ol>
                    </section>
                </FormItem>
            </Form>
        );
    }
}

SmsTemplateForm = Form.create({})(SmsTemplateForm);

export default class SmsTemplate extends React.Component {
    state = {
        loading: true,
        scrollHeight: 0
    };

    componentDidMount() {
        window.addEventListener('resize', this.onWindowResize);
        Store.sms.template.subscribe(this.onSmsTemplateLoaded, false);
        Store.sms.template.load();
        this.onWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onWindowResize);
        Store.sms.template.unsubscribe(this.onSmsTemplateLoaded);
    }

    onSmsTemplateLoaded = (e) => {
        const data = e.data;
        this.setState({
            dataSource: data.data,
            loading: false,
            total: data.total,
            currentPage: data.currentPage
        });
    }

    onTableChange = (pagination, filters, sorter) => {
        return;
        this.queryParams ? '' : this.queryParams = {};
        this.queryParams.page = pagination.current;
        Store.sms.template.load(this.queryParams);
    }

    onWindowResize = () => {
        const height = document.querySelector('.sms-setting').offsetHeight - 367;
        this.setState({ scrollHeight: height });
    }

    onConfirmDelete = (record) => {
        Store.sms.template.remove(record.id)
        .then(resp => {
            if (resp.success) {
                Message.success('删除成功');
            }
        });
    }

    onEditButtonClick = (record = { id: '', title: '', content: '' }) => {
        const title = record.id ? '编辑模板' : '新增模板';
        this.setState({
            modalTitle: title,
            modalVisible: true,
            modalData: record
        });
        if (this.refs.smsTemplateForm) {
            this.refs.smsTemplateForm.setFieldsValue(record);
        }
    }

    handleModalCancel = () => {
        this.setState({
            modalVisible: false
        });
    }

    handleModalOk = () => {
        this.refs.smsTemplateForm.getForm().validateFields((errors, values) => {
            if (!errors) {
                Store.sms.template.save(this.refs.smsTemplateForm.getFieldsValue())
                .then(resp => {
                    if (resp.success) {
                        Message.success('保存成功');
                        this.setState({
                            modalVisible: false
                        });
                    }
                });
            }
        });

        // const form = this.refs.smsTemplateForm;
        // const data = form.getFieldsValue();
        // Store.sms.template.save(data)
        // .then(resp => {
        //     if (resp.success) {
        //         Message.success('保存成功');
        //         this.setState({
        //             modalVisible: false
        //         });
        //     }
        // });
    }

    render() {
        const pagination = {
            total: this.state.total,
            current: this.state.currentPage,
            pageSize: 20,
            size: 'default',
            showTotal: (total) => { return `共${total}条`; },
        };

        const columns = [
            { title: '模板标题', dataIndex: 'title', width: '15%' },
            { title: '模板', dataIndex: 'content', width: '55%' },
            { title: '状态', dataIndex: 'status', width: '15%', render: (value, record) => {
                const textMap = {
                    CHECKING: '审核中',
                    FAIL: '审核失败',
                    SUCCESS: '审核通过'
                };
                const colorMap = {
                    CHECKING: 'template-checking-status',
                    FAIL: 'template-fail-status',
                    SUCCESS: 'template-success-status'
                };

                return (
                    <span className={ colorMap[value] }>{ textMap[value] }</span>
                );
            } },
            { title: '操作', width: '15%', render: (value, record) => (
                <span className="tableAction">
                    <Button type="ghost" icon="edit" onClick={ () => this.onEditButtonClick(record) } />
                    <span className="ant-divider"></span>
                    <Popconfirm title="确定要删除这个模板吗？" onConfirm={ () => this.onConfirmDelete(record) }>
                        <Button type="ghost" icon="delete" />
                    </Popconfirm>
                </span>
            ) },
        ];

        return (
            <Card title="短信模板" className="sms-template-table">
                <Button
                    icon="plus"
                    className="add-template"
                    onClick={ () => { this.onEditButtonClick(); } }>
                    添加短信模板
                </Button>
                <Table
                    size="middle"
                    rowKey={ record => record.id }
                    columns={ columns }
                    pagination={ false }
                    dataSource={ this.state.dataSource }
                    loading={ this.state.loading }
                    scroll={{ y: this.state.scrollHeight }}
                    onChange={ this.onTableChange }
                     />
                 <Modal
                     title={ this.state.modalTitle }
                     visible={ this.state.modalVisible }
                     onOk={ this.handleModalOk }
                     onCancel={ this.handleModalCancel }
                     okText="提交"
z                    width={ 783 }
                     closable={ false }
                     className="sms-template-editor">
                     <SmsTemplateForm data={ this.state.modalData } ref="smsTemplateForm" />
                 </Modal>
            </Card>
        );
    }
}
